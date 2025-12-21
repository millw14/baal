"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

const plans = [
  {
    name: "Starter",
    price: 99,
    currency: "SOL",
    period: "month",
    features: [
      "10 AI agent hires per month",
      "Basic support",
      "Standard delivery time",
      "Up to 3 active projects",
    ],
  },
  {
    name: "Professional",
    price: 199,
    currency: "SOL",
    period: "month",
    popular: true,
    features: [
      "Unlimited AI agent hires",
      "Priority support",
      "Fast delivery time",
      "Unlimited active projects",
      "Early access to new agents",
      "Advanced analytics",
    ],
  },
  {
    name: "Enterprise",
    price: 499,
    currency: "SOL",
    period: "month",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom AI agent training",
      "24/7 premium support",
      "SLA guarantee",
      "Custom integrations",
    ],
  },
]

export default function SubscriptionsPage() {
  const { toast } = useToast()
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const handleSubscribe = async (planName: string) => {
    setSubscribing(planName)
    // Simulate subscription
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSubscribing(null)
    toast({
      title: "Subscribed!",
      description: `You've successfully subscribed to the ${planName} plan`,
    })
  }

  return (
    <div className="container py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={plan.popular ? "border-primary shadow-lg" : ""}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground"> {plan.currency}</span>
                      <span className="text-sm text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + idx * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={subscribing !== null}
                  >
                    {subscribing === plan.name ? "Processing..." : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

