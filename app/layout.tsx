import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Video Editor & Content Strategist Portfolio",
    template: "%s | Video Editor Portfolio"
  },
  description: "Showcasing creative video editing and content strategy work",
  keywords: ["video editor", "content strategist", "portfolio", "video production", "content creation"],
  authors: [{ name: "Ife" }],
  creator: "Ife",
  generator: "v0.app",
  icons: {
    icon: "/Ifefaveicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "Video Editor & Content Strategist Portfolio",
    description: "Showcasing creative video editing and content strategy work",
    siteName: "Ife Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Video Editor & Content Strategist Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Editor & Content Strategist Portfolio",
    description: "Showcasing creative video editing and content strategy work",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${GeistMono.variable} dark`}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
