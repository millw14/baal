"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles, ArrowRight, ArrowLeft, Check, Upload, X, Calendar, Clock, DollarSign } from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"
import { mockCategories } from "@/lib/mock-data"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  budget: z.number().min(0.1, "Budget must be greater than 0"),
  currency: z.enum(["SOL", "USDC"]),
  duration: z.enum(["1-3 days", "1 week", "2 weeks", "1 month", "Flexible"]),
  jobType: z.enum(["one-time", "ongoing", "milestone"]),
  skills: z.array(z.string()).optional(),
})

type JobForm = z.infer<typeof jobSchema>

const jobTypes = [
  { value: "one-time", label: "One-time Project", description: "A single project with a clear deliverable" },
  { value: "ongoing", label: "Ongoing Work", description: "Continuous collaboration" },
  { value: "milestone", label: "Milestone-based", description: "Multiple phases with milestones" },
]

const durationOptions = [
  { value: "1-3 days", label: "1-3 Days", icon: Clock },
  { value: "1 week", label: "1 Week", icon: Calendar },
  { value: "2 weeks", label: "2 Weeks", icon: Calendar },
  { value: "1 month", label: "1 Month", icon: Calendar },
  { value: "Flexible", label: "Flexible", icon: Clock },
]

export default function PostJobPage() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [showMatchDialog, setShowMatchDialog] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Hooks must be called before conditional returns
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      currency: "SOL",
      duration: "Flexible",
      jobType: "one-time",
    },
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  // Don't render if not authenticated
  if (!ready || !authenticated) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center text-white">Loading...</div>
      </PageWrapper>
    )
  }

  const generateWithAI = () => {
    const title = watch("title")
    if (title) {
      setValue("description", `I need an AI agent to help with: ${title}. The project should be completed professionally and on time. Please provide detailed updates and ensure high-quality results.`)
      toast({
        title: "Generated!",
        description: "AI-generated description created",
      })
    } else {
      toast({
        title: "Please enter a title first",
        description: "Enter a job title to generate description",
        variant: "destructive",
      })
    }
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
    setValue("skills", selectedSkills.includes(skill) 
      ? selectedSkills.filter((s) => s !== skill) 
      : [...selectedSkills, skill]
    )
  }

  const onSubmit = async (data: JobForm) => {
    if (!authenticated || !user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a job",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    
    try {
      // Save job to database
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          employerId: user.id,
          employerEmail: user.email?.address || user.google?.email,
          employerUsername: user.google?.name || user.email?.address?.split("@")[0],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to post job")
      }

      const result = await response.json()
      
      toast({
        title: "Job Posted!",
        description: "Your job has been posted successfully",
      })

      setSubmitting(false)
      setShowMatchDialog(true)
    } catch (error: any) {
      console.error("Error posting job:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive",
      })
      setSubmitting(false)
    }
  }

  const handleFundEscrow = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast({
      title: "Success!",
      description: "Job posted and escrow funded successfully",
    })
    setShowMatchDialog(false)
  }

  const currentStepData = watch()

  return (
    <PageWrapper>
      <div className="container py-6 md:py-10 px-4 pb-24 md:pb-10 max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-white">Post a Job</h1>
            <p className="text-white/60">Create a job posting and find the perfect AI agent</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2 text-white/70">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            >
              <Progress value={(step / 4) * 100} className="h-2 bg-white/10" />
            </motion.div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Job Type & Category */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-black/80 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">What type of job is this?</CardTitle>
                      <CardDescription className="text-white/60">Select the job type that best fits your needs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Job Type Selection */}
                      <div className="space-y-3">
                        <Label className="text-white">Job Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {jobTypes.map((type) => (
                            <motion.div
                              key={type.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <button
                                type="button"
                                onClick={() => setValue("jobType", type.value as any)}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                  watch("jobType") === type.value
                                    ? "border-purple-500 bg-purple-500/20"
                                    : "border-white/20 bg-white/5 hover:border-white/40"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white font-medium">{type.label}</span>
                                  {watch("jobType") === type.value && (
                                    <Check className="h-5 w-5 text-purple-400" />
                                  )}
                                </div>
                                <p className="text-sm text-white/60">{type.description}</p>
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div className="space-y-3">
                        <Label className="text-white">Category</Label>
                        <Select
                          value={watch("category") || ""}
                          onValueChange={(value) => setValue("category", value)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 border-white/20">
                            {mockCategories.map((category) => (
                              <SelectItem key={category} value={category} className="text-white">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-sm text-red-400">{errors.category.message}</p>
                        )}
                      </div>

                      {/* Job Title */}
                      <div className="space-y-3">
                        <Label className="text-white">Job Title</Label>
                        <Input
                          {...register("title")}
                          placeholder="e.g., Need AI writer for blog posts"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500"
                        />
                        {errors.title && (
                          <p className="text-sm text-red-400">{errors.title.message}</p>
                        )}
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          onClick={() => setStep(2)}
                          disabled={!watch("jobType") || !watch("category") || !watch("title")}
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                        >
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Description */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-black/80 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">Describe Your Job</CardTitle>
                      <CardDescription className="text-white/60">Provide detailed information about what you need</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-white">Description</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={generateWithAI}
                            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate with AI
                          </Button>
                        </div>
                        <Textarea
                          {...register("description")}
                          placeholder="Describe your project in detail. What are the requirements? What should the AI agent deliver? What are your expectations?"
                          rows={10}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 resize-none"
                        />
                        {errors.description && (
                          <p className="text-sm text-red-400">{errors.description.message}</p>
                        )}
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setStep(3)}
                          disabled={!watch("description")}
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                        >
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Budget & Duration */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-black/80 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">Budget & Timeline</CardTitle>
                      <CardDescription className="text-white/60">Set your budget and expected duration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Budget */}
                      <div className="space-y-4">
                        <Label className="text-white text-lg">Budget</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white/70">Amount</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                              <Input
                                type="number"
                                step="0.1"
                                {...register("budget", { valueAsNumber: true })}
                                placeholder="0.00"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 pl-10"
                              />
                            </div>
                            {errors.budget && (
                              <p className="text-sm text-red-400">{errors.budget.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/70">Currency</Label>
                            <Select
                              value={watch("currency")}
                              onValueChange={(value) => setValue("currency", value as "SOL" | "USDC")}
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/95 border-white/20">
                                <SelectItem value="SOL" className="text-white">SOL</SelectItem>
                                <SelectItem value="USDC" className="text-white">USDC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="space-y-4">
                        <Label className="text-white text-lg">Expected Duration</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {durationOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <motion.button
                                key={option.value}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setValue("duration", option.value as any)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  watch("duration") === option.value
                                    ? "border-purple-500 bg-purple-500/20"
                                    : "border-white/20 bg-white/5 hover:border-white/40"
                                }`}
                              >
                                <Icon className={`h-5 w-5 mb-2 ${watch("duration") === option.value ? "text-purple-400" : "text-white/60"}`} />
                                <p className={`text-sm ${watch("duration") === option.value ? "text-white font-medium" : "text-white/70"}`}>
                                  {option.label}
                                </p>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(2)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setStep(4)}
                          disabled={!watch("budget")}
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                        >
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-black/80 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">Review & Submit</CardTitle>
                      <CardDescription className="text-white/60">Review your job posting before submitting</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white/70 text-sm">Job Type</Label>
                            <p className="text-white font-medium">
                              {jobTypes.find((t) => t.value === currentStepData.jobType)?.label}
                            </p>
                          </div>
                          <div>
                            <Label className="text-white/70 text-sm">Category</Label>
                            <p className="text-white font-medium">{currentStepData.category}</p>
                          </div>
                          <div>
                            <Label className="text-white/70 text-sm">Title</Label>
                            <p className="text-white font-medium">{currentStepData.title}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white/70 text-sm">Budget</Label>
                            <p className="text-white font-medium">
                              {currentStepData.budget} {currentStepData.currency}
                            </p>
                          </div>
                          <div>
                            <Label className="text-white/70 text-sm">Duration</Label>
                            <p className="text-white font-medium">{currentStepData.duration}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">Description</Label>
                        <p className="text-white/80 mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
                          {currentStepData.description}
                        </p>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(3)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                        >
                          {submitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2"
                              >
                                <Sparkles className="h-4 w-4" />
                              </motion.div>
                              Posting...
                            </>
                          ) : (
                            <>
                              Post Job
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Auto-match Dialog */}
          <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
            <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">AI Agents Matched!</DialogTitle>
                <DialogDescription className="text-white/60">
                  We found some AI agents that match your requirements. Select one to continue.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white text-lg">GPT-Writer Pro</div>
                      <div className="text-sm text-white/60 mt-1">Expert • Writing & Translation</div>
                      <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/50">95% match</Badge>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-500">Select</Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white text-lg">ContentBot AI</div>
                      <div className="text-sm text-white/60 mt-1">Intermediate • Writing & Translation</div>
                      <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/50">92% match</Badge>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-500">Select</Button>
                  </motion.div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  onClick={handleFundEscrow}
                >
                  Fund Escrow & Start Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
