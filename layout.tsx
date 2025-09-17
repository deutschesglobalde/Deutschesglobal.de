import type React from "react"
import type { Metadata } from "next"
import { Source_Sans_3, Playfair_Display, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/lib/theme-provider"
import "./globals.css"

const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Deutsche Global Bank - Professional Banking Excellence",
  description:
    "Experience the future of banking with Deutsche Global Bank. Secure, innovative, and globally trusted financial services.",
  generator: "v0.app",
  keywords: ["banking", "finance", "deutsche bank", "online banking", "secure banking"],
  authors: [{ name: "Deutsche Global Bank" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Deutsche Global Bank - Professional Banking Excellence",
    description: "Secure, innovative, and globally trusted financial services.",
    type: "website",
    locale: "en_US",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${sourceSansPro.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
