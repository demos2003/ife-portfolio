"use client"

import { useAuthStore } from "@/lib/auth-store"
import { Navigation } from "@/components/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Footer } from "@/components/footer"
import { AdminLogin } from "@/components/admin-login"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuthStore()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="fixed top-20 right-4 z-50">
        <Button onClick={logout} variant="outline" size="sm" className="gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
      <AdminDashboard />
      <Footer />
    </main>
  )
}
