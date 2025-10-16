"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api } from "@/lib/api-client"

interface User {
  id: string
  email: string
  firstName: string
  createdAt: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  getAuthHeaders: () => Record<string, string>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        try {
          const data = await api.post<{ success: boolean; user: User; token: string }>('/api/auth/login', { email, password })

          if (data.success) {
            set({
              isAuthenticated: true,
              user: data.user,
              token: data.token
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
      getAuthHeaders: () => {
        // This will be implemented after the store is created to avoid circular reference
        return { 'Content-Type': 'application/json' }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Implement getAuthHeaders method to avoid circular reference
useAuthStore.setState((state) => ({
  ...state,
  getAuthHeaders: () => {
    if (state.token) {
      return {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      }
    }
    return {
      'Authorization': '',
      'Content-Type': 'application/json'
    }
  }
}))
