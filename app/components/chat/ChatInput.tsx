"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({ onSendMessage, disabled = false, placeholder = "Ask a follow-up question...", className }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 5
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    
    textarea.style.height = `${newHeight}px`
    textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden'
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!message.trim() || disabled || isComposing) {
      return
    }

    onSendMessage(message.trim())
    setMessage("")
    
    // Reset textarea height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className}`}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              rows={1}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!message.trim() || disabled || isComposing}
            className="flex-shrink-0 h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message (Enter)"
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {message.length > 0 && `${message.length} characters`}
          </div>
        </div>
      </form>
    </div>
  )
}