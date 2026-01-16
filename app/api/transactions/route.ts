import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Transaction from "@/lib/models/Transaction"

// GET - Fetch transactions for a wallet address
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const walletAddress = searchParams.get("walletAddress")
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = parseInt(searchParams.get("skip") || "0")

    if (!walletAddress && !userId) {
      return NextResponse.json(
        { error: "walletAddress or userId is required" },
        { status: 400 }
      )
    }

    // Build query
    const query: any = {}
    
    if (walletAddress) {
      query.walletAddress = walletAddress
    }
    
    if (userId) {
      query.userId = userId
    }

    // Fetch transactions, sorted by newest first
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    // Get total count
    const total = await Transaction.countDocuments(query)

    return NextResponse.json(
      {
        transactions,
        total,
        limit,
        skip,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      type,
      amount,
      currency,
      status,
      fromAddress,
      toAddress,
      walletAddress,
      userId,
      description,
      txHash,
      projectId,
      jobId,
    } = body

    // Validate required fields
    if (!type || !amount || !walletAddress || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: type, amount, walletAddress, and userId are required" },
        { status: 400 }
      )
    }

    // Create new transaction
    const transaction = await Transaction.create({
      type,
      amount: parseFloat(amount),
      currency: currency || "SOL",
      status: status || "pending",
      fromAddress,
      toAddress,
      walletAddress,
      userId,
      description,
      txHash,
      projectId,
      jobId,
      completedAt: status === "completed" ? new Date() : undefined,
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

