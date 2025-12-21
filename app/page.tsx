"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TypingText } from "@/components/ui/typing-text"
import { mockAgents } from "@/lib/mock-data"
import { Sparkles, ArrowRight, Send, X } from "lucide-react"
import Link from "next/link"

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"

interface ChatBubble {
  id: string
  text: string
  position: { x: number; y: number }
  show: boolean
}

const initialChatBubbles: ChatBubble[] = [
  {
    id: "1",
    text: "I'm Baal, your AI companion for building on Solana. Fast. Reliable. Always ready to help you create.",
    position: { x: 20, y: 20 },
    show: false,
  },
  {
    id: "2",
    text: "Want to build on Solana? I'll guide you step by step, no experience needed.",
    position: { x: 75, y: 40 },
    show: false,
  },
  {
    id: "3",
    text: "New to Solana? Just tell me what you want to build, and I'll show you how.",
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
const getAgentSuggestions = (input: string): typeof mockAgents => {
  const lowerInput = input.toLowerCase()
  
  // Simple keyword matching
  if (lowerInput.includes("design") || lowerInput.includes("graphic") || lowerInput.includes("logo")) {
    return mockAgents.filter(agent => agent.category === "Design & Creative")
  }
  if (lowerInput.includes("code") || lowerInput.includes("develop") || lowerInput.includes("programming")) {
    return mockAgents.filter(agent => agent.category === "Development & IT")
  }
  if (lowerInput.includes("write") || lowerInput.includes("content") || lowerInput.includes("blog")) {
    return mockAgents.filter(agent => agent.category === "Writing & Translation")
  }
  if (lowerInput.includes("market") || lowerInput.includes("social media") || lowerInput.includes("seo")) {
    return mockAgents.filter(agent => agent.category === "Marketing")
  }
  
  // Default: return all agents if no match
  return mockAgents.slice(0, 6)
}

export default function HomePage() {
  const [inputValue, setInputValue] = useState("")
  const [suggestedAgents, setSuggestedAgents] = useState<typeof mockAgents>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [chatBubbles, setChatBubbles] = useState(initialChatBubbles)
  const [typingComplete, setTypingComplete] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const suggestions = getAgentSuggestions(inputValue)
    setSuggestedAgents(suggestions)
    setShowSuggestions(true)
    
    // Hide chat bubbles when user starts interacting
    setChatBubbles((prev) => prev.map((bubble) => ({ ...bubble, show: false })))
  }

  const handleClear = () => {
    setInputValue("")
    setShowSuggestions(false)
    setSuggestedAgents([])
    setChatBubbles(initialChatBubbles)
    setTypingComplete({})
    inputRef.current?.focus()
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 md:left-80 right-0 h-screen overflow-hidden bg-black">
      {/* 3D Robot */}
      <div className="absolute inset-0 z-0">
        <InteractiveRobotSpline
          scene={ROBOT_SCENE_URL}
          className="w-full h-full"
        />
      </div>

      {/* Chat Bubbles with 3D animations */}
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
              className="absolute z-10 pointer-events-none"
            >
              <motion.div
                className="max-w-xs bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20"
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
                <p className="text-sm text-white/90 leading-relaxed">
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

      {/* Agent Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-20 flex items-center justify-center p-8 pointer-events-none"
          >
            <div className="w-full max-w-4xl pointer-events-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {suggestedAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-black/80 backdrop-blur-md border-white/20 hover:border-white/40 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                          <Badge variant="secondary" className="bg-white/10 text-white/90">
                            {agent.level}
                          </Badge>
                        </div>
                        <CardDescription className="text-white/60">
                          {agent.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-white/70 line-clamp-2 mb-4">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-white font-semibold">
                            {agent.price} SOL
                          </div>
                          <Button size="sm" variant="secondary" asChild>
                            <Link href={`/ai-agents/${agent.id}`}>
                              Hire
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Section - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="container max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What do you want to build?"
                className="h-14 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 pr-12"
              />
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="absolute right-20 text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
              <Button
                type="submit"
                size="icon"
                className="h-14 w-14 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
