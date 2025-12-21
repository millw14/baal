"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { usePathname } from "next/navigation"
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
  Menu,
  X,
  Search,
  LucideIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"
import { useToast } from "@/components/ui/use-toast"

interface NavItem {
  href: string
  label: string
  icon?: LucideIcon
  iconImage?: string
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", iconImage: "/icons/home.png" },
  { href: "/post-job", label: "Post Job", iconImage: "/icons/post jobs.png" },
  { href: "/gigs", label: "Browse Gigs", icon: Grid3x3 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-agents", label: "AI Agents", iconImage: "/icons/ai agents.png" },
]

export function Sidebar() {
  const { theme, setTheme } = useTheme()
  const { ready, authenticated, login, logout, user } = usePrivy()
  const { wallets } = useWallets()
  const { toast } = useToast()
  const pathname = usePathname()
  
  // Debug: Log Privy state
  useEffect(() => {
    console.log("Privy State:", { ready, authenticated, user: user?.id })
    if (!ready) {
      console.log("⚠️ Privy is not ready yet. Check for initialization errors above.")
    }
  }, [ready, authenticated, user])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Get Solana wallet address from Privy embedded wallet
  const solanaWallet = wallets.find((w) => w.walletClientType === "privy" && (w.chainId === "solana:devnet" || w.chainId === "solana"))
  const walletAddress = solanaWallet?.address || ""

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

  const shortenedAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : ""

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col"
            >
              {/* Logo */}
              <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center space-x-2">
                  <motion.span
                    className="text-2xl font-bold text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Baal
                  </motion.span>
                </Link>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Search gigs..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-white/30"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={item.href}>
                        <motion.div
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-white/10 text-white border border-white/20"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {item.iconImage ? (
                            <div className="relative h-5 w-5 flex-shrink-0">
                              <Image
                                src={item.iconImage}
                                alt={item.label}
                                fill
                                className={`object-contain transition-opacity ${
                                  isActive ? "opacity-100" : "opacity-70"
                                }`}
                                sizes="20px"
                              />
                            </div>
                          ) : Icon ? (
                            <Icon className="h-5 w-5" />
                          ) : null}
                          <span className="text-sm font-medium">{item.label}</span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-white/10 space-y-2">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5 relative"
                      >
                        <Bell className="mr-3 h-5 w-5" />
                        <span className="flex-1 text-left">Notifications</span>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          3
                        </Badge>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80 bg-black/95 border-white/20">
                    <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/10">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">New job match</span>
                        <span className="text-xs text-white/50">2 hours ago</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/10">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Project update</span>
                        <span className="text-xs text-white/50">5 hours ago</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wallet / Login - Animated transition */}
                <AnimatePresence mode="wait">
                  {authenticated ? (
                    walletAddress ? (
                      <motion.div
                        key="wallet"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
                          <DialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                variant="outline"
                                className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
                              >
                                <Wallet className="mr-3 h-5 w-5" />
                                <span className="flex-1 text-left">{shortenedAddress}</span>
                              </Button>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent className="bg-black/95 border-white/20 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-white">Fund Your Wallet</DialogTitle>
                              <DialogDescription className="text-white/70">
                                Send SOL or USDC to this address
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center space-y-4 py-4">
                              <QRCodeSVG value={walletAddress} size={200} />
                              <div className="flex items-center space-x-2">
                                <code className="px-3 py-2 bg-white/10 rounded text-sm text-white">
                                  {walletAddress}
                                </code>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={handleCopyAddress}
                                  className="border-white/20 hover:bg-white/10"
                                >
                                  {copied ? (
                                    <span className="text-green-400">✓</span>
                                  ) : (
                                    <span className="text-white">📋</span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="wallet-loading"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <Button
                          variant="outline"
                          disabled
                          className="w-full justify-start bg-white/5 border-white/20 text-white/50"
                        >
                          <Wallet className="mr-3 h-5 w-5" />
                          <span className="flex-1 text-left">Loading wallet...</span>
                        </Button>
                      </motion.div>
                    )
                  ) : (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {ready ? "Login" : "Initializing..."}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Theme Toggle */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? (
                      <Sun className="mr-3 h-5 w-5" />
                    ) : (
                      <Moon className="mr-3 h-5 w-5" />
                    )}
                    <span className="flex-1 text-left">Theme</span>
                  </Button>
                </motion.div>

                {/* Profile */}
                {authenticated && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
                        >
                          <Avatar className="mr-3 h-6 w-6">
                            <AvatarImage src={user?.google?.picture || ""} />
                            <AvatarFallback className="bg-white/10 text-white">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-left">Profile</span>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-black/95 border-white/20">
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
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

