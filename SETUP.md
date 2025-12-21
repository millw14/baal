# MongoDB & Authentication Setup Guide

This guide will help you set up MongoDB and user authentication for the Baal application.

## Step 1: Update .env.local

Add the MongoDB connection string to your `.env.local` file. Your complete `.env.local` should look like this:

```env
NEXT_PUBLIC_PRIVY_APP_ID=cmjfmcsgj0255ky0c8xkwzmlz
MONGODB_URI=mongodb+srv://milla:555wetip@baal.mzltwm.mongodb.net/?appName=baal
```

**Copy this directly to your `.env.local` file:**

```env
NEXT_PUBLIC_PRIVY_APP_ID=cmjfmcsgj0255ky0c8xkwzmlz
MONGODB_URI=mongodb+srv://milla:555wetip@baal.mzltwm.mongodb.net/?appName=baal
```

## Step 2: Verify Installation

Make sure mongoose is installed:

```bash
npm install mongoose
```

## Step 3: Restart Your Development Server

After updating `.env.local`, restart your development server:

```bash
npm run dev
```

## How It Works

### Automatic User Sync

When a user signs in with Privy:
1. The `UserSyncProvider` automatically detects the authentication
2. User data (email, wallets, profile info) is synced to MongoDB
3. If the user doesn't exist, a new user record is created
4. If the user exists, their last login time is updated

### Database Schema

The User model stores:
- **privyId**: Unique Privy user ID
- **email**: User's email address
- **username**: Optional username
- **wallets**: Array of wallet addresses (Solana)
- **profilePicture**: Optional profile picture URL
- **bio**: Optional user bio
- **lastLoginAt**: Last login timestamp
- **verified**: Verification status
- **onboardingCompleted**: Onboarding status
- **preferences**: User preferences (theme, notifications)
- **stats**: User statistics (jobs posted, completed, spending, earnings)
- **createdAt/updatedAt**: Automatic timestamps

### API Endpoints

#### POST `/api/auth/signin`
Signs in a user and creates/updates their record in MongoDB.

Request body:
```json
{
  "privyId": "user-id",
  "email": "user@example.com",
  "username": "optional-username",
  "wallets": [
    {
      "address": "wallet-address",
      "chainType": "solana",
      "walletType": "embedded"
    }
  ]
}
```

#### GET `/api/auth/user?privyId=xxx`
Fetches a user by Privy ID, email, or wallet address.

Query parameters:
- `privyId`: Privy user ID
- `email`: User email
- `walletAddress`: Wallet address

#### POST `/api/auth/user`
Creates a new user (alternative to signin endpoint).

#### PUT `/api/auth/user`
Updates an existing user's information.

Request body:
```json
{
  "privyId": "user-id",
  "username": "new-username",
  "bio": "Updated bio",
  // ... other fields
}
```

## Testing

1. Start your development server
2. Sign in using Privy (email login)
3. Check your MongoDB database to see the user record
4. The user data should automatically sync when they authenticate

## Troubleshooting

### Connection Error
- Verify your MongoDB connection string is correct
- Check that your MongoDB cluster allows connections from your IP
- Ensure the username and password are correct

### User Not Syncing
- Check browser console for errors
- Verify `MONGODB_URI` is set in `.env.local`
- Restart the development server after updating `.env.local`

### Database Not Found
MongoDB will automatically create the database when the first user is saved. The database name will be derived from your connection string.

