"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Video, Youtube, Smartphone, FileVideo } from "lucide-react"
import { type WorkItem } from "@/lib/types"
import { WorkItemsList } from "@/components/work-items-list"
import { AddWorkItemDialog } from "@/components/add-work-item-dialog"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "./ui/button"
import { AboutSectionEditor } from "./about-section-editor"
import { ContactSectionEditor } from "./contact-section-editor"
import { AboutMeEditor } from "./about-me-editor"
import { api } from "@/lib/api-client"

export function AdminDashboard() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    youtube: 0,
    shortForm: 0,
    other: 0,
  })
  const { user } = useAuthStore()

  const loadWorkItems = async () => {
    try {
      const items = await api.get<WorkItem[]>('/api/work')
      console.log('API Response type:', typeof items)
      console.log('API Response value:', items)
      console.log('Is array?', Array.isArray(items))
      console.log('Number of items received:', items.length)
      setWorkItems(items)
      setStats({
        total: items.length,
        youtube: items.filter((item: WorkItem) => item.type === "youtube").length,
        shortForm: items.filter((item: WorkItem) => item.type === "short-form").length,
        other: items.filter((item: WorkItem) => item.type === "other").length,
      })
    } catch (error) {
      console.error('Failed to load work items:', error)
    }
  }

  useEffect(() => {
    console.log('AdminDashboard useEffect - user:', user)
    console.log('User ID:', user?.id)
    loadWorkItems()
  }, [user])

  const handleWorkItemAdded = () => {
    loadWorkItems()
    setIsDialogOpen(false)
  }

  const handleWorkItemDeleted = () => {
    loadWorkItems()
  }

  return (
    <section className="pt-24 pb-20 md:pt-32 md:pb-32 min-h-screen">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your portfolio work items</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} size="lg" className="group">
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
              Add Work Item
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="animate-scale-in" style={{ animationDelay: "0ms" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All work items</p>
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "100ms" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">YouTube</CardTitle>
                <Youtube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.youtube}</div>
                <p className="text-xs text-muted-foreground">Long-form videos</p>
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "200ms" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Short Form</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.shortForm}</div>
                <p className="text-xs text-muted-foreground">Shorts & Reels</p>
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "300ms" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Other</CardTitle>
                <FileVideo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.other}</div>
                <p className="text-xs text-muted-foreground">Other projects</p>
              </CardContent>
            </Card>
          </div>

          {/* About & Contact Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <AboutSectionEditor />
            <ContactSectionEditor />
            <AboutMeEditor />
          </div>

          {/* Work Items List */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>All Work Items</CardTitle>
              <CardDescription>View, edit, and delete your portfolio items</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkItemsList workItems={workItems} onWorkItemDeleted={handleWorkItemDeleted} onWorkItemUpdated={handleWorkItemAdded} />
            </CardContent>
          </Card>

          {/* Add Work Item Dialog */}
          <AddWorkItemDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onWorkItemAdded={handleWorkItemAdded} />
        </div>
      </div>
    </section>
  )
}
