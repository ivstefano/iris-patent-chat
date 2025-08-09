"use client"

import React from "react"
import {User, Bot, FileText, ExternalLink} from "lucide-react"
import {ConversationMessage} from "@/store/conversation-store"

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
    if (similarity >= 70) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    if (similarity >= 50) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    if (similarity >= 30) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
  }

  // Sort sources by similarity (highest first)
  const sortedSources = message.sources ? [...message.sources].sort((a, b) => b.similarity - a.similarity) : []

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
                {sortedSources.slice(0, 5).map((source, index) => (
                  <div key={source.id || index} className="flex items-start gap-2">
                    {/* Similarity Badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSimilarityBadgeColor(source.similarity)}`}>
                      {source.similarity}%
                    </span>
                    
                    {/* Source Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                          {source.filename || source.title} - Page {source.page || 'N/A'}
                        </span>
                        {source.url && (
                          <button
                            onClick={() => window.open(source.url, '_blank')}
                            className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {source.content?.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                ))}
                
                {sortedSources.length > 5 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    +{sortedSources.length - 5} more sources
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}