import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const privyId = searchParams.get("privyId")
    const email = searchParams.get("email")
    const walletAddress = searchParams.get("walletAddress")

    if (!privyId && !email && !walletAddress) {
      return NextResponse.json(
        { error: "Please provide privyId, email, or walletAddress" },
        { status: 400 }
      )
    }

    let user

    if (privyId) {
      user = await User.findOne({ privyId })
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() })
    } else if (walletAddress) {
      user = await User.findOne({ "wallets.address": walletAddress })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { privyId, email, username, wallets, profilePicture, bio } = body

    if (!privyId || !email) {
      return NextResponse.json(
        { error: "privyId and email are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    let user = await User.findOne({ privyId })

    if (user) {
      // Update existing user
      const updateData: any = {
        lastLoginAt: new Date(),
      }

      if (email) updateData.email = email.toLowerCase()
      if (username) updateData.username = username
      if (profilePicture) updateData.profilePicture = profilePicture
      if (bio !== undefined) updateData.bio = bio

      // Update wallets if provided
      if (wallets && Array.isArray(wallets)) {
        // Merge new wallets with existing ones, avoiding duplicates
        const existingAddresses = new Set(user.wallets.map((w: any) => w.address))
        const newWallets = wallets.filter((w: any) => !existingAddresses.has(w.address))
        updateData.$push = { wallets: { $each: newWallets } }
      }

      user = await User.findOneAndUpdate({ privyId }, updateData, { new: true })
    } else {
      // Create new user
      user = await User.create({
        privyId,
        email: email.toLowerCase(),
        username,
        wallets: wallets || [],
        profilePicture,
        bio,
        lastLoginAt: new Date(),
        verified: false,
        onboardingCompleted: false,
        preferences: {
          theme: "dark",
          notifications: true,
        },
        stats: {
          jobsPosted: 0,
          jobsCompleted: 0,
          totalSpent: 0,
          totalEarned: 0,
        },
      })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error("Error creating/updating user:", error)
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "User with this email or privyId already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { privyId, ...updateData } = body

    if (!privyId) {
      return NextResponse.json(
        { error: "privyId is required" },
        { status: 400 }
      )
    }

    // Normalize email if provided
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase()
    }

    // Convert date strings to Date objects for experience, education, and certifications
    if (updateData.experience && Array.isArray(updateData.experience)) {
      updateData.experience = updateData.experience.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate) : undefined,
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
      }))
    }

    if (updateData.education && Array.isArray(updateData.education)) {
      updateData.education = updateData.education.map((edu: any) => ({
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate) : undefined,
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
      }))
    }

    if (updateData.certifications && Array.isArray(updateData.certifications)) {
      updateData.certifications = updateData.certifications.map((cert: any) => ({
        ...cert,
        issueDate: cert.issueDate ? new Date(cert.issueDate) : undefined,
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
      }))
    }

    const user = await User.findOneAndUpdate(
      { privyId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

