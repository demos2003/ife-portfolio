import mongoose from 'mongoose'

export interface WorkItem {
  _id: string  // MongoDB auto-generated ObjectId
  title: string
  description: string
  type: "youtube" | "short-form" | "other" | "carousel"
  url?: string
  thumbnailUrl?: string
  images?: string[]
  visible?: boolean
  createdAt: string
}

const workItemSchema = new mongoose.Schema<WorkItem>({
  visible: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["youtube", "short-form", "other", "carousel"],
    required: true,
  },
  url: {
    type: String,
    required: function() {
      // URL is required for youtube and short-form, optional for other
      return this.type === 'youtube' || this.type === 'short-form';
    },
  },
  thumbnailUrl: {
    type: String,
    required: false,
  },
  images: {
    type: [String],
    required: false,
    default: undefined,
  },
  createdAt: {
    type: String,
    required: true,
  },
})

// Clear any existing model to force schema refresh
delete mongoose.models.WorkItem

export const WorkItemModel = mongoose.model<WorkItem>('WorkItem', workItemSchema)
