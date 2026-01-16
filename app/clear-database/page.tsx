"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/page-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function ClearDatabasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    users: number
    jobs: number
    projects: number
    transactions: number
  } | null>(null)

  const clearDatabase = async () => {
    if (!confirm("⚠️ Are you absolutely sure you want to delete ALL users, jobs, projects, and transactions from the database? This action cannot be undone!")) {
      return
    }

    if (!confirm("This will delete EVERYTHING. Last chance to cancel!")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to clear database")
      }

      const data = await response.json()
      setResult(data.deleted)
      
      toast({
        title: "Database Cleared",
        description: `Deleted ${data.deleted.users} users, ${data.deleted.jobs} jobs, ${data.deleted.projects} projects, and ${data.deleted.transactions} transactions.`,
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error clearing database:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to clear database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="container py-20 px-4 max-w-2xl mx-auto">
        <Card className="bg-black/80 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-red-400" />
              Clear Database
            </CardTitle>
            <CardDescription className="text-white/60">
              Delete all users, jobs, projects, and transactions from the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold mb-1">⚠️ Warning: Destructive Action</p>
                  <p className="text-red-300/80 text-sm">
                    This will permanently delete <strong>ALL</strong> data from the database:
                  </p>
                  <ul className="text-red-300/70 text-sm list-disc list-inside mt-2 space-y-1">
                    <li>All users and their profiles</li>
                    <li>All jobs/postings</li>
                    <li>All projects</li>
                    <li>All transactions</li>
                  </ul>
                  <p className="text-red-300/80 text-sm mt-2 font-semibold">
                    This action cannot be undone!
                  </p>
                </div>
              </div>
            </div>

            {result && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-semibold mb-2">✅ Database Cleared Successfully</p>
                    <div className="text-green-300/80 text-sm space-y-1">
                      <p>• Users deleted: {result.users}</p>
                      <p>• Jobs deleted: {result.jobs}</p>
                      <p>• Projects deleted: {result.projects}</p>
                      <p>• Transactions deleted: {result.transactions}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">
                <strong>Note:</strong>
              </p>
              <p className="text-white/60 text-sm">
                This only clears data from your MongoDB database. Privy user accounts and wallets 
                are managed separately in the{" "}
                <a 
                  href="https://dashboard.privy.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  Privy Dashboard
                </a>.
              </p>
            </div>

            <Button 
              onClick={clearDatabase}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Clearing Database...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Database Data
                </>
              )}
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}


