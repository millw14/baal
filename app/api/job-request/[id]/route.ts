import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import JobRequest from "@/lib/models/JobRequest"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const jobRequest = await JobRequest.findById(id).lean()

    if (!jobRequest) {
      return NextResponse.json(
        { error: "Job request not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ jobRequest }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching job request:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

