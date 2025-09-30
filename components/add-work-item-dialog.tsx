"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { generateSocialMediaEmbed } from "@/lib/utils"

interface AddWorkItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWorkItemAdded: () => void
}

export function AddWorkItemDialog({ open, onOpenChange, onWorkItemAdded }: AddWorkItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "youtube" as "youtube" | "short-form" | "other",
    url: "",
    thumbnailUrl: "",
  })
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")

  const { user } = useAuthStore()

  const handleUrlChange = (value: string) => {
    setFormData((prev) => ({ ...prev, url: value }))

    // Generate embed URL for social media content
    if (value) {
      const embedUrl = generateSocialMediaEmbed(value)
      if (embedUrl) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: embedUrl }))
        setThumbnailPreview(embedUrl)
      } else {
        // Fallback to placeholder if no embed URL available
        setFormData((prev) => ({ ...prev, thumbnailUrl: "" }))
        setThumbnailPreview("")
      }
    } else {
      setFormData((prev) => ({ ...prev, thumbnailUrl: "" }))
      setThumbnailPreview("")
    }
  }

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingThumbnail(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const result = await response.json()
        setFormData((prev) => ({ ...prev, thumbnailUrl: result.url }))
        setThumbnailPreview(result.url)
        console.log('Custom thumbnail uploaded:', result.url)
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData.error)
        alert('Failed to upload thumbnail: ' + errorData.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload thumbnail')
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    console.log('Form data being sent:', {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url,
      thumbnailUrl: formData.thumbnailUrl,
    })

    try {
      const response = await fetch('/api/work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          url: formData.url || undefined, // Send undefined instead of empty string for optional URL
          thumbnailUrl: formData.thumbnailUrl,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const result = await response.json()
        console.log('Successfully created work item:', result)

        // Reset form
        setFormData({
          title: "",
          description: "",
          type: "youtube",
          url: "",
          thumbnailUrl: "",
        })
        setThumbnailPreview("")
        onWorkItemAdded()
      } else {
        const errorText = await response.text()
        console.error('Failed to create work item:', errorText)
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Work Item</DialogTitle>
          <DialogDescription>Add a new project to your portfolio. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="My Amazing Video Project"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your project..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="short-form">Short Form</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* URL */}
            <div className="grid gap-2">
              <Label htmlFor="url">
                Project URL {formData.type === 'other' ? (
                  <span className="text-muted-foreground">(optional)</span>
                ) : (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                required={formData.type !== 'other'}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <div className="space-y-3">
                {/* Custom Upload Section */}
                <div className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Upload Custom Thumbnail</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="cursor-pointer"
                      disabled={isUploadingThumbnail}
                    />
                    <Button type="button" variant="outline" size="icon" className="flex-shrink-0" disabled={isUploadingThumbnail} asChild>
                      <label htmlFor="thumbnail" className="cursor-pointer">
                        {isUploadingThumbnail ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </label>
                    </Button>
                  </div>
                  {isUploadingThumbnail && (
                    <p className="text-sm text-muted-foreground mt-2">Uploading thumbnail...</p>
                  )}
                </div>

                {/* Preview Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Preview:</span>
                    {formData.thumbnailUrl && !formData.thumbnailUrl.includes('embed') && !formData.thumbnailUrl.includes('instagram.com') && (
                      <Badge variant="outline" className="text-xs">Custom Upload</Badge>
                    )}
                    {formData.thumbnailUrl && (formData.thumbnailUrl.includes('embed') || formData.thumbnailUrl.includes('instagram.com')) && (
                      <Badge variant="outline" className="text-xs">Auto-Generated</Badge>
                    )}
                  </div>

                  {thumbnailPreview && (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border">
                      {thumbnailPreview.includes('embed') || thumbnailPreview.includes('instagram.com') ? (
                        <iframe
                          src={thumbnailPreview}
                          title="Social media preview"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={thumbnailPreview || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover object-center"
                        />
                      )}
                    </div>
                  )}

                  {!thumbnailPreview && formData.url && (
                    <div className="aspect-video w-full rounded-lg border border-border border-dashed flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Upload a custom thumbnail or paste a social media URL above</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Work Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
