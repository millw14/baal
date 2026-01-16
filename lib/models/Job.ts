import mongoose, { Document, Schema } from "mongoose"

export interface IJob extends Document {
  title: string
  description: string
  category: string
  budget: number
  currency: "SOL" | "USDC"
  duration: "1-3 days" | "1 week" | "2 weeks" | "1 month" | "Flexible"
  jobType: "one-time" | "ongoing" | "milestone"
  skills?: string[]
  status: "open" | "in-progress" | "completed" | "cancelled"
  employerId: string // Privy ID of the employer
  employerEmail?: string
  employerUsername?: string
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
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
    duration: {
      type: String,
      enum: ["1-3 days", "1 week", "2 weeks", "1 month", "Flexible"],
      required: true,
      default: "Flexible",
    },
    jobType: {
      type: String,
      enum: ["one-time", "ongoing", "milestone"],
      required: true,
      default: "one-time",
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
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
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
JobSchema.index({ status: 1, createdAt: -1 })
JobSchema.index({ category: 1, status: 1 })
JobSchema.index({ employerId: 1, status: 1 })

const Job = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema)

export default Job

