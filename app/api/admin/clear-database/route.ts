import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Job from "@/lib/models/Job"
import Project from "@/lib/models/Project"
import Transaction from "@/lib/models/Transaction"

// DELETE - Clear all users and related data from the database
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    // Delete all users
    const usersDeleted = await User.deleteMany({})
    console.log(`Deleted ${usersDeleted.deletedCount} users`)

    // Delete all jobs
    const jobsDeleted = await Job.deleteMany({})
    console.log(`Deleted ${jobsDeleted.deletedCount} jobs`)

    // Delete all projects
    const projectsDeleted = await Project.deleteMany({})
    console.log(`Deleted ${projectsDeleted.deletedCount} projects`)

    // Delete all transactions
    const transactionsDeleted = await Transaction.deleteMany({})
    console.log(`Deleted ${transactionsDeleted.deletedCount} transactions`)

    return NextResponse.json(
      {
        message: "Database cleared successfully",
        deleted: {
          users: usersDeleted.deletedCount,
          jobs: jobsDeleted.deletedCount,
          projects: projectsDeleted.deletedCount,
          transactions: transactionsDeleted.deletedCount,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error clearing database:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}


