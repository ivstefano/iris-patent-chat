"use client"

import React from "react"
import { User, Bot } from "lucide-react"
import { DocumentReference, ConversationMessage } from "@/store/conversation-store"

interface MessageBubbleProps {
  message: ConversationMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(timestamp)
  }

  const isQuestion = message.type === 'question'
  const isAnswer = message.type === 'answer'

  return (
    <div className={`flex w-full mb-4 group ${isQuestion ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isQuestion ? 'order-2' : 'order-1'}`}>
        {/* Avatar and Header */}
        <div className={`flex items-center gap-2 mb-1 ${isQuestion ? 'justify-end' : 'justify-start'}`}>
          {isAnswer && (
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
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
              <User size={14} className="text-white" />
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
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm opacity-60">Thinking...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}