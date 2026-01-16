import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Project from "@/lib/models/Project"

// GET - Fetch projects for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const employerId = searchParams.get("employerId")
    const status = searchParams.get("status") // optional filter

    if (!employerId) {
      return NextResponse.json(
        { error: "employerId is required" },
        { status: 400 }
      )
    }

    // Build query
    const query: any = { employerId }
    
    if (status && status !== "all") {
      query.status = status
    }

    // Fetch projects, sorted by newest first
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ projects }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      title,
      description,
      status,
      progress,
      employerId,
      employerEmail,
      employerUsername,
      jobId,
      budget,
      currency,
      milestones,
      agent,
    } = body

    // Validate required fields
    if (!title || !employerId || !budget) {
      return NextResponse.json(
        { error: "Missing required fields: title, employerId, and budget are required" },
        { status: 400 }
      )
    }

    // Create new project
    const project = await Project.create({
      title,
      description,
      status: status || "active",
      progress: progress || 0,
      employerId,
      employerEmail,
      employerUsername,
      jobId,
      budget: parseFloat(budget),
      currency: currency || "SOL",
      milestones: milestones || [],
      agent,
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

