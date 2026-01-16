import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  privyId: string // Privy user ID (unique identifier)
  email: string
  username?: string
  wallets: {
    address: string
    chainType: string // "solana" or other chains
    walletType?: string // "managed" or "external"
    encryptedSecretKey?: string // Encrypted private key (only for managed wallets)
  }[]
  profilePicture?: string
  bio?: string
  title?: string // Professional title (e.g., "Full Stack Developer", "Product Manager")
  location?: {
    city?: string
    country?: string
  }
    skills?: string[] // Array of skill tags
  languages?: {
    language: string
    proficiency: "native" | "fluent" | "conversational" | "basic"
  }[]
  experience?: {
    title: string
    company: string
    location?: string
    startDate: Date
    endDate?: Date
    current: boolean
    description?: string
  }[]
  education?: {
    school: string
    degree: string
    field?: string
    startDate?: Date
    endDate?: Date
    current: boolean
    description?: string
  }[]
  certifications?: {
    name: string
    issuer: string
    issueDate?: Date
    expiryDate?: Date
    credentialId?: string
    credentialUrl?: string
  }[]
  portfolio?: {
    title: string
    description?: string
    url?: string
    imageUrl?: string
  }[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  // Additional fields
  verified?: boolean
  onboardingCompleted?: boolean
  preferences?: {
    theme?: "light" | "dark" | "system"
    notifications?: boolean
  }
  stats?: {
    jobsPosted?: number
    jobsCompleted?: number
    totalSpent?: number
    totalEarned?: number
  }
}

const UserSchema: Schema = new Schema(
  {
    privyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      sparse: true, // Allows null/undefined but ensures uniqueness when present
    },
    wallets: [
      {
        address: {
          type: String,
          required: true,
        },
        chainType: {
          type: String,
          required: true,
          default: "solana",
        },
        walletType: {
          type: String,
          enum: ["managed", "external"], // "managed" = our generated wallets, "external" = Phantom/Solflare
          default: "managed",
        },
        // Encrypted private key (only for managed wallets)
        encryptedSecretKey: {
          type: String,
          required: false, // Only required for managed wallets
        },
      },
    ],
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 5000,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    location: {
      city: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    skills: [{
      type: String,
      trim: true,
    }],
    languages: [{
      language: { type: String, required: true, trim: true },
      proficiency: {
        type: String,
        enum: ["native", "fluent", "conversational", "basic"],
        required: true,
      },
    }],
    experience: [{
      title: { type: String, required: true, trim: true },
      company: { type: String, required: true, trim: true },
      location: { type: String, trim: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      current: { type: Boolean, default: false },
      description: { type: String, maxlength: 2000 },
    }],
    education: [{
      school: { type: String, required: true, trim: true },
      degree: { type: String, required: true, trim: true },
      field: { type: String, trim: true },
      startDate: { type: Date },
      endDate: { type: Date },
      current: { type: Boolean, default: false },
      description: { type: String, maxlength: 1000 },
    }],
    certifications: [{
      name: { type: String, required: true, trim: true },
      issuer: { type: String, required: true, trim: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      credentialId: { type: String, trim: true },
      credentialUrl: { type: String, trim: true },
    }],
    portfolio: [{
      title: { type: String, required: true, trim: true },
      description: { type: String, maxlength: 1000 },
      url: { type: String, trim: true },
      imageUrl: { type: String, trim: true },
    }],
    lastLoginAt: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "dark",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      jobsPosted: {
        type: Number,
        default: 0,
      },
      jobsCompleted: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      totalEarned: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
)

// Create indexes (privyId index is already defined in schema with unique: true and index: true)
UserSchema.index({ email: 1 })
UserSchema.index({ "wallets.address": 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User

