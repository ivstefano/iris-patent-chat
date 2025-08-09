"use client"

import { useEffect, useState, useRef } from "react"
import Sidebar from "@/components/navigation/sidebar"
import MobileNavigation from "@/components/navigation/mobile-navigation"
import { useMobile } from "@/hooks/use-mobile"
import { User } from 'lucide-react'
import IrisLogo from "@/components/logo"
import SearchInput from "@/app/components/search-input"
import SearchSuggestions from "@/app/components/search-suggestions"
import { useSearchParams } from "next/navigation"
import { searchSuggestions } from "@/data/search-suggestions"

export default function Home() {
const isMobile = useMobile()
const [mounted, setMounted] = useState(false)
const [query, setQuery] = useState("")
const [searchMode, setSearchMode] = useState("auto")
const [showSuggestions, setShowSuggestions] = useState(false)
const inputRef = useRef<HTMLTextAreaElement>(null)
const suggestionsRef = useRef<HTMLDivElement>(null)
const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined)
const searchParams = useSearchParams()

useEffect(() => {
  setMounted(true)

  if (inputRef.current) {
    inputRef.current.focus()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      const textarea = document.querySelector("textarea") as HTMLTextAreaElement | null
      textarea?.focus()
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setShowSuggestions(false)
    }
  }

  document.addEventListener("keydown", handleKeyDown)
  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [])

useEffect(() => {
  const q = searchParams.get("q")
  const col = searchParams.get("collection")
  const autofocus = searchParams.get("autofocus")
  
  if (q) setQuery(q)
  if (col) setSelectedCollection(col)
  
  // Auto-focus input when coming from "Ask a question" button
  if (autofocus === "true" && inputRef.current) {
    inputRef.current.focus()
  }
}, [searchParams])

useEffect(() => {
  if (query) {
    const filtered = searchSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6)
    setFilteredSuggestions(filtered)
  } else {
    setFilteredSuggestions([])
  }
  setSelectedSuggestionIndex(-1)
}, [query])

const handleSuggestionClick = (suggestion: string) => {
  const slug = suggestion
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50)
  const uniqueId = Math.random().toString(36).substring(2, 8)
  const fullSlug = `${slug}-${uniqueId}`
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

if (!mounted) return null

const content = (
  <div className="flex-1 flex flex-col items-center p-6 overflow-auto">
    <div className="w-full max-w-4xl mt-16">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-normal text-gray-900 dark:text-white mb-2">
          {getGreeting()}, how can we help you?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">We can answer any science questions based on the selected dataset.</p>
      </div>

      <div className="relative">
        <SearchInput
          query={query}
          setQuery={setQuery}
          onSearch={() => {}}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          isMobile={isMobile}
          onFocus={() => setShowSuggestions(true)}
          placeholder="What do you want to know?"
          inputRef={inputRef}
          suggestions={filteredSuggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          selectedSuggestionIndex={selectedSuggestionIndex}
          setSelectedSuggestionIndex={setSelectedSuggestionIndex}
          onSuggestionSelect={handleSuggestionClick}
          // New: collection selection
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
        />

        {showSuggestions && (
          <div ref={suggestionsRef}>
            <SearchSuggestions
              query={query}
              onSuggestionClick={handleSuggestionClick}
              onClose={() => setShowSuggestions(false)}
              selectedIndex={selectedSuggestionIndex}
            />
          </div>
        )}
      </div>
    </div>
  </div>
)

return (
  <main className="flex flex-col h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white overflow-hidden">
    {isMobile ? (
      <>
        <div className="w-full flex justify-between items-center mb-4 p-4">
          <div className="flex items-center">
            <IrisLogo className="mr-1" />
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center">
            <User size={18} className="text-gray-600 dark:text-gray-300" />
          </div>
        </div>
        <div className="flex-1 overflow-auto pb-16">{content}</div>
        <MobileNavigation />
      </>
    ) : (
      <div className="flex h-full">
        <Sidebar />
        {content}
      </div>
    )}
  </main>
)
}
