"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Mail, Phone, Download, Edit, Loader2, Save, MessageCircle } from "lucide-react"
import { api } from "@/lib/api-client"

interface ContactContent {
  email: string
  phone: string
  resumeUrl?: string
}

export function ContactSectionEditor() {
  const [content, setContent] = useState<ContactContent>({
    email: "",
    phone: "",
    resumeUrl: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [editForm, setEditForm] = useState<ContactContent>({
    email: "",
    phone: "",
    resumeUrl: ""
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const data = await api.get<{ contact?: ContactContent }>('/api/site-content')
      if (data.contact) {
        setContent(data.contact)
        setEditForm(data.contact)
      }
    } catch (error) {
      console.error('Failed to load contact content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (updatedContent: ContactContent) => {
    try {
      await api.put('/api/site-content', {
        type: 'contact',
        content: updatedContent
      })
      setContent(updatedContent)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save contact content:', error)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingResume(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const result = await api.upload<{ url: string }>('/api/upload', uploadFormData)
      const updatedContent = {
        ...editForm,
        resumeUrl: result.url
      }
      setEditForm(updatedContent)
      console.log('Resume uploaded:', result.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload resume')
    } finally {
      setIsUploadingResume(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveContent(editForm)
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Section
          </CardTitle>
          <CardDescription>Manage your contact information and resume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading contact info...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact Section
        </CardTitle>
        <CardDescription>Manage your contact information and resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Content Preview */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                {content.email ? (
                  <p className="text-sm">{content.email}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not configured</p>
                )}
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                {content.phone ? (
                  <p className="text-sm">{content.phone}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not configured</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg mt-4">
              <div className="flex items-center gap-2 mb-1">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Resume</span>
              </div>
              {content.resumeUrl ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">Uploaded</Badge>
                  <Button asChild variant="outline" size="sm">
                    <a href={content.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact Information
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Contact Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="resume">Resume/CV</Label>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload Resume</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="cursor-pointer"
                          disabled={isUploadingResume}
                        />
                        <Button type="button" variant="outline" size="icon" className="flex-shrink-0" disabled={isUploadingResume} asChild>
                          <label htmlFor="resume" className="cursor-pointer">
                            {isUploadingResume ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </label>
                        </Button>
                      </div>
                      {isUploadingResume && (
                        <p className="text-sm text-muted-foreground mt-2">Uploading resume...</p>
                      )}
                    </div>

                    {content.resumeUrl && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <Download className="h-4 w-4" />
                          <span className="text-sm font-medium">Resume uploaded successfully</span>
                        </div>
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <a href={content.resumeUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            View Resume
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
