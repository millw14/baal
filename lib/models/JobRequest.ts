import mongoose, { Schema, Document, Model } from "mongoose"

export interface IJobRequest extends Document {
  userId: mongoose.Types.ObjectId // Reference to User
  privyId: string // Also store privyId for easier querying
  userMessage: string // Original user message
  analyzedData?: {
    summary: string
    category?: string
    requirements?: string[]
    estimatedComplexity?: string
    recommendedAgents?: string[]
  }
  collectedInfo?: {
    [key: string]: any // Flexible structure for collected information from modals
  }
  selectedAgent?: string // "baal", "luna", "maki"
  status: "pending" | "info_collected" | "agent_selected" | "paid" | "completed" | "cancelled"
  isFreeUse: boolean // Whether this is a free use (for Baal's first 3 uses)
  paymentAmount?: number // Amount paid in SOL (0.05 or 0 for free)
  paymentTransactionId?: mongoose.Types.ObjectId // Reference to Transaction if paid
  createdAt: Date
  updatedAt: Date
}

const JobRequestSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    privyId: {
      type: String,
      required: true,
      index: true,
    },
    userMessage: {
      type: String,
      required: true,
    },
    analyzedData: {
      summary: String,
      category: String,
      requirements: [String],
      estimatedComplexity: String,
      recommendedAgents: [String],
    },
    collectedInfo: {
      type: Schema.Types.Mixed, // Flexible structure
    },
    selectedAgent: {
      type: String,
      enum: ["baal", "luna", "maki"],
    },
    status: {
      type: String,
      enum: ["pending", "info_collected", "agent_selected", "paid", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    isFreeUse: {
      type: Boolean,
      default: false,
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    paymentTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  {
    timestamps: true,
  }
)

// Index for querying user's job requests
JobRequestSchema.index({ userId: 1, createdAt: -1 })
JobRequestSchema.index({ privyId: 1, status: 1 })

const JobRequest: Model<IJobRequest> =
  mongoose.models.JobRequest || mongoose.model<IJobRequest>("JobRequest", JobRequestSchema)

export default JobRequest

