import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import TransactionModel from "@/lib/models/Transaction"
import { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { reconstructKeypair } from "@/lib/utils/solana-wallet"

// POST - Create and sign withdrawal transaction from managed wallet
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { privyId, toAddress, amount } = body

    if (!privyId || !toAddress || !amount) {
      return NextResponse.json(
        { error: "privyId, toAddress, and amount are required" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
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
        { error: "Managed wallet not found" },
        { status: 404 }
      )
    }

    // Connect to Solana devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")

    try {
      // Reconstruct keypair from encrypted secret
      const keypair = reconstructKeypair(managedWallet.address, managedWallet.encryptedSecretKey)
      const fromPubkey = keypair.publicKey
      const toPubkey = new PublicKey(toAddress)

      // Check balance
      const balance = await connection.getBalance(fromPubkey)
      const solBalance = balance / LAMPORTS_PER_SOL

      // Convert amount to lamports
      const lamportsToSend = amount * LAMPORTS_PER_SOL

      if (lamportsToSend > balance) {
        return NextResponse.json(
          { error: "Insufficient balance", available: solBalance },
          { status: 400 }
        )
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: lamportsToSend,
        })
      )

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = fromPubkey

      // Sign transaction with managed wallet
      transaction.sign(keypair)

      // Send transaction
      const signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      })

      // Wait for confirmation
      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature,
        },
        "confirmed"
      )

      // Create transaction record in database
      await TransactionModel.create({
        userId: user.privyId,
        walletAddress: managedWallet.address,
        fromAddress: managedWallet.address,
        toAddress: toAddress,
        type: "withdrawal",
        amount,
        currency: "SOL",
        status: "completed",
        description: `Withdrawal to ${toAddress.slice(0, 8)}...${toAddress.slice(-6)}`,
        txHash: signature,
        completedAt: new Date(),
      })

      return NextResponse.json(
        {
          success: true,
          signature,
          message: "Withdrawal successful",
        },
        { status: 200 }
      )
    } catch (error: any) {
      console.error("Error processing withdrawal:", error)
      return NextResponse.json(
        { error: "Transaction failed", message: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error processing withdrawal:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

