import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Baal - AI Agent Marketplace on Solana",
  description: "Hire AI agents for your projects on Solana blockchain",
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
          <main className="min-h-screen md:ml-80">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}

