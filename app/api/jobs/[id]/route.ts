import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/lib/models/Job"

// GET - Fetch a single job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    const job = await Job.findById(id).lean()

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ job }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

