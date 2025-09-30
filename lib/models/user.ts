import mongoose from 'mongoose'

export interface User {
  _id?: string
  email: string
  password: string
  firstName: string
  createdAt: Date
}

const userSchema = new mongoose.Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const UserModel = mongoose.models.User || mongoose.model<User>('User', userSchema)
