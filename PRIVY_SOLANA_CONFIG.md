# Configuring Privy to Create Solana Wallets

## The Issue
Privy was creating Ethereum wallets instead of Solana wallets, and adding `defaultChain`/`supportedChains` caused a configuration error.

## Solution

The configuration has been reverted to the working state. To ensure Privy creates Solana wallets, you need to configure it in the **Privy Dashboard**:

### Step 1: Go to Privy Dashboard
1. Visit https://dashboard.privy.io
2. Sign in and select your app

### Step 2: Configure Embedded Wallets
1. Go to **Settings** → **Embedded Wallets**
2. Find **"Default Chain"** or **"Wallet Creation"** settings
3. Set the default chain to **Solana Devnet** (or Solana Mainnet for production)
4. Make sure **Solana** is enabled in the supported chains

### Step 3: Verify Configuration
- The app is configured with `solana: { chainId: "solana-devnet" }`
- Embedded wallets are set to `createOnLogin: "users-without-wallets"`
- The Privy Dashboard should have Solana as the default chain

### Alternative: Use Privy's Wallet Creation API
If the dashboard doesn't have these options, you may need to programmatically create Solana wallets after login using Privy's API.

## Current Configuration

```typescript
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
```

## Testing
1. After configuring in the dashboard, restart your dev server
2. Create a new account (or use a new email)
3. Check the wallet address - it should be a Solana address
4. Verify in browser console that wallets have `chainType: "solana"`

## Note
If Privy Dashboard doesn't have options to set Solana as default, you may need to:
- Contact Privy support
- Use Privy's programmatic wallet creation
- Or manually create Solana wallets after user login

