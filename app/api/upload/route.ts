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

    // Determine file type and set appropriate validation
    const isImage = file.type.startsWith('image/')
    const isDocument = file.type === 'application/pdf' ||
                      file.type === 'application/msword' ||
                      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    if (!isImage && !isDocument) {
      return NextResponse.json(
        { error: 'File must be an image (JPG, PNG, WebP) or document (PDF, DOC, DOCX)' },
        { status: 400 }
      )
    }

    // Validate file size (5MB for images, 10MB for documents)
    const maxSize = isDocument ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeLimit = isDocument ? '10MB' : '5MB'
      return NextResponse.json(
        { error: `File size must be less than ${sizeLimit}` },
        { status: 400 }
      )
    }

    console.log('Uploading file to Cloudinary:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Upload to Cloudinary with different options based on file type
    const result = await uploadToCloudinary(file, isImage)

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
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
