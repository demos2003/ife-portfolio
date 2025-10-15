"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { Navigation } from "@/components/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Footer } from "@/components/footer"
import { AdminLogin } from "@/components/admin-login"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
      <AdminDashboard />
      <Footer />
    </main>
  )
}
