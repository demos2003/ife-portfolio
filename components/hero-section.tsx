"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToWork = () => {
    const element = document.getElementById("work")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToAbout = () => {
    const element = document.getElementById("about")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />

      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-wave" />
      <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-primary/12 rounded-full blur-2xl animate-rotate-slow" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-primary/20 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border-2 border-primary/30 rounded-full animate-ping-slow" />
        <div className="absolute top-1/2 right-1/2 w-20 h-20 border-2 border-primary/25 animate-rotate-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-primary/10 rounded-lg animate-wave" />
        <div className="absolute top-3/4 left-1/4 w-28 h-28 border-2 border-primary/15 rounded-full animate-pulse-slow" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-primary rounded-full animate-ping-slow" />
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-primary/70 rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-2/3 w-2 h-2 bg-primary/80 rounded-full animate-float" />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-primary/60 rounded-full animate-float-delayed" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-balance mb-6 leading-tight">
              Crafting Stories Through{" "}
              <span className="text-primary relative inline-block">
                Video
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 2 150 2 198 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary/40"
                  />
                </svg>
              </span>
            </h1>
          </div>

          <div
            className={`transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground text-balance mb-8 leading-relaxed max-w-2xl mx-auto">
              Video Editor & Content Strategist specializing in creating engaging content that resonates and converts
            </p>
          </div>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Button onClick={scrollToWork} size="lg" className="group text-base px-8">
              View My Work
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={scrollToAbout} variant="outline" size="lg" className="text-base px-8 bg-transparent">
              <Play className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
