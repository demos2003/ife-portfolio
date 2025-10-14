import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary, validateCloudinaryConfig } from '@/lib/cloudinary'

// Force Node.js runtime for Cloudinary compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    console.log('Uploading file to Cloudinary:', file.name, 'Size:', file.size)

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file)

    console.log('Cloudinary upload successful:', result.secure_url)

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
