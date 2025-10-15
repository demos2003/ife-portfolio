import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for work items
const workItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['youtube', 'short-form', 'other', 'carousel'], {
    errorMap: () => ({ message: 'Invalid type. Must be: youtube, short-form, other, or carousel' })
  }),
  url: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).optional(),
  visible: z.boolean().default(true),
}).refine(
  (data) => {
    // URL is required for youtube and short-form
    if ((data.type === 'youtube' || data.type === 'short-form') && !data.url) {
      return false
    }
    return true
  },
  {
    message: 'URL is required for YouTube and Short Form content',
    path: ['url'],
  }
)

// GET /api/work - Get all visible work items for public display
export async function GET() {
  try {
    const workItems = await prisma.workItem.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Returning visible work items, Count:', workItems.length)

    // Create response with cache control headers to prevent caching
    const response = NextResponse.json(workItems)

    // Prevent caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
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
    console.log('POST request body:', body)

    // Validate and parse the request body
    const validatedData = workItemSchema.parse(body)

    // Create new work item using Prisma
    const newItem = await prisma.workItem.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        url: validatedData.url || null,
        thumbnailUrl: validatedData.thumbnailUrl || null,
        images: validatedData.images || [],
        visible: validatedData.visible,
        createdAt: new Date().toISOString(),
      }
    })

    console.log('Successfully created work item:', newItem)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('POST API Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create work item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
