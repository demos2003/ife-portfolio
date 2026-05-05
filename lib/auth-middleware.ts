import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JwtPayload } from '@/lib/jwt'

export function getAuthPayload(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    return verifyToken(authHeader.substring(7))
  } catch {
    return null
  }
}

export function requireAuth(request: NextRequest): JwtPayload | NextResponse {
  const payload = getAuthPayload(request)
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return payload
}
