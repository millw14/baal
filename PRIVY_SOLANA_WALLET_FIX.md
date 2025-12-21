# Fix Privy Creating Ethereum Wallets Instead of Solana

## The Issue
Privy was creating Ethereum wallets instead of Solana wallets for new users.

## Solution
Added `defaultChain` and `supportedChains` to the Privy configuration to force Solana wallet creation.

### Updated Configuration

```typescript
<PrivyProvider
  appId={privyAppId}
  config={{
    loginMethods: ["email"],
    defaultChain: "solana-devnet",        // ← Added: Sets default chain to Solana
    supportedChains: ["solana-devnet"],   // ← Added: Only supports Solana
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
```

## What Changed

1. **Added `defaultChain: "solana-devnet"`** - This tells Privy to create wallets on Solana by default instead of Ethereum

2. **Added `supportedChains: ["solana-devnet"]`** - This limits the app to only support Solana, ensuring no Ethereum wallets are created

## Testing

After this change:
1. Log out and create a new account (or use a new email)
2. Privy should now create a Solana wallet automatically
3. Check the wallet address in the profile page - it should be a Solana address format
4. Verify in the browser console that the wallet has `chainType: "solana"`

## Notes

- Existing users with Ethereum wallets may need to create a new account or have their wallets migrated
- For production, change `solana-devnet` to `solana-mainnet` if you want mainnet wallets
- The wallet address format for Solana is different from Ethereum (base58 encoded vs hex)

