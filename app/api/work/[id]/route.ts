import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Validation schema for partial work item updates
const updateWorkItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(['youtube', 'short-form', 'other', 'carousel']).optional(),
  url: z.string().url().optional().or(z.literal('')).or(z.null()),
  thumbnailUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  images: z.array(z.string().url()).optional(),
  visible: z.boolean().optional(),
})

// PATCH /api/work/[id] - Toggle visibility or update work item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate the update data
    const validatedData = updateWorkItemSchema.parse(body)

    // TODO: Verify the work item belongs to the authenticated user
    const updatedItem = await prisma.workItem.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({ success: true, data: updatedItem })
  } catch (error) {
    console.error('PATCH Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Work item not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update work item' },
      { status: 500 }
    )
  }
}

// PUT /api/work/[id] - Update a work item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate the update data
    const validatedData = updateWorkItemSchema.parse(body)

    const updatedItem = await prisma.workItem.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({ success: true, data: updatedItem })
  } catch (error) {
    console.error('PUT Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Work item not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update work item' },
      { status: 500 }
    )
  }
}

// DELETE /api/work/[id] - Delete a work item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.workItem.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Work item deleted successfully' })
  } catch (error) {
    console.error('DELETE Error:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Work item not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete work item' },
      { status: 500 }
    )
  }
}
