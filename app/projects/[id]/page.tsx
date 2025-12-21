"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { mockProjects } from "@/lib/mock-data"
import { CheckCircle2, Clock, Download, Send, AlertTriangle } from "lucide-react"
import { useState } from "react"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = mockProjects.find((p) => p.id === id)
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "agent" }>>([
    { text: "Hi! I've started working on your project.", sender: "agent" },
  ])
  const [inputMessage, setInputMessage] = useState("")

  if (!project) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
      </div>
    )
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setMessages([...messages, { text: inputMessage, sender: "user" }])
    setInputMessage("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Got it! I'll update you soon.", sender: "agent" },
      ])
    }, 1000)
  }

  return (
    <div className="container py-10 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <Badge variant={project.status === "active" ? "default" : "secondary"}>
                {project.status}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{project.budget} {project.currency}</div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {milestone.status === "completed" ? (
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          </div>
                        ) : milestone.status === "in-progress" ? (
                          <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full border-2 border-muted" />
                        )}
                        {index < project.milestones.length - 1 && (
                          <div className="w-0.5 h-full bg-border min-h-[60px] mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            Due: {milestone.dueDate}
                          </span>
                        </div>
                        <Badge
                          variant={
                            milestone.status === "completed"
                              ? "default"
                              : milestone.status === "in-progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Design Mockups.pdf", size: "2.4 MB", date: "2024-01-10" },
                    { name: "Source Files.zip", size: "15.2 MB", date: "2024-01-12" },
                  ].map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.size} • {file.date}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle>Project Chat</CardTitle>
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

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">Approve & Release Funds</Button>
                <Button variant="outline" className="w-full">
                  Request Revision
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Dispute
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dispute Project</DialogTitle>
                      <DialogDescription>
                        Describe the issue with this project
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Describe the issue..." />
                      <Button className="w-full">Submit Dispute</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

