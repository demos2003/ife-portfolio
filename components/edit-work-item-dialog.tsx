"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
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
import { generateSocialMediaEmbed } from "@/lib/utils"
import { type WorkItem } from "@/lib/types"
import { api } from "@/lib/api-client"

interface EditWorkItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWorkItemUpdated: () => void
  workItem: WorkItem | null
}

export function EditWorkItemDialog({ open, onOpenChange, onWorkItemUpdated, workItem }: EditWorkItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "youtube" as "youtube" | "short-form" | "other" | "carousel",
    url: "",
    thumbnailUrl: "",
    visible: true,
    images: [] as string[],
  })
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")

  // Pre-populate form when workItem changes
  useEffect(() => {
    if (workItem) {
      setFormData({
        title: workItem.title || "",
        description: workItem.description || "",
        type: workItem.type || "youtube",
        url: workItem.url || "",
        thumbnailUrl: workItem.thumbnailUrl || "",
        visible: workItem.visible !== false,
        images: workItem.images || [],
      })
      setThumbnailPreview(workItem.thumbnailUrl || "")
    }
  }, [workItem])

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

      const result = await api.upload<{ url: string }>('/api/upload', uploadFormData)
      setFormData((prev) => ({ ...prev, thumbnailUrl: result.url }))
      setThumbnailPreview(result.url)
      console.log('Custom thumbnail uploaded:', result.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload thumbnail')
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workItem) return

    setIsSubmitting(true)

    console.log('Form data being sent:', {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url,
      thumbnailUrl: formData.thumbnailUrl,
      visible: formData.visible,
      images: formData.images,
    })

    try {
      const result = await api.put(`/api/work/${workItem.id}`, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url: formData.url || undefined, // Send undefined instead of empty string for optional URL
        thumbnailUrl: formData.thumbnailUrl,
        visible: formData.visible,
        images: (formData.type === 'other' || formData.type === 'carousel') ? formData.images : undefined,
      })
      console.log('Successfully updated work item:', result)
      onWorkItemUpdated()
    } catch (error) {
      console.error('Failed to update work item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCarouselImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploadingImages(true)
    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        try {
          const result = await api.upload<{ url: string }>('/api/upload', uploadFormData)
          uploadedUrls.push(result.url)
        } catch (error) {
          console.error('Upload failed:', error)
          continue
        }
      }
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
      }
    } catch (err) {
      console.error('Carousel images upload error:', err)
    } finally {
      setIsUploadingImages(false)
      e.target.value = ''
    }
  }

  const handleRemoveCarouselImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Item</DialogTitle>
          <DialogDescription>Update your work item details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="edit-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="My Amazing Video Project"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Describe your project..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="edit-type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as "youtube" | "short-form" | "other" | "carousel" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="short-form">Short Form</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* URL */}
            <div className="grid gap-2">
              <Label htmlFor="edit-url">
                Project URL {formData.type === 'other' || formData.type === 'carousel' ? (
                  <span className="text-muted-foreground">(optional)</span>
                ) : (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id="edit-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                required={formData.type !== 'other' && formData.type !== 'carousel'}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="grid gap-2">
              <Label htmlFor="edit-thumbnail">Thumbnail Image</Label>
              <div className="space-y-3">
                {/* Custom Upload Section */}
                <div className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Upload Custom Thumbnail</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      id="edit-thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="cursor-pointer"
                      disabled={isUploadingThumbnail}
                    />
                    <Button type="button" variant="outline" size="icon" className="flex-shrink-0" disabled={isUploadingThumbnail} asChild>
                      <label htmlFor="edit-thumbnail" className="cursor-pointer">
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
                        <Image
                          src={thumbnailPreview || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover object-center"
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

          {/* Carousel Images (Other type) */}
          {(formData.type === 'other' || formData.type === 'carousel') && (
            <div className="grid gap-2">
              <Label htmlFor="edit-carousel-images">Carousel Images</Label>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Upload Multiple Images</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      id="edit-carousel-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCarouselImagesChange}
                      className="cursor-pointer"
                      disabled={isUploadingImages}
                    />
                    <Button type="button" variant="outline" size="icon" className="flex-shrink-0" disabled={isUploadingImages} asChild>
                      <label htmlFor="edit-carousel-images" className="cursor-pointer">
                        {isUploadingImages ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </label>
                    </Button>
                  </div>
                  {isUploadingImages && (
                    <p className="text-sm text-muted-foreground mt-2">Uploading images...</p>
                  )}
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((img, idx) => (
                      <div key={`edit-carousel-img-${idx}`} className="relative aspect-video w-full rounded-lg overflow-hidden border border-border">
                        <Image src={img} alt={`Carousel ${idx + 1}`} fill className="object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveCarouselImage(idx)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Work Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
