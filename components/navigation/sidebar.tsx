"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MessageCircleQuestionIcon, DatabaseIcon } from 'lucide-react'

import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Sidebar() {
const router = useRouter()
const pathname = usePathname()
const { toast } = useToast()
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault()
    router.push("/")
  }
}
window.addEventListener("keydown", handleKeyDown)
return () => window.removeEventListener("keydown", handleKeyDown)
}, [router])

const isActive = (path: string) => {
if (path === "/") return pathname === path
return pathname?.startsWith(path)
}

const getOSKeyboardShortcut = () => {
if (typeof navigator === "undefined") return "⌘ K"
return navigator.userAgent.toLowerCase().includes("mac") ? "⌘ K" : "Ctrl+K"
}

return (
  <aside className="w-64 h-full bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col">
    {/* Brand + New Chat */}
    <div className="p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-4 ml-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Logo width={80} height={14} />
        </Link>
        <ThemeToggle />
      </div>
      <div className="mt-0">
        <Button
          onClick={() => router.push("/")}
          className="w-full justify-between px-3 py-2 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-full text-gray-900 dark:text-white"
          variant="outline"
        >
          <span>Ask New Question</span>
          <span className="text-xs text-muted-foreground">{getOSKeyboardShortcut()}</span>
        </Button>
      </div>
    </div>

    {/* Primary navigation */}
    <nav className="px-3 py-3 space-y-1">
      <Link
        href="/"
        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${
          isActive("/") ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <MessageCircleQuestionIcon size={18} />
        <span>Ask Questions</span>
      </Link>
      <Link
        href="/collections"
        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${
          isActive("/collections") ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <DatabaseIcon size={18} />
        <span>{"Data Sets"} </span>
      </Link>
    </nav>
  </aside>
);
}
