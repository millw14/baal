import mongoose, { Document, Schema } from "mongoose"

export interface ITransaction extends Document {
  type: "deposit" | "withdrawal" | "payment" | "refund" | "escrow" | "milestone"
  amount: number
  currency: "SOL" | "USDC"
  status: "pending" | "completed" | "failed"
  fromAddress?: string // Wallet address (sender)
  toAddress?: string // Wallet address (receiver)
  walletAddress: string // The wallet address this transaction belongs to
  userId: string // Privy ID of the user
  description?: string
  txHash?: string // Solana transaction signature
  projectId?: string // Reference to project if related
  jobId?: string // Reference to job if related
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "payment", "refund", "escrow", "milestone"],
      required: true,
      index: true,
    },
    amount: {
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
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    fromAddress: {
      type: String,
    },
    toAddress: {
      type: String,
    },
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    txHash: {
      type: String,
      index: true,
    },
    projectId: {
      type: String,
      index: true,
    },
    jobId: {
      type: String,
      index: true,
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
TransactionSchema.index({ walletAddress: 1, createdAt: -1 })
TransactionSchema.index({ userId: 1, createdAt: -1 })
TransactionSchema.index({ status: 1, createdAt: -1 })

const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema)

export default Transaction

