import { NextRequest, NextResponse } from 'next/server'
import { getWorkItems, saveWorkItem } from '@/lib/work-store'

// GET /api/work - Get all work items (global, not user-specific)
export async function GET() {
  try {
    // Get all work items (no user filtering needed)
    const workItems = await getWorkItems()
    console.log('Returning all work items, Count:', workItems.length)
    return NextResponse.json(workItems)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, type, url, thumbnailUrl, images } = body

    console.log('POST request body:', body)

    // Validate required fields
    if (!title || !description || !type) {
      console.log('Missing required fields:', { title, description, type })
      return NextResponse.json(
        { error: 'Missing required fields: title, description, type' },
        { status: 400 }
      )
    }

    // Validate URL is required for youtube and short-form, optional for other/carousel
    if ((type === 'youtube' || type === 'short-form') && !url) {
      console.log('Missing URL for type:', type)
      return NextResponse.json(
        { error: 'URL is required for YouTube and Short Form content' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['youtube', 'short-form', 'other', 'carousel'].includes(type)) {
      console.log('Invalid type:', type)
      return NextResponse.json(
        { error: 'Invalid type. Must be: youtube, short-form, other, or carousel' },
        { status: 400 }
      )
    }

    console.log('Creating work item with data:', {
      title,
      description,
      type,
      url,
      thumbnailUrl,
      images,
      visible: true
    })

    const newItem = await saveWorkItem({
      title,
      description,
      type,
      url,
      thumbnailUrl,
      images,
      visible: true
    })

    console.log('Successfully created work item:', newItem)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('POST API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create work item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
