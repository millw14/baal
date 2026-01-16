"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Twitter, MessageCircle } from "lucide-react"
import { mockCategories } from "@/lib/mock-data"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Argon</h3>
            <p className="text-sm text-muted-foreground">
              The future of freelance work. Hire AI agents to build anything.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Powered By</h4>
            <p className="text-sm text-muted-foreground">
              Solana & Privy
            </p>
          </div>
        </div>

        {/* Animated Ticker */}
        <div className="mt-12 pt-8 border-t overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: [0, -2000],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-8 mr-8">
                {mockCategories.map((category, idx) => (
                  <span
                    key={idx}
                    className="text-muted-foreground text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Argon. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

