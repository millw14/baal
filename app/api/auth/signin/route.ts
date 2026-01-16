import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { createSolanaWallet } from "@/lib/utils/solana-wallet"

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
      
      // Check if user has a managed Solana wallet, create one if they don't
      const hasManagedWallet = user.wallets.some((w: any) => w.walletType === "managed")
      
      if (!hasManagedWallet) {
        console.log("🔧 Creating managed Solana wallet for existing user...")
        const walletData = createSolanaWallet()
        user.wallets.push({
          address: walletData.publicKey,
          chainType: "solana",
          walletType: "managed",
          encryptedSecretKey: walletData.encryptedSecretKey,
        })
      }
      
      // Update external wallets if provided (merge with existing)
      if (wallets && Array.isArray(wallets)) {
        const existingAddresses = new Set(user.wallets.map((w: any) => w.address))
        const newExternalWallets = wallets
          .filter((w: any) => !existingAddresses.has(w.address) && w.walletType === "external")
          .map((w: any) => ({
            address: w.address,
            chainType: "solana",
            walletType: "external",
          }))
        if (newExternalWallets.length > 0) {
          user.wallets.push(...newExternalWallets)
        }
      }

      await user.save()
      
      // Return user data without encrypted keys for security
      const userResponse = user.toObject()
      userResponse.wallets = userResponse.wallets.map((w: any) => {
        const { encryptedSecretKey, ...wallet } = w
        return wallet
      })
      
      return NextResponse.json(
        { 
          user: userResponse, 
          message: "Sign in successful",
          isNewUser: false 
        },
        { status: 200 }
      )
    } else {
      // Create new user with managed Solana wallet
      console.log("🔧 Creating new user with managed Solana wallet...")
      const walletData = createSolanaWallet()
      
      const userWallets: Array<{
        address: string
        chainType: string
        walletType: string
        encryptedSecretKey?: string
      }> = [
        {
          address: walletData.publicKey,
          chainType: "solana",
          walletType: "managed",
          encryptedSecretKey: walletData.encryptedSecretKey,
        },
      ]
      
      // Add any external wallets if provided
      if (wallets && Array.isArray(wallets)) {
        const externalWallets = wallets
          .filter((w: any) => w.walletType === "external")
          .map((w: any) => ({
            address: w.address,
            chainType: "solana",
            walletType: "external",
          }))
        userWallets.push(...externalWallets)
      }
      
      user = await User.create({
        privyId,
        email: email.toLowerCase(),
        username,
        wallets: userWallets,
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

      // Return user data without encrypted keys for security
      const userResponse = user.toObject()
      userResponse.wallets = userResponse.wallets.map((w: any) => {
        const { encryptedSecretKey, ...wallet } = w
        return wallet
      })

      return NextResponse.json(
        { 
          user: userResponse, 
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

