"use client"

import { use, useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Lock, ArrowRight, Send } from "lucide-react"
import Link from "next/link"
import { PageWrapper } from "@/components/page-wrapper"
import { GlareCard } from "@/components/ui/glare-card"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface Agent {
  id: string
  name: string
  image: string
  description: string
  available: boolean
  paywallAmount?: number
}

const agents: Agent[] = [
  {
    id: "baal",
    name: "Baal",
    image: "/agents/Baal.jpg",
    description: "Your intelligent AI companion for building on Solana. Fast, reliable, and always ready to help you create amazing projects.",
    available: true,
  },
  {
    id: "luna",
    name: "Luna",
    image: "/agents/Luna.jpg",
    description: "Creative design specialist with expertise in modern UI/UX and visual storytelling.",
    available: false,
    paywallAmount: 3,
  },
  {
    id: "maki",
    name: "Maki",
    image: "/agents/Maki.jpg",
    description: "Development expert specializing in Solana smart contracts and decentralized applications.",
    available: false,
    paywallAmount: 3,
  },
  {
    id: "theresa",
    name: "Theresa",
    image: "/agents/Theresa.jpg",
    description: "Marketing and content strategist with proven track record in growth and engagement.",
    available: false,
    paywallAmount: 3,
  },
]

interface Message {
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm here to help you. Feel free to ask me anything or let me know how I can assist you.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [showAgents, setShowAgents] = useState(false)
  const [unlockedAgents, setUnlockedAgents] = useState<Set<string>>(new Set(["baal"])) // Baal is always unlocked
  const [processing, setProcessing] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchJob()
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch job")
      }
      const data = await response.json()
      setJob(data.job)
    } catch (error: any) {
      console.error("Error fetching job:", error)
      toast({
        title: "Error",
        description: "Failed to load job details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if message contains job-related keywords (very specific - only explicit requests for agents/job help)
  const isJobRelated = (message: string): boolean => {
    // Early return for empty or very short messages
    if (!message || !message.trim() || message.trim().length < 10) {
      return false
    }
    
    const lowerMessage = message.toLowerCase().trim()
    
    // Block common greetings that should NEVER trigger agents
    const blockedGreetings = ["hi", "hello", "hey", "sup", "what's up", "greetings", "good morning", "good afternoon", "good evening"]
    if (blockedGreetings.some(greeting => lowerMessage === greeting || lowerMessage.startsWith(greeting + " "))) {
      return false
    }
    
    // MUST contain at least one of these core keywords
    const mustHaveKeywords = ["agent", "hire", "recommend", "suggest", "who can", "which one", "which agent", "what agent"]
    const hasCoreKeyword = mustHaveKeywords.some(keyword => lowerMessage.includes(keyword))
    
    if (!hasCoreKeyword) {
      return false
    }
    
    // Very specific phrases that explicitly indicate user wants to find/hire agents or work on the job
    const explicitPhrases = [
      "which agent",
      "what agent",
      "who can help",
      "can help me",
      "should i hire",
      "looking for an agent",
      "find an agent",
      "need an agent",
      "want to hire",
      "recommend an agent",
      "suggest an agent",
      "who should i",
      "help with this job",
      "work on this job",
      "complete this job",
      "handle this job",
      "take on this job",
      "agent for this",
      "hire someone",
      "find someone to",
    ]
    
    // Only trigger if message contains these explicit phrases (minimum 4 words to avoid false positives)
    const words = lowerMessage.split(/\s+/).filter(word => word.length > 0)
    if (words.length < 4) {
      return false
    }
    
    return explicitPhrases.some((phrase) => lowerMessage.includes(phrase))
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Save the message before clearing input
    const messageText = inputMessage.trim()

    const userMessage: Message = {
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")

    // Check if message is job-related and show agents if so (check the saved message, not the cleared input)
    if (isJobRelated(messageText) && !showAgents) {
      setShowAgents(true)
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        text: "Thank you for your message! I'm here to help you with this job. If you'd like to discuss the job requirements or need help finding the right agent, just let me know!",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleUnlockAgent = async (agent: Agent, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (!agent.paywallAmount) return

    setProcessing(agent.id)

    try {
      console.log(`Processing ${agent.paywallAmount} SOL payment for ${agent.name}...`)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      setUnlockedAgents((prev) => new Set([...prev, agent.id]))
      toast({
        title: "Agent Unlocked!",
        description: `${agent.name} is now available for hire.`,
      })
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Could not complete payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const isAgentUnlocked = (agentId: string) => unlockedAgents.has(agentId)

  if (loading) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white/60">Loading job details...</p>
        </div>
      </PageWrapper>
    )
  }

  if (!job) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Job not found</h1>
          <Link href="/gigs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="container py-10 px-4 max-w-7xl mx-auto pb-32 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/gigs">
            <Button variant="ghost" className="mb-6 text-white hover:text-white/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>

          {/* Job Header - Compact */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-white">{job.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {job.category}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white/90 border-white/20">
                    {job.duration}
                  </Badge>
                  <span className="text-xl font-bold text-white">
                    {job.budget} {job.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Chat Section */}
            <div className="md:col-span-2">
              <Card className="bg-black/60 backdrop-blur-sm border-white/20 h-[600px] flex flex-col">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white">Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            msg.sender === "user"
                              ? "bg-purple-500/20 text-white border border-purple-500/30"
                              : "bg-white/10 text-white/90 border border-white/20"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type your message..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Info Sidebar */}
            <div className="space-y-4">
              <Card className="bg-black/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Description</p>
                    <p className="text-sm text-white/90 line-clamp-4">{job.description}</p>
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-white/60 mb-2">Skills Required</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 5).map((skill: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Agent Cards - Shown when user talks about job */}
          <AnimatePresence>
            {showAgents && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <h2 className="text-3xl font-bold mb-4 text-white">Recommended AI Agents</h2>
                <p className="text-white/60 mb-6">
                  Choose the best AI agent for this job. Baal is free, while other agents require a one-time unlock fee.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {agents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative"
                    >
                      <GlareCard className="relative overflow-hidden">
                        {/* Agent Image */}
                        <div className="absolute inset-0">
                          <Image
                            src={agent.image}
                            alt={agent.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-6 z-10">
                          {/* Top: Badge */}
                          <div className="flex justify-end">
                            {agent.available || isAgentUnlocked(agent.id) ? (
                              <Badge className="bg-green-500/30 backdrop-blur-sm text-green-300 border-green-400/50 shadow-lg">
                                Available
                              </Badge>
                            ) : agent.paywallAmount ? (
                              <Badge className="bg-purple-500/30 backdrop-blur-sm text-purple-300 border-purple-400/50 shadow-lg flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                {agent.paywallAmount} SOL
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-500/30 backdrop-blur-sm text-orange-300 border-orange-400/50 shadow-lg">
                                Coming Soon
                              </Badge>
                            )}
                          </div>

                          {/* Bottom: Name and description */}
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">{agent.name}</h3>
                            <p className="text-sm text-white/90 line-clamp-2 mb-4 drop-shadow-md">
                              {agent.description}
                            </p>
                            {isAgentUnlocked(agent.id) || agent.available ? (
                              <Button
                                variant="outline"
                                className="w-full border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white shadow-lg"
                              >
                                Hire Agent
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            ) : agent.paywallAmount ? (
                              <Button
                                onClick={(e) => handleUnlockAgent(agent, e)}
                                disabled={processing === agent.id}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg"
                              >
                                {processing === agent.id ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="mr-2"
                                    >
                                      <Lock className="h-4 w-4" />
                                    </motion.div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Unlock for {agent.paywallAmount} SOL
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full border-white/30 bg-white/20 backdrop-blur-sm text-white shadow-lg"
                                disabled
                              >
                                Coming Soon
                              </Button>
                            )}
                          </div>
                        </div>
                      </GlareCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
