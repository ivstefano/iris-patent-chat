import type React from "react"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "IRIS.ai - Internal Knowledge Search",
  description: "Search internal knowledge base with AI",
  icons: {
    icon: "/logo.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full" data-app="iris-ai">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} touch-manipulation`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
