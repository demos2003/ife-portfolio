import { NextRequest, NextResponse } from 'next/server'
import { getDb, toDoc } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'
import { z } from 'zod'

const workItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['youtube', 'short-form', 'other', 'carousel']),
  url: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).optional(),
}).refine(
  (data) => {
    if ((data.type === 'youtube' || data.type === 'short-form') && !data.url) return false
    return true
  },
  { message: 'URL is required for YouTube and Short Form content', path: ['url'] }
)

export async function GET() {
  try {
    const db = await getDb()
    const items = await db.collection('workitems').find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json(items.map(toDoc))
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch work items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const data = workItemSchema.parse(body)

    const db = await getDb()
    const result = await db.collection('workitems').insertOne({
      title: data.title,
      description: data.description,
      type: data.type,
      url: data.url || null,
      thumbnailUrl: data.thumbnailUrl || null,
      images: data.images || [],
      visible: data.visible,
      createdAt: new Date().toISOString(),
    })

    const newItem = await db.collection('workitems').findOne({ _id: result.insertedId })
    return NextResponse.json(toDoc(newItem!), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('POST Error:', error)
    return NextResponse.json({ error: 'Failed to create work item' }, { status: 500 })
  }
}
