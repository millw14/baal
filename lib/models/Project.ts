import mongoose, { Document, Schema } from "mongoose"

export interface IProject extends Document {
  title: string
  description?: string
  status: "active" | "completed" | "paused" | "cancelled"
  progress: number // 0-100
  employerId: string // Privy ID of the employer
  employerEmail?: string
  employerUsername?: string
  jobId?: string // Reference to the job that created this project
  budget: number
  currency: "SOL" | "USDC"
  milestones: {
    id: string
    title: string
    description?: string
    status: "pending" | "in-progress" | "completed"
    dueDate?: Date
    completedDate?: Date
    amount?: number // Amount paid for this milestone
  }[]
  agent?: {
    name: string
    id?: string
    avatar?: string
  }
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    employerId: {
      type: String,
      required: true,
      index: true,
    },
    employerEmail: {
      type: String,
    },
    employerUsername: {
      type: String,
    },
    jobId: {
      type: String,
      index: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["SOL", "USDC"],
      required: true,
      default: "SOL",
    },
    milestones: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String },
          status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
          },
          dueDate: { type: Date },
          completedDate: { type: Date },
          amount: { type: Number, min: 0 },
        },
      ],
      default: [],
    },
    agent: {
      name: { type: String },
      id: { type: String },
      avatar: { type: String },
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
ProjectSchema.index({ employerId: 1, status: 1 })
ProjectSchema.index({ status: 1, createdAt: -1 })

const Project = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)

export default Project

