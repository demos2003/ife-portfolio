import { NextResponse } from 'next/server'
import { getWorkItems } from '@/lib/work-store'

// GET /api/work/public - Get all visible work items for public display
export async function GET() {
  try {
    // Get all work items and filter for visible ones
    const workItems = await getWorkItems()

    // Filter to only show visible items
    const visibleItems = workItems.filter(item => item.visible !== false)

    console.log('Public API - Returning visible work items:', visibleItems.length)

    return NextResponse.json(visibleItems)
  } catch (error) {
    console.error('Public API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work items' },
      { status: 500 }
    )
  }
}
