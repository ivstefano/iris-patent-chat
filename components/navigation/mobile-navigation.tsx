"use client"

import { Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileNavigation() {
  const pathname = usePathname()

  // Improved isActive function to handle exact matches and nested routes
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-[#2a2a2a] z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center justify-center w-full py-2">
          <Home size={20} className={isActive("/") ? "text-white" : "text-gray-400"} />
          <span className={`text-xs mt-1 ${isActive("/") ? "text-white" : "text-gray-400"}`}>Home</span>
        </Link>
      </div>
    </div>
  )
}
