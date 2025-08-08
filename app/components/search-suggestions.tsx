"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import {searchSuggestions} from "@/data/search-suggestions";

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  onClose?: () => void
  query: string
  selectedIndex?: number
}

export default function SearchSuggestions({
  onSuggestionClick,
  onClose,
  query,
  selectedIndex = -1,
}: SearchSuggestionsProps) {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const [showSuggestions, setShowSuggestions] = useState(true)

  useEffect(() => {
    setShowSuggestions(!pathname?.startsWith("/q/"))
  }, [pathname])

  // Update filtered suggestions whenever query changes
  useEffect(() => {
    // Filter suggestions that include the query (case insensitive)
    const filtered = searchSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6) // Limit to maximum 6 suggestions
    setFilteredSuggestions(filtered)
  }, [query])

  if (!showSuggestions) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-auto z-[1000] mt-1 mx-4 md:mx-0 md:absolute md:w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden">
      <div className="p-3 max-h-[70vh] overflow-y-auto">
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer rounded-md ${
                index === selectedIndex ? "bg-gray-100 dark:bg-[#2a2a2a]" : ""
              }`}
              onClick={() => {
                onSuggestionClick(suggestion)
              }}
            >
              <Search size={18} className="text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                {query && suggestion.toLowerCase().includes(query.toLowerCase()) ? (
                  <>
                    <span className="font-bold">{query}</span>
                    {suggestion.slice(query.length)}
                  </>
                ) : (
                  suggestion
                )}
              </span>
            </div>
          ))
        ) : (
          <div className="px-3 py-3 text-gray-500 dark:text-gray-400 text-sm">No matching suggestions</div>
        )}
      </div>
    </div>
  )
}
