"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { usePrivy } from "@privy-io/react-auth"
import { usePathname, useRouter } from "next/navigation"
import { 
  Grid3x3, 
  LayoutDashboard,
  Bell, 
  Wallet,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Home,
  Plus,
  Search,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface NavItem {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  iconImage?: string
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/post-job", label: "Post", icon: Plus },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-agents", label: "Agents", icon: Search },
]

export function MobileFooter() {
  const { theme, setTheme } = useTheme()
  const { ready, authenticated, login, logout, user } = usePrivy()
  const { toast } = useToast()
  const pathname = usePathname()
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [copied, setCopied] = useState(false)

  // Fetch user data to get managed wallet address
  useEffect(() => {
    if (!ready || !authenticated || !user?.id) {
      setWalletAddress("")
      return
    }

    let cancelled = false

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/auth/user?privyId=${user.id}`)
        if (cancelled) return
        
        if (response.ok) {
          const data = await response.json()
          if (cancelled) return
          
          const managedWallet = data.user?.wallets?.find((w: any) => w.walletType === "managed")
          if (managedWallet?.address) {
            setWalletAddress(managedWallet.address)
          } else {
            setWalletAddress("")
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching user data:", error)
          setWalletAddress("")
        }
      }
    }

    const timeoutId = setTimeout(fetchUserData, 100)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [ready, authenticated, user?.id])

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Main Navigation Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
      >
        {/* Wallet Info Bar - Always visible */}
        <div className="px-4 py-2 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Wallet className="h-4 w-4 text-purple-400 flex-shrink-0" />
              {authenticated && walletAddress ? (
                <>
                  <span className="text-xs text-white/70 font-mono truncate">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyAddress}
                    className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10 ml-auto"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </>
              ) : (
                <span className="text-xs text-white/50">Not connected</span>
              )}
            </div>
            
            {/* Gigs Button */}
            <Link href="/gigs">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-3 border-white/20 text-white/70 hover:text-white hover:bg-white/10 ${
                    pathname === "/gigs" ? "bg-purple-500/20 border-purple-500/50 text-purple-400" : ""
                  }`}
                >
                  <Grid3x3 className="h-4 w-4 mr-1.5" />
                  <span className="text-xs font-medium">Gigs</span>
                </Button>
              </motion.div>
            </Link>

            {/* Login/Profile Button */}
            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-white/20 hover:bg-white/10"
                    >
                      <Avatar className="h-6 w-6 border border-white/20">
                        <AvatarImage src={user?.google?.picture || ""} />
                        <AvatarFallback className="bg-purple-500/20 text-purple-400">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  side="top"
                  className="mb-2 bg-black/95 border-white/20 w-56"
                >
                  <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="text-white/70 hover:text-white hover:bg-white/10">
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white/70 hover:text-white hover:bg-white/10">
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout()
                      router.push("/")
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={async () => {
                    try {
                      if (!ready) {
                        toast({
                          title: "Initializing...",
                          description: "Please wait for Privy to initialize.",
                          variant: "default",
                        })
                        return
                      }
                      await login()
                    } catch (error: any) {
                      console.error("Login error:", error)
                      toast({
                        title: "Login Failed",
                        description: error?.message || "Unable to login. Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={!ready}
                  size="sm"
                  className="h-8 px-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  <span className="text-xs font-medium">Login</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "text-purple-400"
                      : "text-white/60"
                  }`}
                >
                  {Icon && (
                    <div className={`relative ${isActive ? "text-purple-400" : "text-white/60"}`}>
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                  )}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Bottom Safe Area Spacer */}
      <div className="h-safe-area-inset-bottom bg-black/95" />
    </div>
  )
}

