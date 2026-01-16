"use client"

import { use, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Code, Palette, Rocket, FileText, CheckCircle2, MessageSquare, Send, Activity, Terminal, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"

interface JobRequest {
  _id: string
  userMessage: string
  analyzedData?: {
    summary?: string
    category?: string
    requirements?: string[]
    estimatedComplexity?: string
    recommendedAgents?: string[]
    reasoning?: string
    questions?: any[]
  }
  collectedInfo?: Record<string, any>
  selectedAgent?: string
  status: string
  isFreeUse: boolean
  paymentAmount?: number
  createdAt: string
  updatedAt: string
}

interface Activity {
  id: string
  type: "message" | "task" | "output" | "error"
  content: string
  timestamp: Date
  from?: "user" | "agent"
}

const agentInfo: Record<string, { name: string; image: string; color: string; icon: any; workspaceColor: string }> = {
  baal: {
    name: "Baal",
    image: "/agents/Baal.jpg",
    color: "from-blue-500 to-cyan-500",
    workspaceColor: "from-blue-900/30 to-cyan-900/30",
    icon: Sparkles,
  },
  luna: {
    name: "Luna",
    image: "/agents/Luna.jpg",
    color: "from-pink-500 to-rose-500",
    workspaceColor: "from-pink-900/30 to-rose-900/30",
    icon: Palette,
  },
  maki: {
    name: "Maki",
    image: "/agents/Maki.jpg",
    color: "from-purple-500 to-indigo-500",
    workspaceColor: "from-purple-900/30 to-indigo-900/30",
    icon: Code,
  },
}

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const [jobRequest, setJobRequest] = useState<JobRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workProgress, setWorkProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState("Initializing workspace...")
  const [activities, setActivities] = useState<Activity[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isWorking, setIsWorking] = useState(true)

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      router.push("/")
      return
    }

    const fetchJobRequest = async () => {
      try {
        const response = await fetch(`/api/job-request/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch job request")
        }
        const data = await response.json()
        setJobRequest(data.jobRequest)
        
        // Initialize with welcome activity
        setActivities([
          {
            id: "1",
            type: "message",
            content: `Welcome to ${data.jobRequest.selectedAgent ? agentInfo[data.jobRequest.selectedAgent]?.name || "Agent" : "Agent"}'s workspace! I'm ready to work on your project.`,
            timestamp: new Date(),
            from: "agent",
          },
        ])
      } catch (err: any) {
        setError(err.message || "Failed to load job request")
      } finally {
        setLoading(false)
      }
    }

    fetchJobRequest()
  }, [id, ready, authenticated, router])

  // Simulate agent working on the project
  useEffect(() => {
    if (!jobRequest || loading) return

    const tasks = [
      "Analyzing requirements...",
      "Setting up workspace...",
      "Gathering resources...",
      "Starting creative process...",
      "Building core components...",
      "Refining details...",
      "Finalizing output...",
    ]

    let currentTaskIndex = 0
    let progress = 0
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval)
        setCurrentTask("Project completed!")
        setIsWorking(false)
        return
      }

      progress = Math.min(progress + Math.random() * 15, 100)
      setWorkProgress(progress)

      const taskThreshold = ((currentTaskIndex + 1) / tasks.length) * 100
      if (progress >= taskThreshold && currentTaskIndex < tasks.length - 1) {
        currentTaskIndex = Math.min(currentTaskIndex + 1, tasks.length - 1)
        setCurrentTask(tasks[currentTaskIndex])
        
        // Add activity for task change
        setActivities((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "task",
            content: tasks[currentTaskIndex],
            timestamp: new Date(),
            from: "agent",
          },
        ])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobRequest, loading])

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: Activity = {
      id: Date.now().toString(),
      type: "message",
      content: chatInput,
      timestamp: new Date(),
      from: "user",
    }

    setActivities((prev) => [...prev, userMessage])
    setChatInput("")

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Activity = {
        id: (Date.now() + 1).toString(),
        type: "message",
        content: "I'm working on that! Let me update the workspace...",
        timestamp: new Date(),
        from: "agent",
      }
      setActivities((prev) => [...prev, agentResponse])
    }, 1000)
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            <p className="text-white/70">Loading workspace...</p>
          </motion.div>
        </div>
      </PageWrapper>
    )
  }

  if (error || !jobRequest) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-black/90 border-white/20 text-white max-w-md">
            <CardContent className="pt-6">
              <p className="text-red-400">{error || "Job request not found"}</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-4 w-full bg-purple-500 hover:bg-purple-600"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    )
  }

  const agent = jobRequest.selectedAgent ? agentInfo[jobRequest.selectedAgent] : null
  const AgentIcon = agent?.icon || Sparkles

  return (
    <PageWrapper>
      <div className={`min-h-screen bg-gradient-to-br from-black via-black to-black ${agent?.workspaceColor || ""} relative`}>
        {/* Animated entrance */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="container mx-auto px-4 py-6 h-screen flex flex-col"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-gradient-to-r ${agent?.color || "from-purple-500 to-indigo-500"}`}>
                    {agent && (
                      <Image
                        src={agent.image}
                        alt={agent.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {agent?.name || "Agent"}'s Workspace
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge className={`bg-gradient-to-r ${agent?.color || "from-purple-500 to-indigo-500"} text-white border-0`}>
                        {isWorking ? "Working" : "Completed"}
                      </Badge>
                      {jobRequest.isFreeUse && (
                        <Badge className="bg-green-500/30 text-green-300 border-green-400/50">
                          Free Use
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
              {/* Left Column - Project Info */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-1 space-y-4 overflow-y-auto"
              >
                {/* Project Overview */}
                <Card className="bg-black/60 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-4 w-4" />
                      Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-white/60 mb-1">Request</p>
                      <p className="text-white">{jobRequest.userMessage}</p>
                    </div>
                    {jobRequest.analyzedData?.summary && (
                      <div>
                        <p className="text-white/60 mb-1">Summary</p>
                        <p className="text-white/90">{jobRequest.analyzedData.summary}</p>
                      </div>
                    )}
                    {jobRequest.analyzedData?.category && (
                      <div>
                        <p className="text-white/60 mb-1">Category</p>
                        <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                          {jobRequest.analyzedData.category}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Progress */}
                <Card className="bg-black/60 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Rocket className="h-4 w-4" />
                      Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-white/70">{currentTask}</p>
                        <p className="text-sm font-semibold text-purple-400">{Math.round(workProgress)}%</p>
                      </div>
                      <Progress value={workProgress} className="h-2 bg-white/10" />
                    </div>
                    
                    {isWorking && (
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="flex items-center gap-2 text-purple-400 text-xs"
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Active</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Requirements */}
                {jobRequest.analyzedData?.requirements && jobRequest.analyzedData.requirements.length > 0 && (
                  <Card className="bg-black/60 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers className="h-4 w-4" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {jobRequest.analyzedData.requirements.map((req, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-white/90">{req}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Right Column - Activity Feed & Chat */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden"
              >
                {/* Activity Feed */}
                <Card className="bg-black/60 backdrop-blur-sm border-white/20 text-white flex-1 flex flex-col overflow-hidden">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Activity Feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {activities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex gap-3 ${activity.from === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {activity.from === "agent" && (
                            <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-r ${agent?.color || "from-purple-500 to-indigo-500"}`}>
                              {agent && (
                                <Image
                                  src={agent.image}
                                  alt={agent.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              activity.from === "user"
                                ? "bg-purple-500/20 border border-purple-500/30"
                                : activity.type === "task"
                                ? "bg-blue-500/20 border border-blue-500/30"
                                : "bg-white/5 border border-white/10"
                            }`}
                          >
                            <p className="text-sm text-white">{activity.content}</p>
                            <p className="text-xs text-white/50 mt-1">
                              {activity.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {activity.from === "user" && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              U
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Chat Input */}
                <Card className="bg-black/60 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type a message to the agent..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        className={`bg-gradient-to-r ${agent?.color || "from-purple-500 to-indigo-500"} hover:opacity-90`}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
