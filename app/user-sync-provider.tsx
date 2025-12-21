"use client"

import { useUserSync } from "@/lib/hooks/use-user-sync"

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  // This hook will automatically sync user data to MongoDB when authenticated
  useUserSync()

  return <>{children}</>
}

