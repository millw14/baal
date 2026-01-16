import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

// DELETE - Clear all users from the database
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    // Delete all users
    const usersDeleted = await User.deleteMany({})
    console.log(`Deleted ${usersDeleted.deletedCount} users`)

    return NextResponse.json(
      {
        message: "All users cleared successfully",
        deletedCount: usersDeleted.deletedCount,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error clearing users:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

