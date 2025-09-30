"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, Loader2, Save, User } from "lucide-react"

export function AboutMeEditor() {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch('/api/about-me')
      if (response.ok) {
        const data = await response.json()
        setContent(data.content || "")
        setEditContent(data.content || "")
      }
    } catch (error) {
      console.error('Failed to load About Me content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async () => {
    try {
      const response = await fetch('/api/about-me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent
        }),
      })

      if (response.ok) {
        setContent(editContent)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save About Me content:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveContent()
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            About Me Content
          </CardTitle>
          <CardDescription>Manage your personal story content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading content...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          About Me Content
        </CardTitle>
        <CardDescription>Edit your personal story that appears on the main website</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Content Preview */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Content</h3>
            <div className="p-4 bg-muted/30 rounded-lg min-h-[100px]">
              {content ? (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No content added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Edit About Me Content
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="aboutMeContent">About Me Content</Label>
              <Textarea
                id="aboutMeContent"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                placeholder="Write about yourself, your background, experience, and what makes you unique as a video editor and content strategist..."
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(content)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
