"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { GlareCard } from "@/components/ui/glare-card"
import { Lock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { usePrivy } from "@privy-io/react-auth"

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
    description: "Your intelligent AI companion for building anything. Fast, reliable, and always ready to help you create amazing projects.",
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
    description: "Development expert specializing in smart contracts and decentralized applications.",
    available: false,
    paywallAmount: 3,
  },
]

interface AgentSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recommendedAgents?: string[]
  freeUsesRemaining?: number
  onSelectAgent: (agentId: string, isFree: boolean) => void
  processing?: boolean
}

export function AgentSelectionModal({
  open,
  onOpenChange,
  recommendedAgents = [],
  freeUsesRemaining = 0,
  onSelectAgent,
  processing = false,
}: AgentSelectionModalProps) {
  const { user } = usePrivy()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  // Filter agents if recommendations provided
  const displayAgents = recommendedAgents.length > 0
    ? agents.filter((agent) => recommendedAgents.includes(agent.id))
    : agents

  const handleAgentSelect = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId)
    if (!agent) return

    const isFree = agentId === "baal" && freeUsesRemaining > 0
    setSelectedAgentId(agentId)
    onSelectAgent(agentId, isFree)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Choose Your AI Agent</DialogTitle>
          <DialogDescription className="text-white/70">
            Select the agent best suited for your project. {freeUsesRemaining > 0 && `You have ${freeUsesRemaining} free Baal use${freeUsesRemaining > 1 ? 's' : ''} remaining.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {displayAgents.map((agent, index) => {
            const isBaal = agent.id === "baal"
            const isFree = isBaal && freeUsesRemaining > 0
            const isSelected = selectedAgentId === agent.id

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <GlareCard className={`relative overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
                  {/* Agent Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={agent.image}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-6 z-10">
                    {/* Top: Badge */}
                    <div className="flex justify-end">
                      {isFree ? (
                        <Badge className="bg-green-500/30 backdrop-blur-sm text-green-300 border-green-400/50 shadow-lg">
                          FREE
                        </Badge>
                      ) : isBaal ? (
                        <Badge className="bg-blue-500/30 backdrop-blur-sm text-blue-300 border-blue-400/50 shadow-lg">
                          0.05 SOL
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-500/30 backdrop-blur-sm text-purple-300 border-purple-400/50 shadow-lg flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          {agent.paywallAmount} SOL
                        </Badge>
                      )}
                    </div>

                    {/* Bottom: Name and description */}
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">{agent.name}</h3>
                      <p className="text-sm text-white/90 line-clamp-2 mb-4 drop-shadow-md">
                        {agent.description}
                      </p>
                      <Button
                        onClick={() => handleAgentSelect(agent.id)}
                        disabled={processing || (!isFree && !isBaal && !agent.available)}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg"
                      >
                        {processing && selectedAgentId === agent.id ? (
                          "Processing..."
                        ) : (
                          <>
                            Select Agent
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </GlareCard>
              </motion.div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

