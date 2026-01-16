"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Question {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "number" | "date"
  placeholder?: string
  options?: string[]
}

interface InfoCollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: Question[]
  summary?: string
  reasoning?: string
  onComplete: (collectedInfo: Record<string, any>) => void
}

export function InfoCollectionModal({
  open,
  onOpenChange,
  questions,
  summary,
  reasoning,
  onComplete,
}: InfoCollectionModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    // Validate required fields
    const newErrors: Record<string, string> = {}
    questions.forEach((q) => {
      if (!formData[q.key] || (typeof formData[q.key] === "string" && !formData[q.key].trim())) {
        newErrors[q.key] = "This field is required"
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onComplete(formData)
    setFormData({})
    setErrors({})
  }

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Tell Us More</DialogTitle>
          {summary && (
            <DialogDescription className="text-white/70 text-base mt-2">
              {summary}
            </DialogDescription>
          )}
          {reasoning && (
            <DialogDescription className="text-white/60 text-sm mt-1 italic">
              {reasoning}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {questions.map((question) => (
            <div key={question.key} className="space-y-2">
              <Label className="text-white">{question.label}</Label>
              {question.type === "textarea" ? (
                <Textarea
                  value={formData[question.key] || ""}
                  onChange={(e) => updateField(question.key, e.target.value)}
                  placeholder={question.placeholder}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50"
                  rows={4}
                />
              ) : question.type === "select" ? (
                <Select
                  value={formData[question.key] || ""}
                  onValueChange={(value) => updateField(question.key, value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder={question.placeholder || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/20">
                    {question.options?.map((option) => (
                      <SelectItem key={option} value={option} className="text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : question.type === "number" ? (
                <Input
                  type="number"
                  value={formData[question.key] || ""}
                  onChange={(e) => updateField(question.key, parseFloat(e.target.value) || "")}
                  placeholder={question.placeholder}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50"
                />
              ) : question.type === "date" ? (
                <Input
                  type="date"
                  value={formData[question.key] || ""}
                  onChange={(e) => updateField(question.key, e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50"
                />
              ) : (
                <Input
                  value={formData[question.key] || ""}
                  onChange={(e) => updateField(question.key, e.target.value)}
                  placeholder={question.placeholder}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50"
                />
              )}
              {errors[question.key] && (
                <p className="text-sm text-red-400">{errors[question.key]}</p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

