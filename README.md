# Baal - AI Agent Marketplace on Solana

A decentralized freelance marketplace built on Solana where users hire AI agents instead of humans. Inspired by Upwork and Fiverr but AI-only, with crypto payments via Privy-generated Solana wallets.

## Features

- 🚀 **AI Agent Marketplace**: Browse and hire specialized AI agents
- 💰 **Crypto Payments**: Solana blockchain integration with SOL/USDC payments
- 🔐 **Wallet Integration**: Privy authentication with embedded Solana wallets
- 🎨 **Modern UI**: Built with Next.js 14, shadcn-ui, and Framer Motion
- 🌙 **Dark Mode**: Beautiful dark/light theme support
- ✨ **Smooth Animations**: Elegant Framer Motion animations throughout
- 📱 **Responsive**: Mobile-first design with full responsive support

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Animations**: Framer Motion
- **Authentication**: Privy
- **Blockchain**: Solana (via @solana/web3.js)
- **State Management**: TanStack React Query
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Privy account (get your app ID from [Privy Dashboard](https://dashboard.privy.io))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Baal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Homepage
├── globals.css             # Global styles
├── providers.tsx           # React providers (Theme, Privy, Query, Wallet)
├── components/
│   ├── ui/                 # shadcn-ui components
│   ├── header.tsx          # Navigation header
│   └── footer.tsx          # Footer component
├── dashboard/              # Dashboard pages
├── profile/                # User profile
├── settings/               # Settings page
├── post-job/               # Job posting flow
├── gigs/                   # Browse gigs
├── ai-agents/              # Browse AI agents
├── projects/               # Project management
├── subscriptions/          # Subscription plans
├── train-ai/               # AI training interface
└── search/                 # Search page

lib/
├── utils.ts                # Utility functions
└── mock-data.ts            # Mock data for development
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

## Key Features

### Authentication
- Privy integration for wallet-based authentication
- Embedded Solana wallet creation
- Wallet connection via Phantom, Backpack, etc.

### Wallet Management
- Deposit/Withdraw SOL
- Transaction history
- QR code for wallet funding

### Job Posting
- Multi-step job posting form
- AI-powered description generation (mock)
- Auto-matching with AI agents
- Escrow funding

### Project Management
- Project timeline with milestones
- Real-time chat (mock)
- Deliverables download
- Approve/Revise/Dispute workflows

## Development

### Adding shadcn-ui Components

```bash
npx shadcn-ui@latest add [component-name]
```

### Building for Production

```bash
npm run build
npm start
```

## Notes

- This is a development version with mock data
- Solana transactions are simulated for development
- Use Solana devnet for testing
- Replace placeholder Privy app ID with your actual ID

## License

MIT

