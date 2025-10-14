import { NextRequest, NextResponse } from 'next/server'
import { getSiteContent, upsertAboutContent, upsertContactContent } from '@/lib/content-store'

// GET /api/site-content - Get about and contact content
export async function GET() {
  try {
    const content = await getSiteContent()
    return NextResponse.json(content)
  } catch {
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
    const { type, content } = body

    if (!type || !['about', 'contact'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "about" or "contact"' },
        { status: 400 }
      )
    }

    if (type === 'about') {
      // Validate about content
      if (!content.title || !content.description) {
        return NextResponse.json(
          { error: 'Title and description are required for about content' },
          { status: 400 }
        )
      }
      const updated = await upsertAboutContent(content)
      return NextResponse.json({ success: true, content: updated })
    }

    if (type === 'contact') {
      // Validate contact content
      if (!content.email || !content.phone) {
        return NextResponse.json(
          { error: 'Email and phone are required for contact content' },
          { status: 400 }
        )
      }
      const updated = await upsertContactContent(content)
      return NextResponse.json({ success: true, content: updated })
    }

    // This should never be reached due to validation above, but adding for safety
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )

  } catch {
    return NextResponse.json(
      { error: 'Failed to update site content' },
      { status: 500 }
    )
  }
}
