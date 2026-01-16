"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/page-wrapper"

export default function ClearSessionPage() {
  const router = useRouter()

  const clearPrivySession = () => {
    console.log('🧹 Clearing Privy session data...')
    
    // Clear all localStorage items related to Privy
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('privy') || key.includes('Privy') || key.includes('PRIVY'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`✅ Removed: ${key}`)
    })
    
    // Clear all sessionStorage items related to Privy
    const sessionKeysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('privy') || key.includes('Privy') || key.includes('PRIVY'))) {
        sessionKeysToRemove.push(key)
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key)
      console.log(`✅ Removed from sessionStorage: ${key}`)
    })
    
    // Clear cookies related to Privy (requires server-side for HttpOnly cookies)
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })
    
    console.log('✅ Privy session data cleared!')
    alert('Session cleared! Redirecting to home page...')
    router.push('/')
  }

  return (
    <PageWrapper>
      <div className="container py-20 px-4 max-w-2xl mx-auto">
        <Card className="bg-black/80 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Clear Privy Session</CardTitle>
            <CardDescription className="text-white/60">
              This will clear all Privy authentication data from your browser, allowing you to test with a fresh account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ <strong>Warning:</strong> This will log you out and clear your local session data. 
                You&apos;ll need to log in again with a new email or the same email to test fresh wallet creation.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">
                <strong>What this does:</strong>
              </p>
              <ul className="text-white/60 text-sm list-disc list-inside space-y-1">
                <li>Clears all Privy-related data from localStorage</li>
                <li>Clears all Privy-related data from sessionStorage</li>
                <li>Clears Privy-related cookies</li>
                <li>Allows you to test wallet creation with a fresh session</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">
                <strong>Note:</strong>
              </p>
              <p className="text-white/60 text-sm">
                If you want to completely remove a user from Privy&apos;s database (not just your local session), 
                you&apos;ll need to delete them from the{' '}
                <a 
                  href="https://dashboard.privy.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  Privy Dashboard
                </a>.
              </p>
            </div>

            <Button 
              onClick={clearPrivySession}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              Clear Session & Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

