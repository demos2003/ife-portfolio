import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const aboutMeSchema = z.object({
  content: z.string().min(1, 'Content is required and must not be empty'),
})

const DEFAULT_ABOUT = "I'm a passionate video editor and content strategist with over 5 years of experience creating compelling visual stories."

export async function GET() {
  try {
    const db = await getDb()
    const siteContent = await db.collection('sitecontents').findOne({})
    const aboutText = (siteContent?.about as { description?: string } | undefined)?.description || DEFAULT_ABOUT
    return NextResponse.json({ content: aboutText })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Failed to load About Me content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { content } = aboutMeSchema.parse(body)

    const db = await getDb()
    const existing = await db.collection('sitecontents').findOne({})

    if (existing) {
      const about = (existing.about as Record<string, unknown> | undefined) ?? {}
      await db.collection('sitecontents').updateOne(
        { _id: existing._id },
        { $set: { about: { title: about.title || 'About Me', ...about, description: content, skills: about.skills || [] }, updatedAt: new Date() } }
      )
    } else {
      await db.collection('sitecontents').insertOne({
        about: { title: 'About Me', description: content, skills: [] },
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ success: true, content })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update About Me content' }, { status: 500 })
  }
}
