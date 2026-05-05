// Type definitions for API data models

export type WorkItem = {
  id: string
  title: string
  description: string
  type: "youtube" | "short-form" | "other" | "carousel"
  url?: string | null
  thumbnailUrl?: string | null
  images?: string[]
  visible?: boolean
  createdAt: string
}

export type AboutContent = {
  title: string
  description: string
  skills: Skill[]
}

export type Skill = {
  title: string
  description: string
  icon: string
}

export type ContactContent = {
  email: string
  phone: string
  resumeUrl?: string | null
}

export type SiteContent = {
  about?: AboutContent | null
  contact?: ContactContent | null
}

export type User = {
  id: string
  email: string
  firstName: string
  createdAt: Date
}
