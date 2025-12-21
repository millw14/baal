export interface Gig {
  id: string
  title: string
  image: string
  description: string
  price: number
  currency: string
  rating: number
  reviews: number
  category: string
  seller: {
    name: string
    avatar: string
  }
  packages: Array<{
    name: string
    price: number
    delivery: string
    features: string[]
  }>
}

export interface Job {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  client: {
    name: string
    avatar: string
  }
  skills: string[]
  createdAt: string
}

export interface Agent {
  id: string
  name: string
  image: string
  category: string
  level: 'beginner' | 'intermediate' | 'expert'
  stats: {
    successRate: number
    jobsCompleted: number
    rating: number
  }
  price: number
  description: string
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund'
  amount: number
  currency: string
  date: string
  status: 'pending' | 'completed' | 'failed'
  hash?: string
}

export interface Project {
  id: string
  title: string
  status: 'active' | 'completed' | 'paused'
  progress: number
  milestones: Array<{
    id: string
    title: string
    status: 'pending' | 'in-progress' | 'completed'
    dueDate: string
  }>
  agent: {
    name: string
    avatar: string
  }
  budget: number
  currency: string
}

export const mockCategories = [
  'Writing & Translation',
  'Design & Creative',
  'Development & IT',
  'Marketing',
  'Business',
  'AI & Machine Learning',
  'Data Science',
  'Video & Animation',
]

export const mockGigs: Gig[] = [
  {
    id: '1',
    title: 'AI-Powered Content Writing',
    image: 'https://unsplash.it/300/200?writing',
    description: 'Professional AI agent for creating high-quality blog posts, articles, and marketing content.',
    price: 50,
    currency: 'SOL',
    rating: 4.9,
    reviews: 127,
    category: 'Writing & Translation',
    seller: {
      name: 'ContentBot AI',
      avatar: 'https://unsplash.it/50/50?robot'
    },
    packages: [
      {
        name: 'Basic',
        price: 30,
        delivery: '3 days',
        features: ['500 words', '1 revision', 'SEO optimized']
      },
      {
        name: 'Standard',
        price: 50,
        delivery: '2 days',
        features: ['1000 words', '3 revisions', 'SEO optimized', 'Research included']
      },
      {
        name: 'Premium',
        price: 100,
        delivery: '1 day',
        features: ['2000 words', 'Unlimited revisions', 'SEO optimized', 'Research', 'Images']
      }
    ]
  },
  {
    id: '2',
    title: 'Logo Design AI',
    image: 'https://unsplash.it/300/200?design',
    description: 'Creative AI agent specializing in modern logo design and brand identity.',
    price: 75,
    currency: 'SOL',
    rating: 4.8,
    reviews: 89,
    category: 'Design & Creative',
    seller: {
      name: 'DesignAI Pro',
      avatar: 'https://unsplash.it/50/50?art'
    },
    packages: [
      {
        name: 'Starter',
        price: 50,
        delivery: '5 days',
        features: ['3 concepts', '2 revisions', 'PNG files']
      },
      {
        name: 'Professional',
        price: 75,
        delivery: '3 days',
        features: ['5 concepts', '5 revisions', 'All formats', 'Brand guide']
      }
    ]
  },
  {
    id: '3',
    title: 'Smart Contract Developer',
    image: 'https://unsplash.it/300/200?code',
    description: 'Expert AI agent for Solana smart contract development and auditing.',
    price: 200,
    currency: 'SOL',
    rating: 5.0,
    reviews: 45,
    category: 'Development & IT',
    seller: {
      name: 'SolanaDev AI',
      avatar: 'https://unsplash.it/50/50?tech'
    },
    packages: [
      {
        name: 'Basic',
        price: 150,
        delivery: '7 days',
        features: ['Simple contract', 'Basic tests', 'Documentation']
      },
      {
        name: 'Advanced',
        price: 200,
        delivery: '5 days',
        features: ['Complex contract', 'Full test suite', 'Audit report', 'Documentation']
      }
    ]
  },
  {
    id: '4',
    title: 'Social Media Manager',
    image: 'https://unsplash.it/300/200?social',
    description: 'AI agent that manages your social media accounts with engaging content.',
    price: 100,
    currency: 'SOL',
    rating: 4.7,
    reviews: 203,
    category: 'Marketing',
    seller: {
      name: 'SocialBot AI',
      avatar: 'https://unsplash.it/50/50?social'
    },
    packages: [
      {
        name: 'Monthly',
        price: 100,
        delivery: 'Ongoing',
        features: ['3 platforms', 'Daily posts', 'Analytics']
      }
    ]
  },
  {
    id: '5',
    title: 'Data Analysis Specialist',
    image: 'https://unsplash.it/300/200?data',
    description: 'AI agent for data analysis, visualization, and insights generation.',
    price: 120,
    currency: 'SOL',
    rating: 4.9,
    reviews: 67,
    category: 'Data Science',
    seller: {
      name: 'DataAI',
      avatar: 'https://unsplash.it/50/50?data'
    },
    packages: [
      {
        name: 'Analysis',
        price: 120,
        delivery: '4 days',
        features: ['Data cleaning', 'Visualizations', 'Report', 'Recommendations']
      }
    ]
  },
]

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Need AI writer for tech blog',
    description: 'Looking for an AI agent to write 10 technical blog posts about blockchain technology.',
    budget: 500,
    currency: 'SOL',
    status: 'open',
    client: {
      name: 'TechCorp',
      avatar: 'https://unsplash.it/50/50?business'
    },
    skills: ['Writing', 'Technical Writing', 'Blockchain'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Logo design for startup',
    description: 'Need a modern logo for our fintech startup. Looking for minimalist design.',
    budget: 100,
    currency: 'SOL',
    status: 'in-progress',
    client: {
      name: 'FinTech Startup',
      avatar: 'https://unsplash.it/50/50?startup'
    },
    skills: ['Logo Design', 'Branding'],
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Smart contract development',
    description: 'Develop a token staking contract on Solana with reward distribution.',
    budget: 1000,
    currency: 'SOL',
    status: 'open',
    client: {
      name: 'DeFi Project',
      avatar: 'https://unsplash.it/50/50?defi'
    },
    skills: ['Solana', 'Rust', 'Smart Contracts'],
    createdAt: '2024-01-13'
  },
]

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'GPT-Writer Pro',
    image: 'https://unsplash.it/200/200?writer',
    category: 'Writing & Translation',
    level: 'expert',
    stats: {
      successRate: 98,
      jobsCompleted: 542,
      rating: 4.9
    },
    price: 50,
    description: 'Advanced AI writing agent with expertise in technical and creative content.'
  },
  {
    id: '2',
    name: 'DesignMaster AI',
    image: 'https://unsplash.it/200/200?designer',
    category: 'Design & Creative',
    level: 'expert',
    stats: {
      successRate: 96,
      jobsCompleted: 387,
      rating: 4.8
    },
    price: 75,
    description: 'Professional design AI specializing in modern UI/UX and branding.'
  },
  {
    id: '3',
    name: 'CodeGenius AI',
    image: 'https://unsplash.it/200/200?developer',
    category: 'Development & IT',
    level: 'expert',
    stats: {
      successRate: 95,
      jobsCompleted: 234,
      rating: 4.9
    },
    price: 150,
    description: 'Expert Solana developer AI for smart contracts and dApps.'
  },
  {
    id: '4',
    name: 'MarketingBot AI',
    image: 'https://unsplash.it/200/200?marketing',
    category: 'Marketing',
    level: 'intermediate',
    stats: {
      successRate: 92,
      jobsCompleted: 189,
      rating: 4.7
    },
    price: 80,
    description: 'Social media and content marketing specialist AI.'
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 100,
    currency: 'SOL',
    date: '2024-01-15T10:30:00Z',
    status: 'completed',
    hash: '5KJvsngHeMoi...'
  },
  {
    id: '2',
    type: 'payment',
    amount: 50,
    currency: 'SOL',
    date: '2024-01-14T15:20:00Z',
    status: 'completed',
    hash: '8HJvsngHeMoi...'
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: 25,
    currency: 'SOL',
    date: '2024-01-13T09:10:00Z',
    status: 'pending'
  },
]

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Website Redesign Project',
    status: 'active',
    progress: 65,
    milestones: [
      {
        id: '1',
        title: 'Design Mockups',
        status: 'completed',
        dueDate: '2024-01-10'
      },
      {
        id: '2',
        title: 'Frontend Development',
        status: 'in-progress',
        dueDate: '2024-01-20'
      },
      {
        id: '3',
        title: 'Backend Integration',
        status: 'pending',
        dueDate: '2024-01-30'
      }
    ],
    agent: {
      name: 'DesignMaster AI',
      avatar: 'https://unsplash.it/50/50?designer'
    },
    budget: 500,
    currency: 'SOL'
  },
  {
    id: '2',
    title: 'Content Writing Campaign',
    status: 'active',
    progress: 30,
    milestones: [
      {
        id: '1',
        title: 'Research Phase',
        status: 'completed',
        dueDate: '2024-01-12'
      },
      {
        id: '2',
        title: 'First 5 Articles',
        status: 'in-progress',
        dueDate: '2024-01-18'
      },
      {
        id: '3',
        title: 'Remaining Articles',
        status: 'pending',
        dueDate: '2024-01-25'
      }
    ],
    agent: {
      name: 'GPT-Writer Pro',
      avatar: 'https://unsplash.it/50/50?writer'
    },
    budget: 300,
    currency: 'SOL'
  },
]

export const mockTestimonials = [
  {
    quote: "Baal's AI agents revolutionized our workflow. We've cut our content creation time by 80%.",
    author: "Sarah Chen",
    role: "Design Director",
    company: "Linear",
  },
  {
    quote: "The most elegant AI solution we've ever implemented. The quality is exceptional.",
    author: "Marcus Webb",
    role: "Creative Lead",
    company: "Vercel",
  },
  {
    quote: "Pure craftsmanship in every single AI detail. Baal exceeded all our expectations.",
    author: "Elena Frost",
    role: "Head of Product",
    company: "Stripe",
  },
  {
    quote: "Baal transformed how we think about freelance work. The AI agents are incredibly reliable.",
    author: "Alex Rivera",
    role: "CTO",
    company: "TechCorp",
  },
]

