"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
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
