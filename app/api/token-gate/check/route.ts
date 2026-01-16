import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { checkTokenGate, checkTokenGatesAny, checkTokenGatesAll } from "@/lib/utils/token-gating"
import { Connection } from "@solana/web3.js"

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"

// Default token gate configuration - customize these
const DEFAULT_TOKEN_GATES = [
  {
    tokenMint: process.env.GATING_TOKEN_MINT || "SOL", // Set your token mint in .env
    minimumAmount: parseFloat(process.env.GATING_TOKEN_MIN_AMOUNT || "1"), // Minimum tokens required
    decimals: parseInt(process.env.GATING_TOKEN_DECIMALS || "9"),
  },
]

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { privyId, tokenGates } = body

    if (!privyId) {
      return NextResponse.json(
        { error: "privyId is required" },
        { status: 400 }
      )
    }

    // Get user and their managed wallet
    const user = await User.findOne({ privyId }).lean()
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const managedWallet = user.wallets?.find((w: any) => w.walletType === "managed")
    if (!managedWallet || !managedWallet.address) {
      return NextResponse.json(
        { error: "No managed wallet found" },
        { status: 400 }
      )
    }

    const connection = new Connection(SOLANA_RPC_URL, "confirmed")
    const gatesToCheck = tokenGates || DEFAULT_TOKEN_GATES

    // Check token gates (user needs to pass at least one by default)
    // Change to checkTokenGatesAll if user needs to pass all gates
    const result = await checkTokenGatesAny(
      managedWallet.address,
      gatesToCheck,
      connection
    )

    return NextResponse.json({
      hasAccess: result.hasAccess,
      passedGate: result.passedGate,
      details: result.details.map((d) => ({
        tokenMint: d.config.tokenMint,
        minimumAmount: d.config.minimumAmount,
        hasAccess: d.result.hasAccess,
        balance: d.result.balance,
      })),
    })
  } catch (error: any) {
    console.error("Error checking token gate:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

