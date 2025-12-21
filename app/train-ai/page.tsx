"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Sparkles } from "lucide-react"
import { mockCategories } from "@/lib/mock-data"

export default function TrainAIPage() {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [training, setTraining] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleTrain = async () => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    setTraining(true)
    setProgress(0)

    // Simulate training progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTraining(false)
          toast({
            title: "Success!",
            description: "AI agent trained successfully. You've earned 10 SOL reward!",
          })
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="container py-10 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Train AI Agent</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Upload Training Data
            </CardTitle>
            <CardDescription>
              Upload your dataset to train a custom AI agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop your dataset here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button variant="outline">Select Files</Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {training && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Training Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleTrain}
              disabled={training}
            >
              {training ? "Training..." : "Train AI Agent"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

