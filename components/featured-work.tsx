"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getWorkItems, type WorkItem } from "@/lib/work-store"

export function FeaturedWork() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([])

  useEffect(() => {
    const items = getWorkItems().slice(0, 3)
    setWorkItems(items)
  }, [])

  if (workItems.length === 0) {
    return (
      <section className="py-20 md:py-32">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Featured Work</h2>
            <p className="text-lg text-muted-foreground mb-8">No work items yet. Add some from the admin dashboard!</p>
            <Button asChild>
              <Link href="/admin">Go to Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Featured Work</h2>
            <p className="text-lg text-muted-foreground">Recent projects that showcase my creative vision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {workItems.map((item, index) => (
              <Card
                key={item.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                    {item.type === "youtube" ? "YouTube" : item.type === "short-form" ? "Short Form" : "Other"}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
                  <Button asChild variant="ghost" size="sm" className="group/btn">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      View Project
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/work">
                View All Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
