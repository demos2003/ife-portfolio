import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/work/public - Get all work items for public display
export async function GET() {
  try {
    // Get all work items using Prisma
    const visibleItems = await prisma.workItem.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('Public API - Returning work items:', visibleItems.length)

    // Create response with cache control headers to prevent caching
    const response = NextResponse.json(visibleItems)

    // Prevent caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Public API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work items' },
      { status: 500 }
    )
  }
}
