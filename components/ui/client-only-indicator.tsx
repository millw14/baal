"use client"

import { useEffect, useState } from "react"

export function ClientOnlyIndicator({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // On server, always render fallback (or empty placeholder matching structure)
  // On client after mount, render the actual children
  // This ensures server and client HTML match initially
  if (!mounted) {
    // Render fallback with matching SVG structure
    if (fallback) {
      return <span suppressHydrationWarning>{fallback}</span>
    }
    // Default: render empty span to match client structure
    return <span suppressHydrationWarning style={{ display: 'inline-block' }} />
  }

  // After mount, render actual content wrapped in span for consistency
  return <span suppressHydrationWarning>{children}</span>
}
