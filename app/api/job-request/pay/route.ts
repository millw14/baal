import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import JobRequest from "@/lib/models/JobRequest"
import Transaction from "@/lib/models/Transaction"
import User from "@/lib/models/User"
import { reconstructKeypair } from "@/lib/utils/solana-wallet"
import { Connection, PublicKey, Transaction as SolanaTransaction, SystemProgram } from "@solana/web3.js"

const JOB_COST = 0.05 // 0.05 SOL per job
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com" // Or use your preferred RPC

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { jobRequestId, privyId, platformWalletAddress } = body

    if (!jobRequestId || !privyId) {
      return NextResponse.json(
        { error: "jobRequestId and privyId are required" },
        { status: 400 }
      )
    }

    // Platform wallet address (where payments go) - should be from env in production
    const toWalletAddress = platformWalletAddress || process.env.PLATFORM_WALLET_ADDRESS || ""
    if (!toWalletAddress) {
      return NextResponse.json(
        { error: "Platform wallet address not configured" },
        { status: 500 }
      )
    }

    // Find job request
    const jobRequest = await JobRequest.findById(jobRequestId).lean()
    if (!jobRequest) {
      return NextResponse.json(
        { error: "Job request not found" },
        { status: 404 }
      )
    }

    if (jobRequest.privyId !== privyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (jobRequest.status === "paid" || jobRequest.isFreeUse) {
      return NextResponse.json(
        { error: "Job request already paid" },
        { status: 400 }
      )
    }

    // Get user and managed wallet
    const user = await User.findOne({ privyId })
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const managedWallet = user.wallets.find((w: any) => w.walletType === "managed")
    if (!managedWallet || !managedWallet.address || !managedWallet.encryptedSecretKey) {
      return NextResponse.json(
        { error: "No managed wallet found" },
        { status: 400 }
      )
    }

    // Decrypt and reconstruct keypair
    const keypair = reconstructKeypair(
      managedWallet.address, // public key
      managedWallet.encryptedSecretKey
    )

    // Create payment transaction
    const connection = new Connection(SOLANA_RPC_URL, "confirmed")
    const fromPubkey = keypair.publicKey
    const toPubkey = new PublicKey(toWalletAddress)

    const transaction = new SolanaTransaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: JOB_COST * 1e9, // Convert SOL to lamports
      })
    )

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey

    // Sign transaction
    transaction.sign(keypair)

    // Send transaction
    const signature = await connection.sendRawTransaction(transaction.serialize())
    await connection.confirmTransaction(signature, "confirmed")

    // Create transaction record
    const txRecord = await Transaction.create({
      type: "payment",
      amount: JOB_COST,
      currency: "SOL",
      status: "completed",
      fromAddress: fromPubkey.toBase58(),
      toAddress: toWalletAddress,
      walletAddress: managedWallet.address,
      userId: privyId,
      description: `Payment for job request with ${jobRequest.selectedAgent}`,
      txHash: signature,
      completedAt: new Date(),
    })

    // Update job request
    await JobRequest.findByIdAndUpdate(jobRequestId, {
      status: "paid",
      paymentTransactionId: txRecord._id,
      paymentAmount: JOB_COST,
    })

    return NextResponse.json({
      success: true,
      transactionId: txRecord._id,
      txHash: signature,
    })
  } catch (error: any) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

