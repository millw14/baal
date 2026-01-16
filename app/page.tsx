"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { lazy, Suspense } from "react"
const InteractiveRobotSpline = lazy(() => 
  import("@/components/ui/interactive-3d-robot").then(module => ({ default: module.InteractiveRobotSpline }))
)
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TypingText } from "@/components/ui/typing-text"
import { Sparkles, ArrowRight, Send, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { InfoCollectionModal } from "@/components/info-collection-modal"
import { AgentSelectionModal } from "@/components/agent-selection-modal"
import { useToast } from "@/components/ui/use-toast"

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"

interface ChatBubble {
  id: string
  text: string
  position: { x: number; y: number }
  show: boolean
}

interface Message {
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

const initialChatBubbles: ChatBubble[] = [
  {
    id: "1",
    text: "I'm Baal, your AI companion for building anything. Fast. Reliable. Always ready to help you create.",
    position: { x: 20, y: 20 },
    show: false,
  },
  {
    id: "2",
    text: "Want to build something? I'll guide you step by step, no experience needed.",
    position: { x: 75, y: 40 },
    show: false,
  },
  {
    id: "3",
    text: "Just tell me what you want to build, and I'll show you how.",
    position: { x: 20, y: 70 },
    show: false,
  },
  {
    id: "4",
    text: "Smartest AI in the ecosystem. Tell me what you want to do, and I'll find the perfect AI agent for you.",
    position: { x: 75, y: 75 },
    show: false,
  },
]

// Hardcoded command matching (for now)

export default function HomePage() {
  const router = useRouter()
  const { user } = usePrivy()
  const { toast } = useToast()
  const [inputValue, setInputValue] = useState("")
  const [chatBubbles, setChatBubbles] = useState(initialChatBubbles)
  const [typingComplete, setTypingComplete] = useState<Record<string, boolean>>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [showChat, setShowChat] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [currentUserMessage, setCurrentUserMessage] = useState("")
  const [collectedInfo, setCollectedInfo] = useState<Record<string, any>>({})
  const [freeUsesRemaining, setFreeUsesRemaining] = useState(3)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch free uses on mount
  useEffect(() => {
    if (user?.id) {
      fetchFreeUses()
    }
  }, [user?.id])

  const fetchFreeUses = async () => {
    try {
      const response = await fetch(`/api/job-request/create?privyId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setFreeUsesRemaining(data.freeUsesRemaining || 0)
      }
    } catch (error) {
      console.error("Error fetching free uses:", error)
    }
  }

  // Memoize onComplete callback to prevent infinite loops
  const handleTypingComplete = useCallback((bubbleId: string) => {
    setTypingComplete((prev) => {
      if (prev[bubbleId]) return prev // Already completed, don't update
      return { ...prev, [bubbleId]: true }
    })
  }, [])

  // Animate chat bubbles in sequence
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setChatBubbles((prev) =>
        prev.map((bubble) => (bubble.id === "1" ? { ...bubble, show: true } : bubble))
      )
    }, 500)

    const timer2 = setTimeout(() => {
      setChatBubbles((prev) =>
        prev.map((bubble) => (bubble.id === "2" ? { ...bubble, show: true } : bubble))
      )
    }, 1500)

    const timer3 = setTimeout(() => {
      setChatBubbles((prev) =>
        prev.map((bubble) => (bubble.id === "3" ? { ...bubble, show: true } : bubble))
      )
    }, 2500)

    const timer4 = setTimeout(() => {
      setChatBubbles((prev) =>
        prev.map((bubble) => (bubble.id === "4" ? { ...bubble, show: true } : bubble))
      )
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  // Detect if message is casual conversation vs actual inquiry
  const isCasualConversation = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim()
    
    // Common casual greetings and small talk
    const casualPatterns = [
      /^(hi|hello|hey|sup|what's up|greetings|good morning|good afternoon|good evening)$/i,
      /^(how are you|how's it going|how do you do|what's up|how are things)$/i,
      /^(thanks|thank you|thx|ty)$/i,
      /^(bye|goodbye|see you|later)$/i,
      /^(yes|yeah|yep|no|nope|ok|okay|sure|cool|nice)$/i,
      /^(what|who|where|when|why)\s+(are you|is this|can you)/i,
    ]
    
    // Check if message matches casual patterns
    if (casualPatterns.some(pattern => pattern.test(lowerMessage))) {
      return true
    }
    
    // Check if message is too short (likely casual)
    if (lowerMessage.split(/\s+/).length <= 3 && lowerMessage.length < 20) {
      return true
    }
    
    // Check for inquiry indicators
    const inquiryIndicators = [
      'want to', 'need to', 'help me', 'create', 'build', 'start', 'set up', 'develop',
      'make', 'design', 'launch', 'project', 'company', 'business', 'app', 'website',
      'dapp', 'smart contract', 'nft', 'token', 'dao', 'defi', 'marketplace'
    ]
    
    // If message contains inquiry indicators, it's not casual
    if (inquiryIndicators.some(indicator => lowerMessage.includes(indicator))) {
      return false
    }
    
    return false
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (!inputValue.trim()) return

    const messageText = inputValue.trim()

    // Hide chat bubbles when user starts interacting
    if (!showChat) {
      setChatBubbles((prev) => prev.map((bubble) => ({ ...bubble, show: false })))
      setShowChat(true)
    }

    // Add user message
    const userMessage: Message = {
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setCurrentUserMessage(messageText)
    setInputValue("")

    // Check if it's casual conversation
    if (isCasualConversation(messageText)) {
      // Handle casual conversation with simple responses
      setTimeout(() => {
        const lowerMessage = messageText.toLowerCase().trim()
        let response = ""
        
        if (/^(hi|hello|hey|sup|what's up|greetings|good morning|good afternoon|good evening)$/i.test(lowerMessage)) {
          response = "Hello! How can I help you build something amazing today?"
        } else if (/^(how are you|how's it going|how do you do|what's up|how are things)$/i.test(lowerMessage)) {
          response = "I'm doing great and ready to help you build! What project are you working on?"
        } else if (/^(thanks|thank you|thx|ty)$/i.test(lowerMessage)) {
          response = "You're welcome! Feel free to ask if you need any help with your project."
        } else if (/^(bye|goodbye|see you|later)$/i.test(lowerMessage)) {
          response = "See you later! Come back anytime you need help building something."
        } else {
          response = "I'm here to help you build! What would you like to create or work on?"
        }
        
        const aiResponse: Message = {
          text: response,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1000)
      return
    }

    // For actual inquiries, use reasoning API
    try {
      setProcessing(true)
      const response = await fetch("/api/chat/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("API error response:", errorData)
        throw new Error(errorData.error || errorData.message || "Failed to analyze request")
      }

      const data = await response.json()
      
      // Handle casual conversation response from API
      if (data.isCasual && data.response) {
        const aiResponse: Message = {
          text: data.response,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        return
      }
      
      if (!data.analysis) {
        throw new Error("No analysis data received")
      }
      
      setAnalysis(data.analysis)

      // Show AI response with reasoning
      const aiResponse: Message = {
        text: data.analysis.reasoning || "Let me help you with that. I need a bit more information to get started.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])

      // Show info collection modal if questions exist
      if (data.analysis.questions && data.analysis.questions.length > 0) {
        setShowInfoModal(true)
      } else {
        // No questions needed, proceed to agent selection
        setShowAgentModal(true)
      }
    } catch (error: any) {
      console.error("Error analyzing request:", error)
      const errorMessage = error.message || "I encountered an error. Please try again."
      const errorResponse: Message = {
        text: errorMessage.includes("Groq API") 
          ? "I'm having trouble connecting to my analysis service. Please try again in a moment."
          : errorMessage,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
      
      // Show toast with more details
      toast({
        title: "Error",
        description: error.message || "Failed to analyze request. Please check the console for details.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleInfoComplete = (info: Record<string, any>) => {
    setCollectedInfo(info)
    setShowInfoModal(false)
    setShowAgentModal(true)
  }

  const handleAgentSelect = async (agentId: string, isFree: boolean) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to continue",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)

      // Create job request
      const response = await fetch("/api/job-request/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privyId: user.id,
          userMessage: currentUserMessage,
          analyzedData: analysis,
          collectedInfo,
          selectedAgent: agentId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Job request creation failed:", errorData)
        throw new Error(errorData.error || "Failed to create job request")
      }

      const data = await response.json()
      console.log("Job request created:", data)
      
      // Ensure we have the job request ID
      if (!data.jobRequest || !data.jobRequest._id) {
        throw new Error("Failed to create job request - no ID returned")
      }

      // Update free uses if Baal was used
      if (agentId === "baal") {
        setFreeUsesRemaining(data.jobRequest.freeUsesRemaining || 0)
      }

      // If not free and payment is pending, process payment
      if (!isFree && data.jobRequest.status === "pending") {
        try {
          const payResponse = await fetch("/api/job-request/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobRequestId: data.jobRequest._id,
              privyId: user.id,
            }),
          })

          if (!payResponse.ok) {
            const errorData = await payResponse.json()
            throw new Error(errorData.error || "Payment failed")
          }

          toast({
            title: "Payment Successful!",
            description: `Successfully paid ${data.jobRequest.paymentAmount} SOL. Your job has started!`,
          })
        } catch (paymentError: any) {
          toast({
            title: "Payment Failed",
            description: paymentError.message || "Failed to process payment. Please try again.",
            variant: "destructive",
          })
          return // Don't proceed if payment failed
        }
      } else {
        toast({
          title: "Job Started!",
          description: `Your job with ${agentId.charAt(0).toUpperCase() + agentId.slice(1)} has been started${isFree ? " (free use)" : ""}.`,
        })
      }

      setShowAgentModal(false)
      
      // Add success message to chat
      const successMessage: Message = {
        text: `Great! I've started your job with ${agentId.charAt(0).toUpperCase() + agentId.slice(1)}. They'll get to work on your project right away!`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, successMessage])

      // Navigate to workspace after a brief delay to show the message
      // Works for both free Baal uses and paid agents
      setTimeout(() => {
        router.push(`/studio/${data.jobRequest._id}`)
      }, 1500)

      // Reset state
      setAnalysis(null)
      setCollectedInfo({})
      setCurrentUserMessage("")
    } catch (error) {
      console.error("Error selecting agent:", error)
      toast({
        title: "Error",
        description: "Failed to start job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleClear = () => {
    setInputValue("")
    if (showChat && messages.length === 0) {
      // If chat was shown but no messages, reset to bubbles
      setChatBubbles(initialChatBubbles)
      setShowChat(false)
      setTypingComplete({})
    }
    inputRef.current?.focus()
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 md:left-80 right-0 h-screen overflow-hidden bg-black">
      {/* 3D Robot - Lazy loaded */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <InteractiveRobotSpline
            scene={ROBOT_SCENE_URL}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Chat Bubbles with 3D animations - Only show when chat is not active */}
      {!showChat && (
        <AnimatePresence>
          {chatBubbles.map((bubble, index) => (
            bubble.show && (
              <motion.div
                key={bubble.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0.3,
                  rotateX: -90,
                  rotateY: -20,
                  y: 50,
                  z: -100
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateX: 0,
                  rotateY: 0,
                  y: 0,
                  z: 0
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.3,
                  rotateX: 90,
                  rotateY: 20,
                  y: -50,
                  z: -100
                }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.3,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                style={{
                  left: `${bubble.position.x}%`,
                  top: `${bubble.position.y}%`,
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
                className="absolute z-10 pointer-events-none hidden md:block"
              >
                <motion.div
                  className="max-w-[280px] md:max-w-xs bg-white/10 backdrop-blur-md rounded-2xl px-3 md:px-4 py-2 md:py-3 border border-white/20"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                    z: 20
                  }}
                >
                  <p className="text-xs md:text-sm text-white/90 leading-relaxed">
                    <TypingText 
                      text={bubble.text} 
                      speed={30}
                      onComplete={() => handleTypingComplete(bubble.id)}
                    />
                  </p>
                </motion.div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      )}

      {/* Chat Interface - Show when user starts chatting */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8 pb-40 md:pb-24"
        >
          <Card className="w-full max-w-3xl h-full max-h-[calc(100vh-200px)] bg-black/80 backdrop-blur-md border-white/20 flex flex-col">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white">Chat with Baal</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-white/60 py-8">
                    <p>Start a conversation with Baal...</p>
                  </div>
                )}
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
              
              {/* Input inside chat */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    placeholder="Type your message..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50"
                  />
                  {inputValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      className="text-white/50 hover:text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!inputValue.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}


      {/* Input Section - Fixed at bottom, above mobile footer - Only show when chat is not active */}
      {!showChat && (
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-8 pb-32 md:pb-8 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="container max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="What do you want to build?"
                  className="h-12 md:h-14 text-base md:text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 pr-12 md:pr-12"
                />
                {inputValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="absolute right-14 md:right-20 h-8 w-8 md:h-10 md:w-10 text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                )}
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 md:h-14 md:w-14 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white flex-shrink-0"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Collection Modal */}
      <InfoCollectionModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        questions={analysis?.questions || []}
        summary={analysis?.summary}
        reasoning={analysis?.reasoning}
        onComplete={handleInfoComplete}
      />

      {/* Agent Selection Modal */}
      <AgentSelectionModal
        open={showAgentModal}
        onOpenChange={setShowAgentModal}
        recommendedAgents={analysis?.recommendedAgents}
        freeUsesRemaining={freeUsesRemaining}
        onSelectAgent={handleAgentSelect}
        processing={processing}
      />
    </div>
  )
}
