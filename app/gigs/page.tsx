"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { mockCategories } from "@/lib/mock-data"
import { ArrowRight, Filter, Clock, DollarSign } from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"

interface Job {
  _id: string
  title: string
  description: string
  category: string
  budget: number
  currency: "SOL" | "USDC"
  duration: string
  jobType: string
  skills?: string[]
  status: string
  employerId: string
  employerUsername?: string
  createdAt: string
}

export default function GigsPage() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  // Fetch jobs from database
  useEffect(() => {
    if (ready && authenticated) {
      fetchJobs()
    }
  }, [ready, authenticated, selectedCategory])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const categoryParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
      const response = await fetch(`/api/jobs?status=open${categoryParam}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const categoryMatch = selectedCategory === "all" || job.category === selectedCategory
    const priceMatch = job.budget >= priceRange[0] && job.budget <= priceRange[1]
    const searchMatch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && priceMatch && searchMatch
  })

  if (!ready || !authenticated) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center text-white">Loading...</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="container py-6 md:py-10 px-4 pb-24 md:pb-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="price">
                      <AccordionTrigger className="text-white">Price Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={500}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-white/60">
                            <span>{priceRange[0]} SOL</span>
                            <span>{priceRange[1]} SOL</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>


                    <AccordionItem value="category">
                      <AccordionTrigger className="text-white">Category</AccordionTrigger>
                      <AccordionContent>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 border-white/20">
                            <SelectItem value="all" className="text-white">All Categories</SelectItem>
                            {mockCategories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-white">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold mb-4 text-white">Browse Jobs</h1>
              <Input 
                placeholder="Search jobs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </motion.div>

            {loading ? (
              <div className="text-center py-20 text-white">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 text-white/60">
                <p className="text-xl mb-2">No jobs found</p>
                <p className="text-sm">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-shadow bg-black/80 backdrop-blur-md border-white/20 hover:border-white/40">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg text-white line-clamp-2">{job.title}</CardTitle>
                          <Badge variant="secondary" className="bg-white/10 text-white/90 ml-2 flex-shrink-0">
                            {job.category}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-3 text-white/60 min-h-[60px]">
                          {job.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white/70">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium text-white">
                              {job.budget} {job.currency}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{job.duration}</span>
                          </div>
                        </div>
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-white/5 text-white/70 border-white/20">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/20">
                                +{job.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-white/50">
                          Posted by {job.employerUsername || "Anonymous"} • {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/gigs/${job._id}`} className="w-full">
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </PageWrapper>
  )
}
