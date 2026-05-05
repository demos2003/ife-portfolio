import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/work/public - Get all visible work items for public display
export async function GET() {
  try {
    // Get only visible work items using Prisma
    const visibleItems = await prisma.workItem.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' }
    })

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
