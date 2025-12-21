"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { mockGigs, mockCategories } from "@/lib/mock-data"
import { Star, ArrowRight, Filter } from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"

export default function GigsPage() {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [minRating, setMinRating] = useState<string>("0")

  const filteredGigs = mockGigs.filter((gig) => {
    const categoryMatch = selectedCategory === "all" || gig.category === selectedCategory
    const priceMatch = gig.price >= priceRange[0] && gig.price <= priceRange[1]
    const ratingMatch = gig.rating >= parseFloat(minRating)
    return categoryMatch && priceMatch && ratingMatch
  })

  return (
    <PageWrapper>
      <div className="container py-10 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="price">
                      <AccordionTrigger className="text-white">Price Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={500}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-white/60">
                            <span>{priceRange[0]} SOL</span>
                            <span>{priceRange[1]} SOL</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rating">
                      <AccordionTrigger className="text-white">Rating</AccordionTrigger>
                      <AccordionContent>
                        <Select value={minRating} onValueChange={setMinRating}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 border-white/20">
                            <SelectItem value="0" className="text-white">All Ratings</SelectItem>
                            <SelectItem value="4" className="text-white">4+ Stars</SelectItem>
                            <SelectItem value="4.5" className="text-white">4.5+ Stars</SelectItem>
                            <SelectItem value="4.8" className="text-white">4.8+ Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="category">
                      <AccordionTrigger className="text-white">Category</AccordionTrigger>
                      <AccordionContent>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 border-white/20">
                            <SelectItem value="all" className="text-white">All Categories</SelectItem>
                            {mockCategories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-white">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold mb-4 text-white">Browse Gigs</h1>
              <Input 
                placeholder="Search gigs..." 
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGigs.map((gig, index) => (
                <motion.div
                  key={gig.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-lg transition-shadow bg-black/80 backdrop-blur-md border-white/20 hover:border-white/40">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={gig.image}
                        alt={gig.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-white">{gig.title}</CardTitle>
                        <Badge variant="secondary" className="bg-white/10 text-white/90">{gig.category}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-white/60">
                        {gig.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-white">{gig.rating}</span>
                          <span className="text-sm text-white/60">
                            ({gig.reviews})
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white">
                          {gig.price} {gig.currency}
                        </div>
                      </div>
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-white/5">
                          <TabsTrigger value="basic" className="text-white data-[state=active]:bg-white/10">Basic</TabsTrigger>
                          <TabsTrigger value="standard" className="text-white data-[state=active]:bg-white/10">Standard</TabsTrigger>
                          <TabsTrigger value="premium" className="text-white data-[state=active]:bg-white/10">Premium</TabsTrigger>
                        </TabsList>
                        <TabsContent value="basic" className="text-sm text-white/70">
                          {gig.packages[0]?.price} {gig.currency} - {gig.packages[0]?.delivery}
                        </TabsContent>
                        <TabsContent value="standard" className="text-sm text-white/70">
                          {gig.packages[1]?.price || gig.packages[0]?.price} {gig.currency} - {gig.packages[1]?.delivery || gig.packages[0]?.delivery}
                        </TabsContent>
                        <TabsContent value="premium" className="text-sm text-white/70">
                          {gig.packages[2]?.price || gig.packages[0]?.price} {gig.currency} - {gig.packages[2]?.delivery || gig.packages[0]?.delivery}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
                            Order Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 border-white/20 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-white">Customize Your Order</DialogTitle>
                            <DialogDescription className="text-white/60">
                              Select package and customize your requirements
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-white">Package</label>
                              <Select>
                                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/95 border-white/20">
                                  {gig.packages.map((pkg, idx) => (
                                    <SelectItem key={idx} value={pkg.name} className="text-white">
                                      {pkg.name} - {pkg.price} {gig.currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500">Proceed to Payment</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  )
}
