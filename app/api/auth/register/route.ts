import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName } = registerSchema.parse(body)

    const hashedPassword = await bcrypt.hash(password, 12)
    const db = await getDb()

    const result = await db.collection('users').insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: { id: result.insertedId.toString(), email: email.toLowerCase(), firstName },
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    // MongoDB duplicate key error
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
