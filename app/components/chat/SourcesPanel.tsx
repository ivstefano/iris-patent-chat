"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { DocumentReference } from "@/store/conversation-store"

interface SourcesPanelProps {
  sources: DocumentReference[]
  onSourceClick?: (source: DocumentReference) => void
  className?: string
}

export function SourcesPanel({ sources, onSourceClick, className }: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  if (!sources.length) {
    return (
      <div className={`bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Related Documents
          </h3>
        </div>
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <FileText className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm">No sources available</p>
        </div>
      </div>
    )
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 85) return 'text-green-600 dark:text-green-400'
    if (similarity >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSimilarityBadgeColor = (similarity: number) => {
    if (similarity >= 85) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    if (similarity >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  }

  // Group sources by collection
  const groupedSources = sources.reduce((groups, source) => {
    const collection = source.collection || 'Other'
    if (!groups[collection]) {
      groups[collection] = []
    }
    groups[collection].push(source)
    return groups
  }, {} as Record<string, DocumentReference[]>)

  const toggleSection = (collection: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [collection]: !prev[collection]
    }))
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Related Documents ({sources.length})
          </h3>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedSources)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([collection, collectionSources]) => {
              const isCollectionExpanded = expandedSections[collection] !== false
              
              return (
                <div key={collection} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  {/* Collection Header */}
                  <button
                    onClick={() => toggleSection(collection)}
                    className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {collection}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({collectionSources.length})
                      </span>
                    </div>
                    {isCollectionExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                  </button>

                  {/* Collection Sources */}
                  {isCollectionExpanded && (
                    <div className="space-y-2 px-3 pb-3">
                      {collectionSources
                        .sort((a, b) => b.similarity - a.similarity)
                        .map((source) => (
                          <div
                            key={source.id}
                            className="group cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            onClick={() => onSourceClick?.(source)}
                          >
                            {/* Source Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1 min-w-0 flex-1">
                                <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {source.title}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (source.url) {
                                    window.open(source.url, '_blank')
                                  }
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Source Details */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {source.filename}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getSimilarityBadgeColor(source.similarity)}`}>
                                {source.similarity}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}