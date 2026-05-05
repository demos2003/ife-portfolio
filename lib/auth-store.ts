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
    }),
    {
      name: "auth-storage",
    },
  ),
)
