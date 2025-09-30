import mongoose from 'mongoose'

export interface AboutContentDoc {
  title: string
  description: string
  skills: Array<{
    title: string
    description: string
    icon: string
  }>
}

export interface ContactContentDoc {
  email: string
  phone: string
  resumeUrl?: string
}

export interface SiteContentDoc {
  about?: AboutContentDoc
  contact?: ContactContentDoc
  updatedAt: Date
}

const AboutSchema = new mongoose.Schema<AboutContentDoc>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      icon: { type: String, required: true },
    },
  ],
})

const ContactSchema = new mongoose.Schema<ContactContentDoc>({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String },
})

const siteContentSchema = new mongoose.Schema<SiteContentDoc>({
  about: { type: AboutSchema, required: false },
  contact: { type: ContactSchema, required: false },
  updatedAt: { type: Date, default: Date.now },
})

export const SiteContentModel =
  mongoose.models.SiteContent || mongoose.model<SiteContentDoc>('SiteContent', siteContentSchema)


