import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

/**
 * Standard API error response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
) {
  const response: { error: string; details?: unknown } = { error: message }
  if (details) {
    response.details = details
  }
  return NextResponse.json(response, { status })
}

/**
 * Standard API success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
) {
  return NextResponse.json(data, { status })
}

/**
 * Handles common API errors with appropriate status codes and messages
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof z.ZodError) {
    return errorResponse('Invalid input data', 400, error.errors)
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return errorResponse('A unique constraint violation occurred', 400)
      case 'P2025':
        return errorResponse('Record not found', 404)
      case 'P2003':
        return errorResponse('Foreign key constraint failed', 400)
      default:
        return errorResponse('Database error occurred', 500)
    }
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse('Invalid data format', 400)
  }

  // Generic error handling
  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse('Internal server error', 500)
}

/**
 * Validates request body against a Zod schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: errorResponse('Invalid input data', 400, error.errors)
      }
    }
    return {
      data: null,
      error: errorResponse('Failed to parse request body', 400)
    }
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}
