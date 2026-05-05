"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Mail, Phone, Download, Edit, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { api } from "@/lib/api-client"

interface ContactContent {
  email: string
  phone: string
  resumeUrl?: string
}

export function ContactSection() {
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

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const data = await api.get<{ contact?: ContactContent }>('/api/site-content')
      if (data.contact) {
        setContent(data.contact)
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
        ...content,
        resumeUrl: result.url
      }
      setContent(updatedContent)
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
      <section id="contact" className="relative py-20 md:py-32 overflow-hidden flex flex-col items-center">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading contact info...</span>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="relative py-20 md:py-32 overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-primary/8 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary/6 rounded-full blur-2xl animate-pulse-slow" />
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-balance">
                Let&apos;s Work Together
              </h2>
              {isAuthenticated && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="opacity-50 hover:opacity-100">
                      <Edit className="h-4 w-4" />
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
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Ready to bring your vision to life? Let&apos;s discuss your next project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Email Card */}
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground mb-4">Drop me a message anytime</p>
              {content.email ? (
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${content.email}`}>
                    {content.email}
                  </a>
                </Button>
              ) : (
                <p className="text-muted-foreground">Email not configured</p>
              )}
            </Card>

            {/* Phone Card */}
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm animate-scale-in" style={{ animationDelay: "100ms" }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-muted-foreground mb-4">Let&apos;s have a quick chat</p>
              {content.phone ? (
                <Button asChild variant="outline" className="w-full">
                  <a href={`tel:${content.phone}`}>
                    {content.phone}
                  </a>
                </Button>
              ) : (
                <p className="text-muted-foreground">Phone not configured</p>
              )}
            </Card>

            {/* Resume Card */}
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm animate-scale-in" style={{ animationDelay: "200ms" }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resume</h3>
              <p className="text-muted-foreground mb-4">Download my latest CV</p>
              {content.resumeUrl ? (
                <Button asChild className="w-full">
                  <a href={content.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                </Button>
              ) : (
                <p className="text-muted-foreground">Resume not uploaded</p>
              )}
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center animate-fade-in-up">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="text-2xl font-semibold mb-4">Ready to Start Your Project?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Whether you need video editing, content strategy, or creative direction,
                I&apos;m here to help bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {content.email && (
                  <Button asChild size="lg">
                    <a href={`mailto:${content.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </a>
                  </Button>
                )}
                {content.phone && (
                  <Button asChild variant="outline" size="lg">
                    <a href={`tel:${content.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
