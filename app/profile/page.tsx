"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PageWrapper } from "@/components/page-wrapper"
import { 
  Copy, 
  Check, 
  MapPin, 
  X, 
  Edit2,
  Save,
} from "lucide-react"

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  title: z.string().optional(),
  bio: z.string().max(5000, "Bio must be less than 5000 characters").optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export default function ProfilePage() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Get managed Solana wallet address from database (not from Privy)
  const managedWallet = userData?.wallets?.find((w: any) => w.walletType === "managed")
  const walletAddress = managedWallet?.address || ""

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      title: "",
      bio: "",
      location: { city: "", country: "" },
    },
  })


  // Fetch user data from API
  useEffect(() => {
    if (ready && authenticated && user?.id) {
      fetchUserData()
    }
  }, [ready, authenticated, user?.id])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/auth/user?privyId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        // Populate form with user data
        if (data.user) {
          setValue("username", data.user.username || user?.google?.name || "")
          setValue("email", data.user.email || user?.google?.email || "")
          setValue("title", data.user.title || "")
          setValue("bio", data.user.bio || "")
          setValue("location", data.user.location || { city: "", country: "" })
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  const handleCopy = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }


  const onSubmit = async (data: ProfileForm) => {
    setSaving(true)
    try {
      const response = await fetch("/api/auth/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privyId: user?.id,
          ...data,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setUserData(result.user)
        setIsEditing(false)
        toast({
          title: "Success!",
          description: "Profile updated successfully",
        })
        await fetchUserData()
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!ready || !authenticated) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center text-white">Loading...</div>
      </PageWrapper>
    )
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center text-white">Loading profile...</div>
      </PageWrapper>
    )
  }

  const stats = userData?.stats || { jobsPosted: 0, jobsCompleted: 0, totalSpent: 0, totalEarned: 0 }

  return (
    <PageWrapper>
      <div className="container py-6 md:py-10 px-4 pb-24 md:pb-10 max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="bg-black/80 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-2 border-white/20">
                      <AvatarImage src={userData?.profilePicture || user?.google?.picture || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-2xl">
                        {userData?.username?.charAt(0).toUpperCase() || user?.google?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {userData?.username || user?.google?.name || "User"}
                      </h1>
                      {userData?.title && (
                        <p className="text-lg text-white/70 mb-2">{userData.title}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        {userData?.location?.city && userData?.location?.country && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{userData.location.city}, {userData.location.country}</span>
                          </div>
                        )}
                        {userData?.verified && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                    className={isEditing ? "border-white/20 text-white hover:bg-white/10" : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"}
                  >
                    {isEditing ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.jobsPosted || 0}</p>
                    <p className="text-sm text-white/60">Jobs Posted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.jobsCompleted || 0}</p>
                    <p className="text-sm text-white/60">Jobs Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalSpent?.toFixed(2) || "0.00"}</p>
                    <p className="text-sm text-white/60">Total Spent (SOL)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalEarned?.toFixed(2) || "0.00"}</p>
                    <p className="text-sm text-white/60">Total Earned (SOL)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Basic Information</CardTitle>
                  <CardDescription className="text-white/60">
                    Your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Username</Label>
                      <Input
                        {...register("username")}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                      {errors.username && (
                        <p className="text-sm text-red-400">{errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Email</Label>
                      <Input
                        type="email"
                        {...register("email")}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Professional Title</Label>
                    <Input
                      {...register("title")}
                      disabled={!isEditing}
                      placeholder="e.g., Product Manager, Full Stack Developer"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Bio / Overview</Label>
                    <Textarea
                      {...register("bio")}
                      disabled={!isEditing}
                      rows={5}
                      placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-400">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">City</Label>
                      <Input
                        {...register("location.city")}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Country</Label>
                      <Input
                        {...register("location.country")}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                    </div>
                  </div>


                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <Label className="text-white">Wallet Address</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={walletAddress || "Loading wallet..."}
                        readOnly
                        className="font-mono text-sm bg-white/10 border-white/20 text-white"
                      />
                      {walletAddress && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopy}
                          className="border-white/20 hover:bg-white/10"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    {!walletAddress && authenticated && !loading && (
                      <p className="text-sm text-white/60">
                        Wallet will be created automatically when you sign in
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>


            {/* Save Button */}
            {isEditing && (
              <motion.div variants={itemVariants} className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                  {saving ? (
                    <>
                      <span className="mr-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
