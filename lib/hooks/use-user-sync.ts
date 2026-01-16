"use client"

import { useEffect, useRef } from "react"
import { usePrivy } from "@privy-io/react-auth"

export function useUserSync() {
  const { ready, authenticated, user } = usePrivy()
  const syncedUsers = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!ready || !authenticated || !user) return
    
    const userId = user.id
    // Only sync once per user ID to avoid repeated API calls
    if (syncedUsers.current.has(userId)) {
      return
    }

    // Mark as syncing immediately to prevent multiple calls
    syncedUsers.current.add(userId)

    const syncUser = async () => {
      try {
        // Privy is ONLY used for authentication - no wallets from Privy
        // We'll create/manage Solana wallets manually via our API
        console.log("🔐 Syncing user (Privy auth only, no wallet creation)...")

        // Prepare user data - wallet will be created server-side if needed
        const userData = {
          privyId: user.id,
          email: user.email?.address || user.google?.email || "",
          username: user.google?.name || user.email?.address?.split("@")[0] || undefined,
          profilePicture: (user.google as any)?.picture || undefined,
        }

        // Call signin API to create or update user (wallet will be created server-side)
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          const error = await response.json()
          // 409 Conflict means user already exists, which is fine
          if (response.status === 409) {
            console.log("ℹ️ User already exists in database (409 Conflict - this is expected)")
          } else {
            console.error("Failed to sync user:", error)
          }
          return
        }

        const result = await response.json()
        const managedWallet = result.user?.wallets?.find((w: any) => w.walletType === "managed")
        if (managedWallet) {
          console.log("✅ User synced successfully:", result.isNewUser ? "New user" : "Existing user")
          console.log("💰 Managed Solana wallet:", managedWallet.address)
        } else {
          console.log("✅ User synced successfully (no managed wallet yet)")
        }
      } catch (error) {
        console.error("Error syncing user:", error)
      }
    }

    syncUser()
  }, [ready, authenticated, user?.id])
}

