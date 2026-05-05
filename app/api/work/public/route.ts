import { NextResponse } from 'next/server'
import { getDb, toDoc } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    const items = await db.collection('workitems').find({ visible: { $ne: false } }).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(items.map(toDoc))
  } catch (error) {
    console.error('Public API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch work items' }, { status: 500 })
  }
}
