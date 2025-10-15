import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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
  resumeUrl: z.string().url().optional().or(z.literal('')).nullable(),
  rateCardUrl: z.string().url().optional().or(z.literal('')).nullable(),
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
      const response = NextResponse.json({ about: null, contact: null })
      // Prevent caching to ensure fresh data
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }

    const response = NextResponse.json({
      about: content.about,
      contact: content.contact,
    })

    // Prevent caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
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

      // Get existing or create new
      const existing = await prisma.siteContent.findFirst()

      if (existing) {
        // Update existing record
        const updated = await prisma.siteContent.update({
          where: { id: existing.id },
          data: {
            about: aboutData,
            updatedAt: new Date(),
          },
        })
        return NextResponse.json({ success: true, content: updated.about })
      } else {
        // Create new record (Prisma will auto-generate the ObjectId)
        const created = await prisma.siteContent.create({
          data: {
            about: aboutData,
          },
        })
        return NextResponse.json({ success: true, content: created.about })
      }
    }

    if (type === 'contact') {
      const contactData = contactContentSchema.parse(content)

      // Get existing or create new
      const existing = await prisma.siteContent.findFirst()

      if (existing) {
        // Update existing record
        const updated = await prisma.siteContent.update({
          where: { id: existing.id },
          data: {
            contact: {
              email: contactData.email,
              phone: contactData.phone,
              resumeUrl: contactData.resumeUrl === "" ? undefined : contactData.resumeUrl,
              rateCardUrl: contactData.rateCardUrl === "" ? undefined : contactData.rateCardUrl,
            },
            updatedAt: new Date(),
          },
        })
        return NextResponse.json({ success: true, content: updated.contact })
      } else {
        // Create new record (Prisma will auto-generate the ObjectId)
        const created = await prisma.siteContent.create({
          data: {
            contact: {
              email: contactData.email,
              phone: contactData.phone,
              resumeUrl: contactData.resumeUrl === "" ? undefined : contactData.resumeUrl,
              rateCardUrl: contactData.rateCardUrl === "" ? undefined : contactData.rateCardUrl,
            },
          },
        })
        return NextResponse.json({ success: true, content: created.contact })
      }
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

    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('Detailed error:', { errorMessage, errorStack })

    return NextResponse.json(
      {
        error: 'Failed to update site content',
        details: errorMessage,
        hint: 'Check DATABASE_URL is set in Vercel environment variables'
      },
      { status: 500 }
    )
  }
}
