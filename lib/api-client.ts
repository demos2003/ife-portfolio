import { useAuthStore } from './auth-store'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any

type RequestOptions = RequestInit & {
  body?: JsonValue
}

class ApiClient {
  private baseUrl: string

  constructor() {
    // In client components, use NEXT_PUBLIC_APP_URL
    // In server components, this would be the server URL
    if (typeof window !== 'undefined') {
      this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    } else {
      this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  }

  /**
   * Get the full URL for an API endpoint
   */
  private getUrl(path: string): string {
    // If path is already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Remove leading slash if present, we'll add it
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${this.baseUrl}${cleanPath}`
  }

  /**
   * Make a generic request
   */
  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.getUrl(path)
    const { body, ...restOptions } = options

    // Check if user is authenticated and add token to headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(restOptions.headers as Record<string, string> | undefined),
    }

    // Add authentication header if available (client-side only)
    if (typeof window !== 'undefined') {
      try {
        // Use the auth store to get headers if available
        const authHeaders = useAuthStore.getState().getAuthHeaders()
        Object.assign(headers, authHeaders)
      } catch (error) {
        // Ignore errors when getting auth headers
        console.warn('Failed to get auth headers:', error)
      }
    }

    const config: RequestInit = {
      ...restOptions,
      headers,
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: JsonValue, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: JsonValue, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: JsonValue, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }

  /**
   * Upload file using FormData
   */
  async upload<T>(path: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    const url = this.getUrl(path)
    const { headers, ...restOptions } = options || {}

    const response = await fetch(url, {
      ...restOptions,
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
      headers: {
        ...headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

// Export a singleton instance
export const api = new ApiClient()

// Export the class for testing purposes
export { ApiClient }
