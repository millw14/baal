"use client"

import { useEffect } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"

export function useUserSync() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()

  useEffect(() => {
    if (!ready || !authenticated || !user) return

    const syncUser = async () => {
      try {
        // Get Solana wallet addresses - check both chainType and chainId
        const solanaWallets = wallets
          .filter((w) => {
            const chainType = (w as any).chainType
            const chainId = w.chainId?.toLowerCase() || ""
            return chainType === "solana" || chainId.includes("solana")
          })
          .map((w) => ({
            address: w.address,
            chainType: "solana",
            walletType: w.walletClientType === "privy" ? "embedded" : "external",
          }))

        // Debug: Log all wallets to understand what Privy created
        console.log("🔍 User sync - All wallets:", wallets.map(w => ({
          address: w.address?.slice(0, 8) + "...",
          chainType: (w as any).chainType,
          chainId: w.chainId,
          walletClientType: w.walletClientType
        })))
        console.log("✅ Solana wallets found:", solanaWallets.length)

        // Prepare user data
        const userData = {
          privyId: user.id,
          email: user.email?.address || user.google?.email || "",
          username: user.google?.name || user.email?.address?.split("@")[0] || undefined,
          wallets: solanaWallets,
          profilePicture: user.google?.picture || undefined,
        }

        // Call signin API to create or update user
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          const error = await response.json()
          console.error("Failed to sync user:", error)
          return
        }

        const result = await response.json()
        console.log("User synced successfully:", result.isNewUser ? "New user" : "Existing user")
      } catch (error) {
        console.error("Error syncing user:", error)
      }
    }

    syncUser()
  }, [ready, authenticated, user, wallets])
}

