"use client"

import { useEffect, useState } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
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
  Briefcase, 
  GraduationCap, 
  Award, 
  Globe, 
  Plus, 
  X, 
  Edit2,
  Save,
  Calendar,
  DollarSign,
  Clock,
  Star
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
  skills: z.array(z.string()).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(["native", "fluent", "conversational", "basic"]),
  })).optional(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean(),
    description: z.string().optional(),
  })).optional(),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean(),
    description: z.string().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.string().optional(),
  })).optional(),
  portfolio: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),
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
  const { wallets } = useWallets()
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [skillInput, setSkillInput] = useState("")

  // Get Solana wallet address from Privy embedded wallet
  // Use same logic as user-sync hook: check chainType instead of chainId
  const solanaWallet = wallets.find((w) => {
    // Check chainType property (used by Privy for Solana wallets)
    const isSolana = (w as any).chainType === "solana"
    return isSolana
  }) || wallets.find((w) => {
    // Fallback: check chainId for Solana
    const chainId = w.chainId?.toLowerCase() || ""
    return chainId.includes("solana")
  }) || wallets.find((w) => w.walletClientType === "privy") // Final fallback to first Privy wallet
  
  // Get wallet address from multiple sources
  const walletAddress = solanaWallet?.address || 
                       userData?.wallets?.[0]?.address || 
                       (wallets.length > 0 ? wallets[0].address : "")

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
      skills: [],
      languages: [],
      experience: [],
      education: [],
      certifications: [],
      portfolio: [],
    },
  })

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "experience",
  })

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "education",
  })

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control,
    name: "certifications",
  })

  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({
    control,
    name: "portfolio",
  })

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: "languages",
  })

  const watchedSkills = watch("skills") || []

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
          setValue("skills", data.user.skills || [])
          setValue("languages", data.user.languages || [])
          setValue("experience", (data.user.experience || []).map((exp: any) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : "",
            endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : "",
          })))
          setValue("education", (data.user.education || []).map((edu: any) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : "",
            endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : "",
          })))
          setValue("certifications", (data.user.certifications || []).map((cert: any) => ({
            ...cert,
            issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : "",
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : "",
          })))
          setValue("portfolio", data.user.portfolio || [])
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

  const addSkill = () => {
    if (skillInput.trim() && !watchedSkills.includes(skillInput.trim())) {
      setValue("skills", [...watchedSkills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setValue("skills", watchedSkills.filter((s) => s !== skill))
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
      <div className="container py-10 px-4 max-w-6xl">
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
                    {!walletAddress && authenticated && (
                      <p className="text-sm text-white/60">
                        Privy wallet will be created automatically when you first use it
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Skills</CardTitle>
                  <CardDescription className="text-white/60">
                    Add skills relevant to your work
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addSkill()
                            }
                          }}
                          placeholder="Type a skill and press Enter"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        <Button type="button" onClick={addSkill} className="bg-purple-500 hover:bg-purple-600">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {watchedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {watchedSkills.length > 0 ? (
                        watchedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-white/60">No skills added yet</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Languages */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Languages</CardTitle>
                    <CardDescription className="text-white/60">
                      Languages you speak
                    </CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendLanguage({ language: "", proficiency: "conversational" })}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Language
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {languageFields.length === 0 ? (
                    <p className="text-white/60">No languages added yet</p>
                  ) : (
                    <div className="space-y-4">
                      {languageFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end">
                          <div className="flex-1 space-y-2">
                            <Label className="text-white">Language</Label>
                            <Input
                              {...register(`languages.${index}.language`)}
                              disabled={!isEditing}
                              className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-white">Proficiency</Label>
                            <Select
                              disabled={!isEditing}
                              value={watch(`languages.${index}.proficiency`)}
                              onValueChange={(value) => setValue(`languages.${index}.proficiency`, value as any)}
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white disabled:opacity-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/95 border-white/20">
                                <SelectItem value="native" className="text-white">Native</SelectItem>
                                <SelectItem value="fluent" className="text-white">Fluent</SelectItem>
                                <SelectItem value="conversational" className="text-white">Conversational</SelectItem>
                                <SelectItem value="basic" className="text-white">Basic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLanguage(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Work Experience */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work Experience
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Your professional work history
                    </CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendExperience({
                        title: "",
                        company: "",
                        location: "",
                        startDate: "",
                        current: false,
                        description: "",
                      })}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {experienceFields.length === 0 ? (
                    <p className="text-white/60">No work experience added yet</p>
                  ) : (
                    <div className="space-y-6">
                      {experienceFields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-white">Job Title</Label>
                              <Input
                                {...register(`experience.${index}.title`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Company</Label>
                              <Input
                                {...register(`experience.${index}.company`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-white">Location</Label>
                              <Input
                                {...register(`experience.${index}.location`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Start Date</Label>
                              <Input
                                type="date"
                                {...register(`experience.${index}.startDate`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...register(`experience.${index}.current`)}
                                disabled={!isEditing}
                                className="rounded"
                              />
                              <Label className="text-white">Currently working here</Label>
                            </div>
                            {!watch(`experience.${index}.current`) && (
                              <div className="space-y-2">
                                <Label className="text-white">End Date</Label>
                                <Input
                                  type="date"
                                  {...register(`experience.${index}.endDate`)}
                                  disabled={!isEditing}
                                  className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 mb-4">
                            <Label className="text-white">Description</Label>
                            <Textarea
                              {...register(`experience.${index}.description`)}
                              disabled={!isEditing}
                              rows={3}
                              className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                            />
                          </div>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Education */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Your educational background
                    </CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendEducation({
                        school: "",
                        degree: "",
                        field: "",
                        current: false,
                        description: "",
                      })}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {educationFields.length === 0 ? (
                    <p className="text-white/60">No education added yet</p>
                  ) : (
                    <div className="space-y-6">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-white">School</Label>
                              <Input
                                {...register(`education.${index}.school`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Degree</Label>
                              <Input
                                {...register(`education.${index}.degree`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <Label className="text-white">Field of Study</Label>
                            <Input
                              {...register(`education.${index}.field`)}
                              disabled={!isEditing}
                              className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                {...register(`education.${index}.current`)}
                                disabled={!isEditing}
                                className="rounded"
                              />
                              <Label className="text-white">Currently studying</Label>
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Certifications */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certifications
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Professional certifications and licenses
                    </CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCert({
                        name: "",
                        issuer: "",
                        credentialId: "",
                        credentialUrl: "",
                      })}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {certFields.length === 0 ? (
                    <p className="text-white/60">No certifications added yet</p>
                  ) : (
                    <div className="space-y-6">
                      {certFields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-white">Certification Name</Label>
                              <Input
                                {...register(`certifications.${index}.name`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Issuing Organization</Label>
                              <Input
                                {...register(`certifications.${index}.issuer`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-white">Credential ID</Label>
                              <Input
                                {...register(`certifications.${index}.credentialId`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Credential URL</Label>
                              <Input
                                type="url"
                                {...register(`certifications.${index}.credentialUrl`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCert(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Portfolio */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Portfolio
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Showcase your work and projects
                    </CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPortfolio({
                        title: "",
                        description: "",
                        url: "",
                        imageUrl: "",
                      })}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {portfolioFields.length === 0 ? (
                    <p className="text-white/60">No portfolio items added yet</p>
                  ) : (
                    <div className="space-y-6">
                      {portfolioFields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-white">Project Title</Label>
                              <Input
                                {...register(`portfolio.${index}.title`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Description</Label>
                              <Textarea
                                {...register(`portfolio.${index}.description`)}
                                disabled={!isEditing}
                                rows={3}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white">Project URL</Label>
                              <Input
                                type="url"
                                {...register(`portfolio.${index}.url`)}
                                disabled={!isEditing}
                                className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                              />
                            </div>
                            {isEditing && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePortfolio(index)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
