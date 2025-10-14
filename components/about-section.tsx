"use client"

import React from "react"
import { NameHighlighter } from "./name-highlighter"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, TrendingUp, Sparkles, Target, Edit, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { api } from "@/lib/api-client"

interface Skill {
  title: string
  description: string
  icon: string
}

interface AboutContent {
  title: string
  description: string
  aboutMe: string
  skills: Skill[]
}

const iconOptions = [
  { value: "Video", label: "Video", icon: Video },
  { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "Target", label: "Target", icon: Target },
]

export function AboutSection() {
  const [content, setContent] = useState<AboutContent>({
    title: "What I Do",
    description: "Combining technical expertise with creative storytelling to deliver exceptional results",
    aboutMe: "I'm a passionate video editor and content strategist with over 5 years of experience creating compelling visual stories. My journey began with a love for storytelling and has evolved into a expertise in video production, content strategy, and brand development. When I'm not editing videos, you'll find me exploring new creative techniques or mentoring aspiring creators.",
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

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const data = await api.get<{ about?: AboutContent }>('/api/site-content')
      if (data.about) {
        setContent(data.about)
      }
    } catch (error) {
      console.error('Failed to load about content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (updatedContent: AboutContent) => {
    try {
      await api.put('/api/site-content', {
        type: 'about',
        content: updatedContent
      })
      setContent(updatedContent)
      setIsEditing(false)
      setEditingSkillIndex(null)
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
      <section id="about" className="relative py-20 md:py-32 overflow-hidden flex flex-col items-center">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading about content...</span>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="relative py-20 md:py-32 overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-primary/8 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-primary/6 rounded-full blur-2xl animate-pulse-slow" />
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-balance">
                About Me
              </h2>
              {isAuthenticated && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="opacity-50 hover:opacity-100">
                      <Edit className="h-4 w-4" />
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
                        <div>
                          <Label htmlFor="aboutMe">About Me</Label>
                          <Textarea
                            id="aboutMe"
                            value={content.aboutMe}
                            onChange={(e) => setContent(prev => ({ ...prev, aboutMe: e.target.value }))}
                            rows={6}
                            placeholder="Write about yourself, your background, experience, and what makes you unique..."
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
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* About Me Section */}
            {content.aboutMe && (
              <div className="mb-8 animate-fade-in-up">
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                    {content.aboutMe.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        <NameHighlighter text={paragraph} />
                      </p>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            <p className="text-lg text-muted-foreground  mx-auto text-balance">
              <NameHighlighter text={content.description} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {content.skills.map((skill, index) => (
              <Card
                key={skill.title + index}
                className="p-6 lg:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm animate-scale-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                    {React.createElement(getIconComponent(skill.icon), { className: "h-6 w-6" })}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{skill.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{skill.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
