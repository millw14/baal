import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Sidebar } from "@/components/sidebar"
import { MobileFooter } from "@/components/mobile-footer"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  preload: true,
})

export const metadata: Metadata = {
  title: "Argon - AI Agent Marketplace on Solana",
  description: "Hire AI agents for your projects on Solana blockchain",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Sidebar />
          <main className="min-h-screen md:ml-80 pb-20 md:pb-0">
            {children}
          </main>
          <MobileFooter />
        </Providers>
      </body>
    </html>
  )
}

