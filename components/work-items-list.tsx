"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, Edit, Trash2, ExternalLink, Youtube, Smartphone, FileVideo, Loader2 } from "lucide-react"
import { type WorkItem } from "@/lib/work-store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditWorkItemDialog } from "@/components/edit-work-item-dialog"

interface WorkItemsListProps {
  workItems: WorkItem[]
  onWorkItemDeleted: () => void
  onWorkItemUpdated: () => void
}

export function WorkItemsList({ workItems, onWorkItemDeleted, onWorkItemUpdated }: WorkItemsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<WorkItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/work/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: !currentVisibility }),
      })

      if (response.ok) {
        onWorkItemUpdated()
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const handlePreview = (item: WorkItem) => {
    if (item.type === "short-form" && item.url) {
      // For short-form content, open the link directly
      window.open(item.url, '_blank', 'noopener,noreferrer')
    } else {
      // For other content, show preview modal with loading
      setIsPreviewLoading(true)
      setPreviewItem(item)
      setIsPreviewOpen(true)

      // Simulate loading for a brief moment
      setTimeout(() => {
        setIsPreviewLoading(false)
      }, 800)
    }
  }

  const handleEdit = (item: WorkItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        const response = await fetch(`/api/work/${deleteId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          onWorkItemDeleted()
          setDeleteId(null)
        } else {
          console.error('Failed to delete work item')
        }
      } catch (error) {
        console.error('Error deleting work item:', error)
      }
    }
  }

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

  if (!workItems || !Array.isArray(workItems) || workItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
          <FileVideo className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No work items yet. Click "Add Work Item" to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workItems.map((item) => {
              const Icon = getIcon(item.type)
              return (
                <TableRow key={item._id}>
                  <TableCell>
                    <div className="w-16 h-10 rounded overflow-hidden bg-muted">
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
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px]">
                      <div className="truncate font-semibold">{item.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Icon className="h-3 w-3 mr-1" />
                      {item.type === "youtube" ? "YouTube" : item.type === "short-form" ? "Short Form" : "Other"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.url ? (
                      <div className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-sm truncate max-w-[150px]" title={item.url}>
                          {item.url.length > 30 ? `${item.url.substring(0, 30)}...` : item.url}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No URL</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.visible !== false ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview button - only show for non-short-form content */}
                      {item.type !== "short-form" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(item)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVisibility(item._id, item.visible !== false)}
                        className="h-8 px-2"
                      >
                        {item.visible !== false ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(item._id)}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <AlertDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <AlertDialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Work Item</AlertDialogTitle>
            <AlertDialogDescription>
              This is how your work item will appear on the main site.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {isPreviewLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading preview...</span>
            </div>
          )}

          {previewItem && !isPreviewLoading && (
            <div className="space-y-6">
              {/* Main preview card - similar to main site */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Thumbnail/Video Section */}
                  <div className="flex-shrink-0">
                    <div className="w-full lg:w-80 h-48 lg:h-52 rounded-lg overflow-hidden bg-muted">
                      {previewItem.thumbnailUrl && (previewItem.thumbnailUrl.includes('embed') || previewItem.thumbnailUrl.includes('instagram.com')) ? (
                        <iframe
                          src={previewItem.thumbnailUrl}
                          title={previewItem.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        />
                      ) : previewItem.thumbnailUrl ? (
                        <img
                          src={previewItem.thumbnailUrl}
                          alt={previewItem.title}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          {React.createElement(getIcon(previewItem.type), { className: "h-8 w-8 text-primary" })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 space-y-4">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {React.createElement(getIcon(previewItem.type), { className: "h-3 w-3 mr-1" })}
                        {previewItem.type === "youtube" ? "YouTube" : previewItem.type === "short-form" ? "Short Form" : "Other"}
                      </Badge>
                      {previewItem.visible !== false ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-foreground">
                      {previewItem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {previewItem.description}
                    </p>

                    {/* URL/External Link */}
                    {previewItem.url && (
                      <div className="flex items-center gap-2 pt-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={previewItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          {previewItem.url.length > 50 ? `${previewItem.url.substring(0, 50)}...` : previewItem.url}
                        </a>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4">
                      <Button asChild variant="outline">
                        <a href={previewItem.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Project
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Card */}
              <div className="bg-muted/30 border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Project Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">
                      {previewItem.type === "youtube" ? "YouTube Video" :
                       previewItem.type === "short-form" ? "Short Form Content" : "Other Project"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium">
                      {previewItem.visible !== false ? "Published" : "Draft"}
                    </span>
                  </div>
                  {previewItem.url && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">External Link:</span>
                      <div className="mt-1 p-2 bg-background rounded border">
                        <a
                          href={previewItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {previewItem.url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the work item from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Work Item Dialog */}
      <EditWorkItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onWorkItemUpdated={onWorkItemUpdated}
        workItem={editingItem}
      />
    </>
  )
}
