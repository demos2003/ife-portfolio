import { NextRequest, NextResponse } from 'next/server'
import { updateWorkItem, deleteWorkItem, getWorkItems, type WorkItem } from '@/lib/work-store'

// PATCH /api/work/[id] - Toggle visibility or update work item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { visible, ...updates } = body

    // TODO: Verify the work item belongs to the authenticated user
    await updateWorkItem(id, { visible, ...updates })

    return NextResponse.json({ success: true })
  } catch (error) {
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
    const { title, description, type, url, thumbnailUrl, images, visible } = body

    // Validate type if provided
    if (type && !['youtube', 'short-form', 'other', 'carousel'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: youtube, short-form, other, or carousel' },
        { status: 400 }
      )
    }

    const updates: Partial<WorkItem> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (type !== undefined) updates.type = type
    if (url !== undefined) updates.url = url
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl
    if (images !== undefined) (updates as any).images = images
    if (visible !== undefined) updates.visible = visible

    await updateWorkItem(id, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
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

    await deleteWorkItem(id)

    return NextResponse.json({ message: 'Work item deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete work item' },
      { status: 500 }
    )
  }
}
