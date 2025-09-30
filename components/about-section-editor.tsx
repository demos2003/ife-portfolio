"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, TrendingUp, Sparkles, Target, Edit, Loader2, Save, User, Info } from "lucide-react"

interface Skill {
  title: string
  description: string
  icon: string
}

interface AboutContent {
  title: string
  description: string
  skills: Skill[]
}

const iconOptions = [
  { value: "Video", label: "Video", icon: Video },
  { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "Target", label: "Target", icon: Target },
]

export function AboutSectionEditor() {
  const [content, setContent] = useState<AboutContent>({
    title: "What I Do",
    description: "Combining technical expertise with creative storytelling to deliver exceptional results",
    skills: [
      {
        title: "Video Editing",
        description: "Expert in creating compelling narratives through professional video editing and post-production",
        icon: "Video"
      },
      {
        title: "Content Strategy",
        description: "Data-driven approach to content creation that maximizes engagement and reach",
        icon: "TrendingUp"
      },
      {
        title: "Creative Direction",
        description: "Bringing unique creative vision to every project with attention to detail",
        icon: "Sparkles"
      },
      {
        title: "Brand Storytelling",
        description: "Crafting authentic stories that connect brands with their audiences",
        icon: "Target"
      },
    ]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    skills: [] as Skill[]
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch('/api/site-content')
      if (response.ok) {
        const data = await response.json()
        if (data.about) {
          setContent(data.about)
        }
      }
    } catch (error) {
      console.error('Failed to load about content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (updatedContent: AboutContent) => {
    try {
      const response = await fetch('/api/site-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'about',
          content: updatedContent
        }),
      })

      if (response.ok) {
        setContent(updatedContent)
        setIsEditing(false)
        setEditingSkillIndex(null)
      }
    } catch (error) {
      console.error('Failed to save about content:', error)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName)
    return iconOption ? iconOption.icon : Video
  }

  const handleEditSkill = (index: number) => {
    setEditingSkillIndex(index)
    setEditForm({
      title: content.skills[index].title,
      description: content.skills[index].description,
      skills: content.skills
    })
  }

  const handleSaveSkill = () => {
    if (editingSkillIndex !== null) {
      const updatedSkills = [...content.skills]
      updatedSkills[editingSkillIndex] = {
        title: editForm.title,
        description: editForm.description,
        icon: editForm.skills[editingSkillIndex]?.icon || "Video"
      }

      const updatedContent = {
        ...content,
        skills: updatedSkills
      }

      saveContent(updatedContent)
    }
  }

  const handleAddSkill = () => {
    const newSkill: Skill = {
      title: "New Skill",
      description: "Description of the new skill",
      icon: "Video"
    }

    const updatedContent = {
      ...content,
      skills: [...content.skills, newSkill]
    }

    saveContent(updatedContent)
  }

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = content.skills.filter((_, i) => i !== index)
    const updatedContent = {
      ...content,
      skills: updatedSkills
    }

    saveContent(updatedContent)
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            About Section
          </CardTitle>
          <CardDescription>Manage your about me content and skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading about content...</span>
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
          About Section
        </CardTitle>
        <CardDescription>Manage your about me content and skills</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Content Preview */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Content</h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-1">{content.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{content.description}</p>
              <div className="space-y-2">
                <span className="text-sm font-medium">Skills ({content.skills.length})</span>
                <div className="grid grid-cols-1 gap-2">
                  {content.skills.slice(0, 2).map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {React.createElement(getIconComponent(skill.icon), { className: "h-4 w-4" })}
                      <span>{skill.title}</span>
                    </div>
                  ))}
                  {content.skills.length > 2 && (
                    <span className="text-xs text-muted-foreground">+{content.skills.length - 2} more skills</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit About Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit About Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Section Title</Label>
                  <Input
                    id="title"
                    value={content.title}
                    onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={content.description}
                    onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Skills</Label>
                  <Button onClick={handleAddSkill} size="sm">
                    Add Skill
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {content.skills.map((skill, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Skill {index + 1}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSkill(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSkill(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      {editingSkillIndex === index ? (
                        <div className="space-y-3">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Icon</Label>
                            <Select
                              value={editForm.skills[index]?.icon || "Video"}
                              onValueChange={(value) => {
                                const updatedSkills = [...editForm.skills]
                                if (!updatedSkills[index]) updatedSkills[index] = { title: "", description: "", icon: "Video" }
                                updatedSkills[index].icon = value
                                setEditForm(prev => ({ ...prev, skills: updatedSkills }))
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveSkill} size="sm">
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSkillIndex(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {React.createElement(getIconComponent(skill.icon), { className: "h-4 w-4" })}
                            <span className="font-medium">{skill.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={() => saveContent(content)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
