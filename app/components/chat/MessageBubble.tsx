"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Check, X, User, Bot } from "lucide-react"
import { DocumentReference, ConversationMessage } from "@/store/conversation-store"

interface MessageBubbleProps {
  message: ConversationMessage
  onEdit?: (messageId: string, newContent: string) => void
  onStartEdit?: (messageId: string) => void
  onCancelEdit?: (messageId: string) => void
}

export function MessageBubble({ message, onEdit, onStartEdit, onCancelEdit }: MessageBubbleProps) {
  const [editContent, setEditContent] = useState(message.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (message.isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [message.isEditing])

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim())
    }
    onCancelEdit?.(message.id)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    onCancelEdit?.(message.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

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
          } ${message.isEditing ? 'ring-2 ring-blue-400' : ''}`}
        >
          {message.isEditing ? (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none resize-none outline-none text-current placeholder-current/60"
                rows={Math.max(2, editContent.split('\n').length)}
                placeholder="Enter your message..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-6 px-2 text-xs hover:bg-white/20"
                >
                  <X size={12} className="mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || editContent === message.content}
                  className="h-6 px-2 text-xs bg-white/20 hover:bg-white/30 text-current"
                >
                  <Check size={12} className="mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
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

              {/* Edit button for questions */}
              {isQuestion && !message.isLoading && (
                <button
                  onClick={() => onStartEdit?.(message.id)}
                  className="absolute -right-2 -top-2 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit message"
                >
                  <Edit size={12} />
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}