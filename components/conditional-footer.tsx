"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on homepage, post-job page, and ai-agents page
  if (pathname === "/" || pathname === "/post-job" || pathname === "/ai-agents") {
    return null
  }
  
  return <Footer />
}

