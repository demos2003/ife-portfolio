"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Loader2, Play, Youtube, Smartphone, FileVideo, X } from "lucide-react"
import { type WorkItem } from "@/lib/work-store"

const filterOptions = [
  { value: "all", label: "All Work" },
  { value: "youtube", label: "YouTube" },
  { value: "short-form", label: "Short Form" },
  { value: "other", label: "Other" },
]

export function WorkShowcase() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isLoaded, setIsLoaded] = useState(false)
  const [previewItem, setPreviewItem] = useState<WorkItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    const loadWorkItems = async () => {
      try {
        const response = await fetch('/api/work/public')
        if (response.ok) {
          const items = await response.json()
          setWorkItems(items)
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load work items:', error)
        setIsLoaded(true)
      }
    }

    loadWorkItems()
  }, [])

  const filteredItems = filter === "all"
    ? workItems.filter(item => item.visible !== false) // Only show visible items
    : workItems.filter((item) => item.type === filter && item.visible !== false)

  const getIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return Youtube
      case "short-form":
        return Smartphone
      default:
        return FileVideo
    }
  }

  const handleVideoPreview = (item: WorkItem) => {
    setPreviewItem(item)
    setIsPreviewOpen(true)
  }

  const getVideoEmbedUrl = (url: string, type: string) => {
    if (type === "youtube" && url.includes("youtube.com") || url.includes("youtu.be")) {
      // Extract YouTube video ID
      const videoId = url.includes("youtube.com/watch?v=")
        ? url.split("v=")[1]?.split("&")[0]
        : url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }
    return url
  }

  return (
    <section id="work" className="pt-24 pb-20 md:pt-32 md:pb-32 min-h-screen relative flex flex-col items-center bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-lg dark:from-background/90 dark:via-background/70 dark:to-background/90">
     
      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full rounded-3xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 md:p-10">
          <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 text-balance">My Work</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              A collection of video projects showcasing creative storytelling and strategic content
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-fade-in">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                onClick={() => setFilter(option.value)}
                className="transition-all duration-300"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Work Grid */}
          {!isLoaded ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Play className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No work items yet</h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "No visible projects yet. Check back soon for new content!"
                  : `No visible ${filter} projects found. Try a different filter.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredItems.map((item, index) => {
                const Icon = getIcon(item.type)
                return (
                  <Card
                    key={item._id}
                    className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl ${
                      isLoaded ? "animate-scale-in" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Video Preview */}
                    <div className="relative aspect-video bg-muted/50 overflow-hidden">
                      {item.thumbnailUrl && (item.thumbnailUrl.includes('embed') || item.thumbnailUrl.includes('instagram.com')) ? (
                        <iframe
                          src={item.thumbnailUrl}
                          title={item.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        />
                      ) : item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover object-center scale-[1.02] group-hover:scale-[1.05] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <Icon className="h-12 w-12 text-primary" />
                        </div>
                      )}

                      {/* Subtle vignette overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20" />

                      {/* Always-visible Play Button (YouTube-style) */}
                      {item.url && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-300 cursor-pointer border-2 border-white/20 hover:border-white/40 hover:scale-110"
                            onClick={() => handleVideoPreview(item)}
                          >
                            <Play className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-white/5 dark:bg-white/0 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-primary/15 text-primary hover:bg-primary/25 border border-white/10">
                          <Icon className="h-3 w-3 mr-1" />
                          {item.type === "youtube" ? "YouTube" : item.type === "short-form" ? "Short Form" : "Other"}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                      <Button asChild variant="ghost" size="sm" className="group/btn w-full justify-between bg-white/0 hover:bg-white/10">
                        <a href={item.url || "#"} target="_blank" rel="noopener noreferrer">
                          {item.url ? "View Project" : "View Details"}
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {previewItem?.title}
            </DialogTitle>
          </DialogHeader>
          {previewItem && previewItem.url && (
            <div className="aspect-video w-full">
              {previewItem.thumbnailUrl && (previewItem.thumbnailUrl.includes('embed') || previewItem.thumbnailUrl.includes('instagram.com')) ? (
                <iframe
                  src={previewItem.thumbnailUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : previewItem.type === "youtube" ? (
                <iframe
                  src={getVideoEmbedUrl(previewItem.url, previewItem.type)}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewItem.url}
                  controls
                  className="w-full h-full rounded-lg"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
