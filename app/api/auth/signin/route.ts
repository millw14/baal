import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { privyId, email, username, wallets } = body

    if (!privyId || !email) {
      return NextResponse.json(
        { error: "privyId and email are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    let user = await User.findOne({ privyId })

    if (user) {
      // Update last login time
      user.lastLoginAt = new Date()
      
      // Update wallets if provided (merge with existing)
      if (wallets && Array.isArray(wallets)) {
        const existingAddresses = new Set(user.wallets.map((w: any) => w.address))
        const newWallets = wallets.filter((w: any) => !existingAddresses.has(w.address))
        if (newWallets.length > 0) {
          user.wallets.push(...newWallets)
        }
      }

      await user.save()
      return NextResponse.json(
        { 
          user, 
          message: "Sign in successful",
          isNewUser: false 
        },
        { status: 200 }
      )
    } else {
      // Create new user
      user = await User.create({
        privyId,
        email: email.toLowerCase(),
        username,
        wallets: wallets || [],
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

      return NextResponse.json(
        { 
          user, 
          message: "User created successfully",
          isNewUser: true 
        },
        { status: 201 }
      )
    }
  } catch (error: any) {
    console.error("Error signing in:", error)
    
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

