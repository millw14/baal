"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { mockGigs } from "@/lib/mock-data"
import { Star, Check, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PageWrapper } from "@/components/page-wrapper"
import { useState } from "react"

export default function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const gig = mockGigs.find((g) => g.id === id)
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "ai" }>>([
    { text: "Hello! How can I help you with this project?", sender: "ai" },
  ])
  const [inputMessage, setInputMessage] = useState("")

  if (!gig) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Gig not found</h1>
          <Link href="/gigs">
            <Button>Back to Gigs</Button>
          </Link>
        </div>
      </PageWrapper>
    )
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setMessages([...messages, { text: inputMessage, sender: "user" }])
    setInputMessage("")
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Thank you for your message! I'll get back to you shortly.", sender: "ai" },
      ])
    }, 1000)
  }

  return (
    <PageWrapper>
      <div className="container py-10 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/gigs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gigs
          </Button>
        </Link>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-8">
          <Image
            src={gig.image}
            alt={gig.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{gig.title}</h1>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{gig.category}</Badge>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{gig.rating}</span>
                      <span className="text-muted-foreground">
                        ({gig.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {gig.price} {gig.currency}
                </div>
              </div>
              <p className="text-lg text-muted-foreground">{gig.description}</p>
            </div>

            {/* Pricing Table */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gig.packages.map((pkg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{pkg.name}</h3>
                          <p className="text-2xl font-bold">
                            {pkg.price} {gig.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Delivery: {pkg.delivery}
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((review, index) => (
                    <motion.div
                      key={review}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">John Doe</span>
                        <span className="text-sm text-muted-foreground">
                          - 2 days ago
                        </span>
                      </div>
                      <p className="text-sm">
                        Great work! The AI agent delivered exactly what I needed.
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-2 ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button className="w-full" size="lg">
                  Order Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

