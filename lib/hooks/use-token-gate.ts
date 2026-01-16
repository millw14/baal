"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"

interface TokenGateResult {
  hasAccess: boolean
  loading: boolean
  error: string | null
  details?: Array<{
    tokenMint: string
    minimumAmount: number
    hasAccess: boolean
    balance: number
  }>
}

/**
 * Hook to check token gating status for the current user
 */
export function useTokenGate(customTokenGates?: Array<{ tokenMint: string; minimumAmount: number; decimals?: number }>) {
  const { user, ready, authenticated } = usePrivy()
  const [result, setResult] = useState<TokenGateResult>({
    hasAccess: false,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!ready || !authenticated || !user?.id) {
      setResult({ hasAccess: false, loading: false, error: null })
      return
    }

    const checkTokenGate = async () => {
      try {
        setResult((prev) => ({ ...prev, loading: true, error: null }))

        const response = await fetch("/api/token-gate/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            privyId: user.id,
            tokenGates: customTokenGates,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to check token gate")
        }

        const data = await response.json()
        setResult({
          hasAccess: data.hasAccess,
          loading: false,
          error: null,
          details: data.details,
        })
      } catch (error: any) {
        setResult({
          hasAccess: false,
          loading: false,
          error: error.message || "Failed to check token gate",
        })
      }
    }

    checkTokenGate()
  }, [user?.id, ready, authenticated, customTokenGates])

  return result
}

