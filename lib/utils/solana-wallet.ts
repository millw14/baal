import { Keypair } from "@solana/web3.js"
import crypto from "crypto"

/**
 * Generate a new Solana keypair
 * @returns {Keypair} A new Solana keypair
 */
export function generateSolanaKeypair(): Keypair {
  return Keypair.generate()
}

/**
 * Encrypt a private key for secure storage
 * @param privateKey - The private key bytes (Uint8Array)
 * @param encryptionKey - The encryption key (from environment or derived)
 * @returns {string} Encrypted private key as base64 string
 */
export function encryptPrivateKey(privateKey: Uint8Array, encryptionKey: string): string {
  const algorithm = "aes-256-gcm"
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(encryptionKey, "salt", 32)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(Buffer.from(privateKey))
  encrypted = Buffer.concat([encrypted, cipher.final()])
  
  const authTag = cipher.getAuthTag()
  
  // Combine iv, authTag, and encrypted data
  const combined = Buffer.concat([iv, authTag, encrypted])
  return combined.toString("base64")
}

/**
 * Decrypt a private key from storage
 * @param encryptedPrivateKey - The encrypted private key as base64 string
 * @param encryptionKey - The encryption key (from environment or derived)
 * @returns {Uint8Array} Decrypted private key bytes
 */
export function decryptPrivateKey(encryptedPrivateKey: string, encryptionKey: string): Uint8Array {
  const algorithm = "aes-256-gcm"
  const combined = Buffer.from(encryptedPrivateKey, "base64")
  
  const iv = combined.slice(0, 16)
  const authTag = combined.slice(16, 32)
  const encrypted = combined.slice(32)
  
  const key = crypto.scryptSync(encryptionKey, "salt", 32)
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  
  return new Uint8Array(decrypted)
}

/**
 * Get encryption key from environment or generate a default (for dev only)
 */
function getEncryptionKey(): string {
  // In production, use a proper encryption key from environment
  return process.env.SOLANA_WALLET_ENCRYPTION_KEY || "dev-encryption-key-change-in-production"
}

/**
 * Create a Solana wallet and encrypt the private key
 * @returns {{ publicKey: string, encryptedSecretKey: string }} Wallet data ready for database storage
 */
export function createSolanaWallet(): { publicKey: string, encryptedSecretKey: string } {
  const keypair = generateSolanaKeypair()
  const publicKey = keypair.publicKey.toBase58()
  const secretKey = keypair.secretKey
  
  const encryptionKey = getEncryptionKey()
  const encryptedSecretKey = encryptPrivateKey(secretKey, encryptionKey)
  
  return {
    publicKey,
    encryptedSecretKey,
  }
}

/**
 * Reconstruct a Keypair from encrypted private key
 * @param publicKey - The public key (base58 string)
 * @param encryptedSecretKey - The encrypted secret key
 * @returns {Keypair} The reconstructed keypair
 */
export function reconstructKeypair(publicKey: string, encryptedSecretKey: string): Keypair {
  const encryptionKey = getEncryptionKey()
  const secretKey = decryptPrivateKey(encryptedSecretKey, encryptionKey)
  
  // Reconstruct keypair from public key and secret key
  const keypair = Keypair.fromSecretKey(secretKey)
  
  // Verify public key matches
  if (keypair.publicKey.toBase58() !== publicKey) {
    throw new Error("Public key mismatch - encryption key may be incorrect")
  }
  
  return keypair
}

