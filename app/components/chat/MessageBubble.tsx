"use client"

import React, { useState } from "react"
import {User, Bot, FileText, ExternalLink, ChevronDown, ChevronUp} from "lucide-react"
import {ConversationMessage} from "@/store/conversation-store"

interface MessageBubbleProps {
  message: ConversationMessage
  onOpenPDF?: (pdf: {url: string, title: string, page?: number, searchText?: string}) => void
}

export function MessageBubble({message, onOpenPDF}: MessageBubbleProps) {

  const formatTime = (timestamp: Date | string | number) => {
    // Convert to Date if it's not already
    let date: Date
    if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else {
      return '--:--'
    }
    
    // Handle invalid dates
    if (!date || isNaN(date.getTime())) {
      return '--:--'
    }
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date)
    } catch (error) {
      console.warn('Error formatting timestamp:', error)
      return '--:--'
    }
  }

  const isQuestion = message.type === 'question'
  const isAnswer = message.type === 'answer'
  const isLoading = message.isLoading === true

  // Helper function to get similarity badge styles
  const getSimilarityBadgeStyles = (similarity: number) => {
    if (similarity >= 70) {
      return {
        backgroundColor: 'rgb(220 252 231)', // green-100
        color: 'rgb(22 163 74)', // green-600
        borderColor: 'rgb(134 239 172)', // green-300
      }
    }
    if (similarity >= 50) {
      return {
        backgroundColor: 'rgb(219 234 254)', // blue-100
        color: 'rgb(37 99 235)', // blue-600
        borderColor: 'rgb(147 197 253)', // blue-300
      }
    }
    if (similarity >= 30) {
      return {
        backgroundColor: 'rgb(254 249 195)', // yellow-100
        color: 'rgb(202 138 4)', // yellow-600
        borderColor: 'rgb(253 224 71)', // yellow-300
      }
    }
    return {
      backgroundColor: 'rgb(243 244 246)', // gray-100
      color: 'rgb(75 85 99)', // gray-600
      borderColor: 'rgb(209 213 219)', // gray-300
    }
  }

  const [showAllSources, setShowAllSources] = useState(false)

  // Sort sources by similarity (highest first)
  const sortedSources = message.sources ? [...message.sources].sort((a, b) => b.similarity - a.similarity) : []
  const visibleSources = showAllSources ? sortedSources : sortedSources.slice(0, 5)

  return (
    <div className={`flex w-full mb-4 group ${isQuestion ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isQuestion ? 'order-2' : 'order-1'}`}>
        {/* Avatar and Header */}
        <div className={`flex items-center gap-2 mb-1 ${isQuestion ? 'justify-end' : 'justify-start'}`}>
          {isAnswer && (
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white"/>
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isQuestion ? 'You' : 'IRIS.ai'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {isQuestion && (
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white"/>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`relative px-4 py-3 rounded-2xl ${
            isQuestion
              ? 'bg-blue-600 text-white ml-8'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white mr-8'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {message.content || 'Thinking...'}
                </span>
              </div>
            ) : (
              message.content
            )}
          </div>
          
          {/* Sources Section - Only for answers with sources and not loading */}
          {isAnswer && !isLoading && sortedSources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                Sources ({sortedSources.length} references)
              </div>
              <div className="space-y-2">
                {visibleSources.map((source, index) => (
                  <div key={source.id || index} className="flex items-start gap-2">
                    {/* Similarity Badge */}
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                      style={getSimilarityBadgeStyles(source.similarity)}
                    >
                      {Math.round(source.similarity)}%
                    </span>
                    
                    {/* Source Info */}
                    <div className="flex-1 min-w-0">
                      {source.url ? (
                        <button
                          onClick={() => onOpenPDF?.({
                            url: source.url!,
                            title: source.title,
                            page: source.page,
                            searchText: source.content
                          })}
                          className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-1 -m-1 transition-colors group"
                          title="Click to view PDF"
                        >
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {source.title} - Page {source.page || 'N/A'}
                            </span>
                            <ExternalLink className="h-3 w-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 ml-auto flex-shrink-0" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                            {source.content?.substring(0, 150)}...
                          </p>
                        </button>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                              {source.title} - Page {source.page || 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {source.content?.substring(0, 150)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {sortedSources.length > 5 && (
                  <button
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  >
                    {showAllSources ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show fewer sources
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        +{sortedSources.length - 5} more sources
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}