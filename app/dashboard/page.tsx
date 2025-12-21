"use client"

import { useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { mockProjects, mockTransactions } from "@/lib/mock-data"
import { Wallet, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/page-wrapper"

export default function DashboardPage() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  if (!ready || !authenticated) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center text-white">Loading...</div>
      </PageWrapper>
    )
  }

  const mockBalance = 1234.56

  return (
    <PageWrapper>
      <div className="container py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Wallet Card */}
          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4 text-white">{mockBalance.toFixed(2)} SOL</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Deposit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{mockProjects.length}</div>
              <p className="text-sm text-white/60 mt-2">Projects in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-5 w-5" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">24</div>
              <p className="text-sm text-white/60 mt-2">Total completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Ongoing Projects */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Ongoing Projects</h2>
          <Accordion type="single" collapsible className="w-full">
            {mockProjects.map((project) => (
              <AccordionItem key={project.id} value={project.id}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <div className="font-semibold text-white">{project.title}</div>
                      <div className="text-sm text-white/60">
                        {project.agent.name}
                      </div>
                    </div>
                    <Badge variant={project.status === "active" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Milestones:</div>
                      {project.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-2 text-sm">
                          {milestone.status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : milestone.status === "in-progress" ? (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2" />
                          )}
                          <span>{milestone.title}</span>
                          <span className="text-muted-foreground ml-auto">
                            {milestone.dueDate}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Recent Transactions</h2>
          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <div className="font-medium text-white">{tx.type}</div>
                      <div className="text-sm text-white/60">
                        {new Date(tx.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">
                        {tx.type === "withdrawal" ? "-" : "+"}
                        {tx.amount} {tx.currency}
                      </div>
                      <Badge
                        variant={
                          tx.status === "completed"
                            ? "default"
                            : tx.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      </div>
    </PageWrapper>
  )
}

