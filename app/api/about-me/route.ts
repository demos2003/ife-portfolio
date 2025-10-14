import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Validation schema for about me content
const aboutMeSchema = z.object({
  content: z.string().min(1, 'Content is required and must not be empty'),
})

export async function GET() {
  try {
    const siteContent = await prisma.siteContent.findFirst()

    const aboutText = siteContent?.about?.description ||
      "I'm a passionate video editor and content strategist with over 5 years of experience creating compelling visual stories. My journey began with a love for storytelling and has evolved into expertise in video production, content strategy, and brand development."

    return NextResponse.json({ content: aboutText })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to load About Me content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = aboutMeSchema.parse(body)

    // Get existing site content
    const existing = await prisma.siteContent.findFirst()

    let updated
    if (existing) {
      // Update existing record
      updated = await prisma.siteContent.update({
        where: { id: existing.id },
        data: {
          about: {
            ...existing.about,
            title: existing.about?.title || 'About Me',
            description: content,
            skills: existing.about?.skills || [],
          },
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new record (Prisma will auto-generate the ObjectId)
      updated = await prisma.siteContent.create({
        data: {
          about: {
            title: 'About Me',
            description: content,
            skills: [],
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      content: updated.about?.description
    })
  } catch (error) {
    console.error('PUT Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update About Me content' },
      { status: 500 }
    )
  }
}
