"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { GlareCard } from "@/components/ui/glare-card"
import { PageWrapper } from "@/components/page-wrapper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, Lock } from "lucide-react"
import { useWallets } from "@privy-io/react-auth"

interface Agent {
  id: string
  name: string
  image: string
  description: string
  available: boolean
  paywallAmount?: number // SOL amount required to unlock
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
  },
]

export default function AIAgentsPage() {
  const [unlockedAgents, setUnlockedAgents] = useState<Set<string>>(new Set(["baal"])) // Baal is always unlocked
  const [processing, setProcessing] = useState<string | null>(null)
  const { wallets } = useWallets()
  const { toast } = useToast()
  
  const handleUnlockAgent = async (agent: Agent, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (!agent.paywallAmount) return
    
    setProcessing(agent.id)
    
    try {
      // Simulate payment transaction
      // In a real implementation, this would trigger a Solana transaction using wallets
      console.log(`Processing ${agent.paywallAmount} SOL payment for ${agent.name}...`)
      
      // Simulate transaction completion
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setUnlockedAgents(prev => new Set([...prev, agent.id]))
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

  return (
    <PageWrapper>
      <div className="container py-6 md:py-10 px-4 pb-24 md:pb-10 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-white">AI Agents</h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Choose your specialized AI companion. Each agent is trained for specific tasks and ready to assist you.
            </p>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <GlareCard className="relative overflow-hidden">
                        {/* Agent Image */}
                        <div className="absolute inset-0">
                          <Image
                            src={agent.image}
                            alt={agent.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            priority={agent.id === "baal"}
                          />
                          {/* Very subtle overlay gradient only at bottom for text readability */}
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
                                View Details
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
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-black/95 border-white/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white text-3xl">{agent.name}</DialogTitle>
                      <DialogDescription className="text-white/60 text-lg">
                        {agent.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Pricing & Availability */}
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/60">Status</p>
                            <p className="text-lg font-semibold text-white">
                              {isAgentUnlocked(agent.id) || agent.available 
                                ? "Available Now" 
                                : agent.paywallAmount 
                                  ? `Unlock for ${agent.paywallAmount} SOL`
                                  : "Coming Soon"}
                            </p>
                          </div>
                          {(agent.available || isAgentUnlocked(agent.id)) ? (
                            <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
                              Hire {agent.name}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          ) : agent.paywallAmount ? (
                            <Button 
                              onClick={(e) => handleUnlockAgent(agent, e)}
                              disabled={processing === agent.id}
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                            >
                              {processing === agent.id ? (
                                <>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Unlock for {agent.paywallAmount} SOL
                                </>
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </PageWrapper>
  )
}
