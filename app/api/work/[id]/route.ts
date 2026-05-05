import { NextRequest, NextResponse } from 'next/server'
import { getDb, toDoc, ObjectId } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'
import { z } from 'zod'

const updateWorkItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(['youtube', 'short-form', 'other', 'carousel']).optional(),
  url: z.string().url().optional().or(z.literal('')).or(z.null()),
  thumbnailUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  images: z.array(z.string().url()).optional(),
  visible: z.boolean().optional(),
})

async function getItem(id: string) {
  try {
    const db = await getDb()
    return { db, oid: new ObjectId(id) }
  } catch {
    return null
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const ctx = await getItem(id)
    if (!ctx) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await request.json()
    const data = updateWorkItemSchema.parse(body)

    const result = await ctx.db.collection('workitems').findOneAndUpdate(
      { _id: ctx.oid },
      { $set: data },
      { returnDocument: 'after' }
    )

    if (!result) return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: toDoc(result) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('PATCH Error:', error)
    return NextResponse.json({ error: 'Failed to update work item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const ctx = await getItem(id)
    if (!ctx) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await request.json()
    const data = updateWorkItemSchema.parse(body)

    const result = await ctx.db.collection('workitems').findOneAndUpdate(
      { _id: ctx.oid },
      { $set: data },
      { returnDocument: 'after' }
    )

    if (!result) return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: toDoc(result) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update work item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const ctx = await getItem(id)
    if (!ctx) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const result = await ctx.db.collection('workitems').deleteOne({ _id: ctx.oid })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Work item deleted successfully' })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to delete work item' }, { status: 500 })
  }
}
