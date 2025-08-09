"use client"

import React, { useState } from "react"
import {User, Bot, FileText, ExternalLink, ChevronDown, ChevronUp} from "lucide-react"
import {ConversationMessage} from "@/store/conversation-store"
import { PDFViewer } from "../pdf/PDFViewer"

interface MessageBubbleProps {
  message: ConversationMessage
}

export function MessageBubble({message}: MessageBubbleProps) {

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(timestamp)
  }

  const isQuestion = message.type === 'question'
  const isAnswer = message.type === 'answer'

  // Helper function to get similarity badge color
  const getSimilarityBadgeColor = (similarity: number) => {
    if (similarity >= 70) return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
    if (similarity >= 50) return 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
    if (similarity >= 30) return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
    return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
  }

  const [showAllSources, setShowAllSources] = useState(false)
  const [selectedPDF, setSelectedPDF] = useState<{url: string, title: string, page?: number, searchText?: string} | null>(null)

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
            {message.content}
          </div>
          
          {/* Sources Section - Only for answers with sources */}
          {isAnswer && sortedSources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                Sources ({sortedSources.length} references)
              </div>
              <div className="space-y-2">
                {visibleSources.map((source, index) => (
                  <div key={source.id || index} className="flex items-start gap-2">
                    {/* Similarity Badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSimilarityBadgeColor(source.similarity)}`}>
                      {Math.round(source.similarity)}%
                    </span>
                    
                    {/* Source Info */}
                    <div className="flex-1 min-w-0">
                      {source.url ? (
                        <button
                          onClick={() => setSelectedPDF({
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
      
      {/* PDF Viewer */}
      {selectedPDF && (
        <PDFViewer
          isOpen={true}
          onClose={() => setSelectedPDF(null)}
          pdfUrl={selectedPDF.url}
          documentTitle={selectedPDF.title}
          initialPage={selectedPDF.page}
          searchText={selectedPDF.searchText}
        />
      )}
    </div>
  )
}