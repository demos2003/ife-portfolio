/**
 * Environment variables helper
 * Provides type-safe access to environment variables
 */

export const env = {
  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Environment info
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

/**
 * Get the full URL for a given path
 * @param path - The path to append to the base URL (e.g., '/api/work')
 * @returns The full URL
 */
export function getUrl(path: string = ''): string {
  const baseUrl = env.appUrl.replace(/\/$/, '') // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Validate required environment variables
 * Throws an error if any required variables are missing
 */
export function validateEnv() {
  const required = [
    { key: 'DATABASE_URL', value: env.databaseUrl },
  ]

  const missing = required.filter(({ value }) => !value)

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(({ key }) => key).join(', ')}`
    )
  }
}
