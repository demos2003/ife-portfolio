import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dalbpshky',
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
 * Upload image to Cloudinary
 */
export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  try {
    // Convert File to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary with specific options for portfolio thumbnails
    const result = await new Promise<UploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio-thumbnails',
          transformation: [
            { width: 800, height: 450, crop: 'fill' }, // Standard video thumbnail size
            { quality: 'auto' },
            { format: 'webp' }
          ],
          resource_type: 'image',
        },
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
    throw new Error('Failed to upload image to Cloudinary')
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

  return `https://res.cloudinary.com/dalbpshky/image/upload/${transformString}/${publicId}`
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
