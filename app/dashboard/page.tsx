"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { PublicKey, Transaction as SolanaTransaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, TrendingUp, CheckCircle2, Clock, Copy, Check, QrCode, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/page-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  status: "active" | "completed" | "paused" | "cancelled"
  progress: number
  budget: number
  currency: "SOL" | "USDC"
  milestones: Array<{
    id: string
    title: string
    status: "pending" | "in-progress" | "completed"
    dueDate?: string
  }>
  agent?: {
    name: string
    avatar?: string
  }
  createdAt: string
}

interface Transaction {
  _id: string
  type: "deposit" | "withdrawal" | "payment" | "refund" | "escrow" | "milestone"
  amount: number
  currency: "SOL" | "USDC"
  status: "pending" | "completed" | "failed"
  description?: string
  createdAt: string
}

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [userData, setUserData] = useState<any>(null)
  
  // Deposit modal state
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [depositMethod, setDepositMethod] = useState<"manual" | "wallet">("manual")
  const [depositing, setDepositing] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Withdraw modal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  // Fetch user data and dashboard data - optimized with parallel fetching
  useEffect(() => {
    if (!ready || !authenticated || !user?.id) {
      setLoading(false) // Ensure loading stops if not authenticated
      return
    }

    let cancelled = false

    const fetchAllData = async () => {
      try {
        setLoading(true)

        // Fetch user data and projects in parallel
        const [userResponse, projectsRes] = await Promise.all([
          fetch(`/api/auth/user?privyId=${user.id}`),
          fetch(`/api/projects?employerId=${user.id}`)
        ])

        if (cancelled) return

        // Process user data
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (cancelled) return
          
          setUserData(userData.user)
          
          // Get managed wallet address from database
          const managedWallet = userData.user?.wallets?.find((w: any) => w.walletType === "managed")
          const walletAddr = managedWallet?.address || ""
          setWalletAddress(walletAddr)

          // Fetch wallet balance and transactions in parallel (only if wallet exists)
          if (walletAddr) {
            const [balanceRes, transactionsRes] = await Promise.all([
              fetch(`/api/wallet/balance?address=${walletAddr}`),
              fetch(`/api/transactions?walletAddress=${walletAddr}&limit=10`)
            ])

            if (cancelled) return

            if (balanceRes.ok) {
              const balanceData = await balanceRes.json()
              setBalance(balanceData.balance)
            }

            if (transactionsRes.ok) {
              const transactionsData = await transactionsRes.json()
              setTransactions(transactionsData.transactions || [])
            }
          } else {
            // No wallet yet - set defaults
            setBalance(0)
            setTransactions([])
          }
        }

        // Process projects
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          if (!cancelled) {
            setProjects(projectsData.projects || [])
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching dashboard data:", error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchAllData()

    return () => {
      cancelled = true
    }
  }, [ready, authenticated, user?.id])

  // Handle deposit from connected wallet
  const handleDepositFromWallet = async () => {
    if (!publicKey || !walletAddress || !depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setDepositing(true)
    try {
      const amount = parseFloat(depositAmount)
      const lamports = amount * LAMPORTS_PER_SOL

      // Create transaction
      const transaction = new SolanaTransaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(walletAddress),
          lamports,
        })
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Send and confirm transaction
      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, "confirmed")

      toast({
        title: "Success!",
        description: `Deposited ${amount} SOL successfully`,
      })

      // Refresh balance
      const balanceRes = await fetch(`/api/wallet/balance?address=${walletAddress}`)
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance)
      }

      // Create transaction record
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          walletAddress,
          fromAddress: publicKey.toBase58(),
          toAddress: walletAddress,
          type: "deposit",
          amount,
          currency: "SOL",
          status: "completed",
          description: `Deposit from ${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-6)}`,
          txHash: signature,
        }),
      })

      // Refresh transactions
      const transactionsRes = await fetch(`/api/transactions?walletAddress=${walletAddress}&limit=10`)
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData.transactions || [])
      }

      setDepositAmount("")
      setDepositModalOpen(false)
    } catch (error: any) {
      console.error("Deposit error:", error)
      toast({
        title: "Deposit Failed",
        description: error?.message || "Failed to process deposit",
        variant: "destructive",
      })
    } finally {
      setDepositing(false)
    }
  }

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!publicKey || !walletAddress || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount and connect a wallet",
        variant: "destructive",
      })
      return
    }

    const amount = parseFloat(withdrawAmount)
    if (balance && amount > balance * 0.95) {
      toast({
        title: "Error",
        description: "Amount exceeds 95% of balance (5% reserved for fees)",
        variant: "destructive",
      })
      return
    }

    setWithdrawing(true)
    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privyId: user?.id,
          toAddress: publicKey.toBase58(),
          amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Withdrawal failed")
      }

      toast({
        title: "Success!",
        description: `Withdrew ${amount} SOL successfully`,
      })

      // Refresh balance and transactions
      const balanceRes = await fetch(`/api/wallet/balance?address=${walletAddress}`)
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance)
      }

      const transactionsRes = await fetch(`/api/transactions?walletAddress=${walletAddress}&limit=10`)
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData.transactions || [])
      }

      setWithdrawAmount("")
      setWithdrawModalOpen(false)
    } catch (error: any) {
      console.error("Withdrawal error:", error)
      toast({
        title: "Withdrawal Failed",
        description: error?.message || "Failed to process withdrawal",
        variant: "destructive",
      })
    } finally {
      setWithdrawing(false)
    }
  }

  if (!ready || !authenticated) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center text-white">Loading...</div>
      </PageWrapper>
    )
  }

  const activeProjects = projects.filter((p) => p.status === "active")
  const completedProjects = projects.filter((p) => p.status === "completed")

  return (
    <PageWrapper>
      <div className="container py-6 md:py-10 px-4 pb-24 md:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Wallet Card */}
          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4 text-white">
                {loading ? (
                  "Loading..."
                ) : balance !== null ? (
                  `${balance.toFixed(4)} SOL`
                ) : (
                  "0.0000 SOL"
                )}
              </div>
              {walletAddress && (
                <div className="text-xs text-white/50 mb-4 font-mono truncate">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white hover:bg-white/10">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Deposit</span>
                      <span className="sm:hidden">Deposit</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/95 border-white/20 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-white">Deposit SOL</DialogTitle>
                      <DialogDescription className="text-white/70">
                        Add SOL to your managed wallet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Deposit Method Selection */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={depositMethod === "manual" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDepositMethod("manual")}
                          className={depositMethod === "manual" ? "bg-purple-500 hover:bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
                        >
                          Manual Transfer
                        </Button>
                        <Button
                          type="button"
                          variant={depositMethod === "wallet" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDepositMethod("wallet")}
                          className={depositMethod === "wallet" ? "bg-purple-500 hover:bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
                        >
                          Connect Wallet
                        </Button>
                      </div>

                      {depositMethod === "manual" ? (
                        <>
                          {/* Manual Deposit - Show QR and Address */}
                          <div className="space-y-4">
                            <div className="text-sm text-white/70">
                              Send SOL to this address from any Solana wallet:
                            </div>
                            {walletAddress && (
                              <>
                                <div className="flex justify-center">
                                  <QRCodeSVG value={walletAddress} size={200} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={walletAddress}
                                    readOnly
                                    className="font-mono text-xs bg-white/10 border-white/20 text-white"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(walletAddress)
                                      setCopied(true)
                                      toast({
                                        title: "Copied!",
                                        description: "Wallet address copied to clipboard",
                                      })
                                      setTimeout(() => setCopied(false), 2000)
                                    }}
                                    className="border-white/20 hover:bg-white/10"
                                  >
                                    {copied ? (
                                      <Check className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <div className="text-xs text-white/50 space-y-1">
                                  <p>• Copy the address above or scan the QR code</p>
                                  <p>• Send SOL from your external wallet (Phantom, Solflare, etc.)</p>
                                  <p>• Transaction will appear in your balance once confirmed</p>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Wallet Connect Deposit */}
                          <div className="space-y-4">
                            {!connected ? (
                              <div className="space-y-4">
                                <div className="text-sm text-white/70">
                                  Connect your Solana wallet to deposit SOL directly
                                </div>
                                <div className="flex justify-center">
                                  <WalletMultiButton className="!bg-purple-500 hover:!bg-purple-600" />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-sm text-white/70">
                                  Connected: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-6)}
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-white">Amount (SOL)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  onClick={handleDepositFromWallet}
                                  disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                                  className="w-full bg-purple-500 hover:bg-purple-600"
                                >
                                  {depositing ? "Processing..." : `Deposit ${depositAmount || "0"} SOL`}
                                </Button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white hover:bg-white/10">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/95 border-white/20 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-white">Withdraw SOL</DialogTitle>
                      <DialogDescription className="text-white/70">
                        Send SOL from your managed wallet to an external wallet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {!connected ? (
                        <div className="space-y-4">
                          <div className="text-sm text-white/70">
                            Connect your Solana wallet to receive the withdrawal
                          </div>
                          <div className="flex justify-center">
                            <WalletMultiButton className="!bg-purple-500 hover:!bg-purple-600" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-white/70">
                            Withdrawing to: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-6)}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Amount (SOL)</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={balance ? (balance * 0.95).toFixed(4) : "0"}
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (balance) {
                                    const maxAmount = balance * 0.95 // 95% leaving 5% for fees
                                    setWithdrawAmount(maxAmount.toFixed(4))
                                  }
                                }}
                                className="border-white/20 text-white hover:bg-white/10 whitespace-nowrap"
                              >
                                Max (95%)
                              </Button>
                            </div>
                            {balance && (
                              <div className="text-xs text-white/50">
                                Available: {balance.toFixed(4)} SOL (Max: {(balance * 0.95).toFixed(4)} SOL)
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={handleWithdraw}
                            disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !publicKey}
                            className="w-full bg-purple-500 hover:bg-purple-600"
                          >
                            {withdrawing ? "Processing..." : `Withdraw ${withdrawAmount || "0"} SOL`}
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {loading ? "..." : activeProjects.length}
              </div>
              <p className="text-sm text-white/60 mt-2">Projects in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-5 w-5" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {loading ? "..." : completedProjects.length}
              </div>
              <p className="text-sm text-white/60 mt-2">Total completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Ongoing Projects */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Active Projects</h2>
          {loading ? (
            <div className="text-center py-10 text-white/60">Loading projects...</div>
          ) : activeProjects.length === 0 ? (
            <Card className="bg-black/80 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center text-white/60">
                No active projects. <Link href="/post-job" className="text-purple-400 hover:underline">Post a job</Link> to get started.
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {activeProjects.map((project) => (
                <AccordionItem key={project._id} value={project._id}>
                  <AccordionTrigger className="text-white hover:text-white/80">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <div className="font-semibold text-white">{project.title}</div>
                        <div className="text-sm text-white/60">
                          {project.agent?.name || "No agent assigned"}
                        </div>
                      </div>
                      <Badge variant={project.status === "active" ? "default" : "secondary"} className="bg-green-500/20 text-green-400 border-green-500/50">
                        {project.status}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2 text-white/70">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      {project.milestones && project.milestones.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-white">Milestones:</div>
                          {project.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm text-white/70">
                              {milestone.status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : milestone.status === "in-progress" ? (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-white/30" />
                              )}
                              <span>{milestone.title}</span>
                              {milestone.dueDate && (
                                <span className="text-white/50 ml-auto">
                                  {new Date(milestone.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <Link href={`/projects/${project._id}`}>
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Recent Transactions</h2>
          <Card className="bg-black/80 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-10 text-white/60">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10 text-white/60">No transactions yet</div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-white capitalize">{tx.type}</div>
                        <div className="text-sm text-white/60">
                          {tx.description || "Transaction"}
                        </div>
                        <div className="text-xs text-white/50 mt-1">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${tx.type === "withdrawal" || tx.type === "payment" ? "text-red-400" : "text-green-400"}`}>
                          {tx.type === "withdrawal" || tx.type === "payment" ? "-" : "+"}
                          {tx.amount} {tx.currency}
                        </div>
                        <Badge
                          variant={
                            tx.status === "completed"
                              ? "default"
                              : tx.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            tx.status === "completed"
                              ? "bg-green-500/20 text-green-400 border-green-500/50"
                              : tx.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                              : "bg-red-500/20 text-red-400 border-red-500/50"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
      </div>
    </PageWrapper>
  )
}

