import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const skillSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
})

const aboutContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  skills: z.array(skillSchema).optional().default([]),
})

const contactContentSchema = z.object({
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  resumeUrl: z.string().url().optional().or(z.literal('')).nullable(),
  rateCardUrl: z.string().url().optional().or(z.literal('')).nullable(),
})

const updateSiteContentSchema = z.object({
  type: z.enum(['about', 'contact']),
  content: z.union([aboutContentSchema, contactContentSchema]),
})

export async function GET() {
  try {
    const db = await getDb()
    const content = await db.collection('sitecontents').findOne({})
    if (!content) return NextResponse.json({ about: null, contact: null })
    return NextResponse.json({ about: content.about ?? null, contact: content.contact ?? null })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Failed to load site content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { type, content } = updateSiteContentSchema.parse(body)

    const db = await getDb()
    const existing = await db.collection('sitecontents').findOne({})

    if (type === 'about') {
      const aboutData = aboutContentSchema.parse(content)
      if (existing) {
        await db.collection('sitecontents').updateOne(
          { _id: existing._id },
          { $set: { about: aboutData, updatedAt: new Date() } }
        )
      } else {
        await db.collection('sitecontents').insertOne({ about: aboutData, updatedAt: new Date() })
      }
      return NextResponse.json({ success: true, content: aboutData })
    }

    if (type === 'contact') {
      const contactData = contactContentSchema.parse(content)
      const contactDoc = { email: contactData.email, phone: contactData.phone, resumeUrl: contactData.resumeUrl || null }
      if (existing) {
        await db.collection('sitecontents').updateOne(
          { _id: existing._id },
          { $set: { contact: contactDoc, updatedAt: new Date() } }
        )
      } else {
        await db.collection('sitecontents').insertOne({ contact: contactDoc, updatedAt: new Date() })
      }
      return NextResponse.json({ success: true, content: contactDoc })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update site content' }, { status: 500 })
  }
}
