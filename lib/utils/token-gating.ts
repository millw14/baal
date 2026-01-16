import { Connection, PublicKey } from "@solana/web3.js"
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token"

/**
 * Token gating utility for Solana
 * Checks if a wallet holds a specific token (SPL token or SOL)
 */

export interface TokenGateConfig {
  tokenMint: string // Token mint address (or "SOL" for native SOL)
  minimumAmount: number // Minimum amount required (in token units or lamports for SOL)
  decimals?: number // Token decimals (9 for SOL, usually 6-9 for SPL tokens)
}

/**
 * Check if a wallet holds the required token amount
 */
export async function checkTokenGate(
  walletAddress: string,
  config: TokenGateConfig,
  connection: Connection
): Promise<{ hasAccess: boolean; balance: number; required: number }> {
  try {
    const walletPubkey = new PublicKey(walletAddress)

    if (config.tokenMint === "SOL") {
      // Check SOL balance
      const balance = await connection.getBalance(walletPubkey)
      const balanceSOL = balance / 1e9 // Convert lamports to SOL
      const hasAccess = balanceSOL >= config.minimumAmount

      return {
        hasAccess,
        balance: balanceSOL,
        required: config.minimumAmount,
      }
    } else {
      // Check SPL token balance
      const tokenMint = new PublicKey(config.tokenMint)
      const decimals = config.decimals || 6 // Default to 6 decimals if not specified

      const associatedTokenAddress = await getAssociatedTokenAddress(
        tokenMint,
        walletPubkey
      )

      try {
        const tokenAccount = await getAccount(connection, associatedTokenAddress)
        const balance = Number(tokenAccount.amount) / Math.pow(10, decimals)
        const hasAccess = balance >= config.minimumAmount

        return {
          hasAccess,
          balance,
          required: config.minimumAmount,
        }
      } catch (error: any) {
        // Token account doesn't exist, balance is 0
        return {
          hasAccess: false,
          balance: 0,
          required: config.minimumAmount,
        }
      }
    }
  } catch (error: any) {
    console.error("Error checking token gate:", error)
    return {
      hasAccess: false,
      balance: 0,
      required: config.minimumAmount,
    }
  }
}

/**
 * Check multiple token gates (user needs to pass at least one)
 */
export async function checkTokenGatesAny(
  walletAddress: string,
  configs: TokenGateConfig[],
  connection: Connection
): Promise<{ hasAccess: boolean; passedGate: TokenGateConfig | null; details: Array<{ config: TokenGateConfig; result: { hasAccess: boolean; balance: number } }> }> {
  const details = await Promise.all(
    configs.map(async (config) => {
      const result = await checkTokenGate(walletAddress, config, connection)
      return { config, result: { hasAccess: result.hasAccess, balance: result.balance } }
    })
  )

  const passedGate = details.find((d) => d.result.hasAccess)?.config || null
  const hasAccess = passedGate !== null

  return {
    hasAccess,
    passedGate,
    details,
  }
}

/**
 * Check multiple token gates (user needs to pass all)
 */
export async function checkTokenGatesAll(
  walletAddress: string,
  configs: TokenGateConfig[],
  connection: Connection
): Promise<{ hasAccess: boolean; details: Array<{ config: TokenGateConfig; result: { hasAccess: boolean; balance: number } }> }> {
  const details = await Promise.all(
    configs.map(async (config) => {
      const result = await checkTokenGate(walletAddress, config, connection)
      return { config, result: { hasAccess: result.hasAccess, balance: result.balance } }
    })
  )

  const hasAccess = details.every((d) => d.result.hasAccess)

  return {
    hasAccess,
    details,
  }
}

