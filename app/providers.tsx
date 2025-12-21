"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { PrivyProvider } from "@privy-io/react-auth"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { useMemo, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { UserSyncProvider } from "./user-sync-provider"

// Wallet adapter CSS is imported via @import in globals.css

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  // Access environment variable (available at build time for NEXT_PUBLIC_* vars)
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env['NEXT_PUBLIC_PRIVY_APP_ID']

  // Debug logging
  useEffect(() => {
    console.log('Privy App ID Status:', privyAppId ? '✅ Set' : '❌ Not set')
    if (privyAppId) {
      console.log('Privy App ID:', privyAppId)
    }
  }, [privyAppId])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {privyAppId ? (
          <PrivyProvider
            appId={privyAppId}
            config={{
              loginMethods: ["email"],
              embeddedWallets: {
                createOnLogin: "users-without-wallets",
              },
              appearance: {
                theme: "dark",
              },
              solana: {
                chainId: "solana-devnet",
              },
            }}
          >
            <ConnectionProvider endpoint={`https://api.devnet.solana.com`}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <UserSyncProvider>
                    {children}
                    <Toaster />
                  </UserSyncProvider>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </PrivyProvider>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="text-center max-w-2xl">
              <h1 className="text-3xl font-bold mb-4">Configuration Error</h1>
              <p className="text-lg mb-4">
                Please set NEXT_PUBLIC_PRIVY_APP_ID in your .env.local file
              </p>
              <p className="text-sm text-white/70 mb-6">
                Get your App ID from the Privy Dashboard:{" "}
                <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  https://dashboard.privy.io
                </a>
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-white/90 mb-2">.env.local should contain:</p>
                <code className="text-xs text-green-400">NEXT_PUBLIC_PRIVY_APP_ID=your-app-id</code>
              </div>
            </div>
          </div>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
