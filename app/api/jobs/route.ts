import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/lib/models/Job"

// GET - Fetch all open jobs (for logged-in users)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "open"
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = parseInt(searchParams.get("skip") || "0")

    // Build query
    const query: any = {}
    
    if (status && status !== "all") {
      query.status = status
    }
    
    if (category && category !== "all") {
      query.category = category
    }

    // Fetch jobs, sorted by newest first
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    // Get total count for pagination
    const total = await Job.countDocuments(query)

    return NextResponse.json(
      {
        jobs,
        total,
        limit,
        skip,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new job
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      title,
      description,
      category,
      budget,
      currency,
      duration,
      jobType,
      skills,
      employerId,
      employerEmail,
      employerUsername,
    } = body

    // Validate required fields
    if (!title || !description || !category || !budget || !employerId) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, category, budget, and employerId are required" },
        { status: 400 }
      )
    }

    // Create new job
    const job = await Job.create({
      title,
      description,
      category,
      budget: parseFloat(budget),
      currency: currency || "SOL",
      duration: duration || "Flexible",
      jobType: jobType || "one-time",
      skills: skills || [],
      status: "open",
      employerId,
      employerEmail,
      employerUsername,
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

