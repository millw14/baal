"use client"

import { useState, useEffect, useRef } from "react"

interface TypingTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}

export function TypingText({ text, speed = 50, onComplete, className = "" }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const onCompleteCalledRef = useRef(false)

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
    onCompleteCalledRef.current = false
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete && currentIndex >= text.length && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-1 h-4 bg-white ml-1 align-middle animate-pulse">|</span>
      )}
    </span>
  )
}

