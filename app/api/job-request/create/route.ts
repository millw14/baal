import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import JobRequest from "@/lib/models/JobRequest"
import User from "@/lib/models/User"

const JOB_COST = 0.05 // 0.05 SOL per job
const FREE_BAAL_USES = 3 // First 3 Baal uses are free

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { privyId, userMessage, analyzedData, collectedInfo, selectedAgent } = body

    if (!privyId || !userMessage) {
      return NextResponse.json(
        { error: "privyId and userMessage are required" },
        { status: 400 }
      )
    }

    // Find user to get userId
    const user = await User.findOne({ privyId }).lean()
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if this is a free Baal use
    const baalJobRequests = await JobRequest.countDocuments({
      privyId,
      selectedAgent: "baal",
      status: { $in: ["paid", "completed"] },
    })

    const isFreeUse = selectedAgent === "baal" && baalJobRequests < FREE_BAAL_USES
    const paymentAmount = isFreeUse ? 0 : JOB_COST

    // Create job request with all data
    const jobRequest = await JobRequest.create({
      userId: user._id,
      privyId,
      userMessage,
      analyzedData: analyzedData || {},
      collectedInfo: collectedInfo || {},
      selectedAgent,
      status: isFreeUse ? "paid" : "pending", // Free uses are automatically "paid"
      isFreeUse,
      paymentAmount,
    })

    return NextResponse.json({
      jobRequest: {
        _id: jobRequest._id.toString(),
        userId: jobRequest.userId.toString(),
        privyId: jobRequest.privyId,
        userMessage: jobRequest.userMessage,
        analyzedData: jobRequest.analyzedData,
        collectedInfo: jobRequest.collectedInfo,
        selectedAgent: jobRequest.selectedAgent,
        status: jobRequest.status,
        isFreeUse: jobRequest.isFreeUse,
        paymentAmount: jobRequest.paymentAmount,
        freeUsesRemaining: isFreeUse ? Math.max(0, FREE_BAAL_USES - baalJobRequests - 1) : undefined,
        createdAt: jobRequest.createdAt,
        updatedAt: jobRequest.updatedAt,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating job request:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

// GET - Check free uses remaining
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const privyId = searchParams.get("privyId")

    if (!privyId) {
      return NextResponse.json(
        { error: "privyId is required" },
        { status: 400 }
      )
    }

    const baalJobRequests = await JobRequest.countDocuments({
      privyId,
      selectedAgent: "baal",
      status: { $in: ["paid", "completed"] },
    })

    const freeUsesRemaining = Math.max(0, FREE_BAAL_USES - baalJobRequests)

    return NextResponse.json({
      freeUsesRemaining,
      totalFreeUses: FREE_BAAL_USES,
      usedFreeUses: baalJobRequests,
    })
  } catch (error: any) {
    console.error("Error checking free uses:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

