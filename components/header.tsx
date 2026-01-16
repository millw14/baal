"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { usePrivy } from "@privy-io/react-auth"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  Menu,
  X,
  Wallet,
  User,
  Settings,
  LogOut,
  Copy,
  Check
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

export function Header() {
  const { theme, setTheme } = useTheme()
  const { ready, authenticated, login, logout, user } = usePrivy()
  const { publicKey, wallet } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const walletAddress = publicKey?.toBase58() || ""

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

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <motion.span
            className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Argon
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/post-job"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Post Job
          </Link>
          <Link
            href="/gigs"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Browse Gigs
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/ai-agents"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            AI Agents
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gigs..."
              className="pl-10 focus:w-full transition-all"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">New job match</span>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Project update</span>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet / Connect */}
          {authenticated && walletAddress ? (
            <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setDepositModalOpen(true)}>
                  <Wallet className="mr-2 h-4 w-4" />
                  {shortenedAddress}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fund Your Wallet</DialogTitle>
                  <DialogDescription>
                    Send SOL or USDC to this address
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 py-4">
                  <QRCodeSVG value={walletAddress} size={200} />
                  <div className="flex items-center space-x-2">
                    <code className="px-3 py-2 bg-muted rounded text-sm">
                      {walletAddress}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyAddress}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button onClick={login} disabled={!ready}>
              Connect Wallet
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Profile */}
          {authenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.google?.picture || ""} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  await logout()
                  router.push("/")
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t"
        >
          <div className="container px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/post-job"
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Post Job
            </Link>
            <Link
              href="/gigs"
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Gigs
            </Link>
            <Link
              href="/dashboard"
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/ai-agents"
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Agents
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

