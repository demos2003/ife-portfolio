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
  rateCardNigeriaUrl?: string
  rateCardNigeriaExtension?: string
  rateCardInternationalUrl?: string
  rateCardInternationalExtension?: string
}

export function ContactSectionEditor() {
  const [content, setContent] = useState<ContactContent>({
    email: "",
    phone: "",
    rateCardNigeriaUrl: "",
    rateCardInternationalUrl: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingRateCardNigeria, setIsUploadingRateCardNigeria] = useState(false)
  const [isUploadingRateCardInternational, setIsUploadingRateCardInternational] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<ContactContent>({
    email: "",
    phone: "",
    rateCardNigeriaUrl: "",
    rateCardInternationalUrl: ""
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
    setIsSaving(true)
    try {
      await api.put('/api/site-content', {
        type: 'contact',
        content: updatedContent
      })
      setContent(updatedContent)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save contact content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRateCardNigeriaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingRateCardNigeria(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const result = await api.upload<{ url: string }>('/api/upload', uploadFormData)
      const updatedContent = {
        ...editForm,
        rateCardNigeriaUrl: result.url,
        rateCardNigeriaExtension: file.name.split('.').pop()?.toLowerCase() || 'pdf',
      }
      setEditForm(updatedContent)
      console.log('Nigerian rate card uploaded:', result.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload rate card')
    } finally {
      setIsUploadingRateCardNigeria(false)
    }
  }

  const handleRateCardInternationalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingRateCardInternational(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const result = await api.upload<{ url: string }>('/api/upload', uploadFormData)
      const updatedContent = {
        ...editForm,
        rateCardInternationalUrl: result.url,
        rateCardInternationalExtension: file.name.split('.').pop()?.toLowerCase() || 'pdf',
      }
      setEditForm(updatedContent)
      console.log('International rate card uploaded:', result.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload rate card')
    } finally {
      setIsUploadingRateCardInternational(false)
    }
  }

  const handleRemoveRateCardNigeria = () => {
    setEditForm(prev => ({ ...prev, rateCardNigeriaUrl: "" }))
    setContent(prev => ({ ...prev, rateCardNigeriaUrl: "" }))
  }

  const handleRemoveRateCardInternational = () => {
    setEditForm(prev => ({ ...prev, rateCardInternationalUrl: "" }))
    setContent(prev => ({ ...prev, rateCardInternationalUrl: "" }))
  }

  const handleDownloadRateCardNigeria = async () => {
    if (!content.rateCardNigeriaUrl) return

    try {
      const response = await fetch(content.rateCardNigeriaUrl)
      const blob = await response.blob()

      // Create a temporary anchor element
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url

      const filename = `Ifeoluwa Okusanya Rate Card (Nigeria).${content.rateCardNigeriaExtension || 'pdf'}`

      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download rate card')
    }
  }

  const handleDownloadRateCardInternational = async () => {
    if (!content.rateCardInternationalUrl) return

    try {
      const response = await fetch(content.rateCardInternationalUrl)
      const blob = await response.blob()

      // Create a temporary anchor element
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url

      const filename = `Ifeoluwa Okusanya Rate Card (International).${content.rateCardInternationalExtension || 'pdf'}`

      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download rate card')
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
          <CardDescription>Manage your contact information and rate cards</CardDescription>
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
        <CardDescription>Manage your contact information and rate cards</CardDescription>
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
                <span className="text-sm font-medium">Rate Card (Nigeria)</span>
              </div>
              {content.rateCardNigeriaUrl ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">Uploaded</Badge>
                  <Button variant="outline" size="sm" onClick={handleDownloadRateCardNigeria}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Rate Card
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not uploaded</p>
              )}
            </div>

            <div className="p-3 bg-muted/30 rounded-lg mt-4">
              <div className="flex items-center gap-2 mb-1">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rate Card (International)</span>
              </div>
              {content.rateCardInternationalUrl ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">Uploaded</Badge>
                  <Button variant="outline" size="sm" onClick={handleDownloadRateCardInternational}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Rate Card
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
                  <Label htmlFor="rateCardNigeria">Rate Card - Nigeria</Label>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload Nigerian Rate Card</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          id="rateCardNigeria"
                          type="file"
                          accept="*"
                          onChange={handleRateCardNigeriaUpload}
                          className="cursor-pointer"
                          disabled={isUploadingRateCardNigeria}
                        />
                        <Button type="button" variant="outline" size="icon" className="flex-shrink-0" disabled={isUploadingRateCardNigeria} asChild>
                          <label htmlFor="rateCardNigeria" className="cursor-pointer">
                            {isUploadingRateCardNigeria ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </label>
                        </Button>
                      </div>
                      {isUploadingRateCardNigeria && (
                        <p className="text-sm text-muted-foreground mt-2">Uploading rate card...</p>
                      )}
                    </div>

                    {content.rateCardNigeriaUrl && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <Download className="h-4 w-4" />
                          <span className="text-sm font-medium">Rate card uploaded successfully</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={handleDownloadRateCardNigeria}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Rate Card
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveRateCardNigeria}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove Rate Card
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rateCardInternational">Rate Card - International</Label>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload International Rate Card</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          id="rateCardInternational"
                          type="file"
                          accept="*"
                          onChange={handleRateCardInternationalUpload}
                          className="cursor-pointer"
                          disabled={isUploadingRateCardInternational}
                        />
                        <Button type="button" variant="outline" size="icon" className="flex-shrink-0" disabled={isUploadingRateCardInternational} asChild>
                          <label htmlFor="rateCardInternational" className="cursor-pointer">
                            {isUploadingRateCardInternational ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </label>
                        </Button>
                      </div>
                      {isUploadingRateCardInternational && (
                        <p className="text-sm text-muted-foreground mt-2">Uploading rate card...</p>
                      )}
                    </div>

                    {content.rateCardInternationalUrl && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <Download className="h-4 w-4" />
                          <span className="text-sm font-medium">Rate card uploaded successfully</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={handleDownloadRateCardInternational}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Rate Card
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveRateCardInternational}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove Rate Card
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
