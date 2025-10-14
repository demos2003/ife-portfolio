import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
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
  resumeUrl: z.string().url().optional().or(z.literal('')),
})

const updateSiteContentSchema = z.object({
  type: z.enum(['about', 'contact'], {
    errorMap: () => ({ message: 'Invalid type. Must be "about" or "contact"' })
  }),
  content: z.union([aboutContentSchema, contactContentSchema]),
})

// GET /api/site-content - Get about and contact content
export async function GET() {
  try {
    const content = await prisma.siteContent.findFirst()

    if (!content) {
      return NextResponse.json({ about: null, contact: null })
    }

    return NextResponse.json({
      about: content.about,
      contact: content.contact,
    })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to load site content' },
      { status: 500 }
    )
  }
}

// PUT /api/site-content - Update about or contact content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content } = updateSiteContentSchema.parse(body)

    if (type === 'about') {
      const aboutData = aboutContentSchema.parse(content)

      // Upsert the site content with about data
      const updated = await prisma.siteContent.upsert({
        where: { id: 'default' },
        update: {
          about: aboutData,
          updatedAt: new Date(),
        },
        create: {
          id: 'default',
          about: aboutData,
        },
      })

      return NextResponse.json({ success: true, content: updated.about })
    }

    if (type === 'contact') {
      const contactData = contactContentSchema.parse(content)

      // Upsert the site content with contact data
      const updated = await prisma.siteContent.upsert({
        where: { id: 'default' },
        update: {
          contact: {
            email: contactData.email,
            phone: contactData.phone,
            resumeUrl: contactData.resumeUrl || null,
          },
          updatedAt: new Date(),
        },
        create: {
          id: 'default',
          contact: {
            email: contactData.email,
            phone: contactData.phone,
            resumeUrl: contactData.resumeUrl || null,
          },
        },
      })

      return NextResponse.json({ success: true, content: updated.contact })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )

  } catch (error) {
    console.error('PUT Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update site content' },
      { status: 500 }
    )
  }
}
