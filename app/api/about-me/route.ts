import { NextRequest, NextResponse } from 'next/server'
import { getSiteContent, upsertAboutMe } from '@/lib/content-store'

export async function GET() {
  try {
    const content = await getSiteContent()
    const aboutText = content.about?.description || "I'm a passionate video editor and content strategist with over 5 years of experience creating compelling visual stories. My journey began with a love for storytelling and has evolved into expertise in video production, content strategy, and brand development."
    return NextResponse.json({ content: aboutText })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load About Me content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }

    const updated = await upsertAboutMe(body.content)
    return NextResponse.json({ success: true, content: updated })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update About Me content' },
      { status: 500 }
    )
  }
}
