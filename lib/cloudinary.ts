import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(file: File, isImage: boolean = true): Promise<UploadResult> {
  try {
    // Convert File to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine resource type based on file type
    let resourceType: 'image' | 'raw' | 'auto' = 'auto'
    if (isImage) {
      resourceType = 'image'
    } else if (file.type === 'application/pdf' || 
               file.type.includes('document') || 
               file.type.includes('text')) {
      resourceType = 'raw'
    }

    // Upload to Cloudinary with different options based on file type
    const uploadOptions = {
      folder: isImage ? 'portfolio-thumbnails' : 'portfolio-documents',
      resource_type: resourceType,
      access_mode:'public'
    }

    // Apply image-specific transformations only for images
    if (isImage) {
      // @ts-expect-error - Cloudinary transformation types are complex
      uploadOptions.transformation = [
        { width: 1600, crop: 'limit' },
        { quality: 'auto' },
        { format: 'webp' }
      ]
    }

    const result = await new Promise<UploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error)
          } else if (result) {
            resolve(result as UploadResult)
          } else {
            reject(new Error('Upload failed'))
          }
        }
      ).end(buffer)
    })

    console.log('Successfully uploaded to Cloudinary:', result.secure_url)
    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
    console.log('Successfully deleted from Cloudinary:', publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}

/**
 * Get optimized image URL from Cloudinary
 */
export function getOptimizedImageUrl(publicId: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}): string {
  const transformations: string[] = []

  if (options?.width) transformations.push(`w_${options.width}`)
  if (options?.height) transformations.push(`h_${options.height}`)
  if (options?.quality) transformations.push(`q_${options.quality}`)
  if (options?.format) transformations.push(`f_${options.format}`)

  const transformString = transformations.length > 0 ? transformations.join(',') : ''

  return `https://res.cloudinary.com/dalbpshky/raw/upload/${transformString}/${publicId}`
}

/**
 * Validate Cloudinary configuration
 */
export function validateCloudinaryConfig(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

export default cloudinary
