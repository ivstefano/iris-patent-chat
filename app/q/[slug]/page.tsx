"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useConversationStore } from "@/store/conversation-store"
import Sidebar from "@/components/navigation/sidebar"
import MobileNavigation from "@/components/navigation/mobile-navigation"
import { MessageBubble } from "@/app/components/chat/MessageBubble"
import { ChatInput } from "@/app/components/chat/ChatInput"
import { SourcesPanel } from "@/app/components/chat/SourcesPanel"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share, MoreVertical } from "lucide-react"
import { DocumentReference } from "@/store/conversation-store"

export default function ChatPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const isMobile = useMobile()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSources, setShowSources] = useState(!isMobile)

  const {
    conversations,
    currentConversationId,
    getConversation,
    addMessage,
    updateMessage,
    startEditingMessage,
    stopEditingMessage,
    setCurrentConversation,
  } = useConversationStore()

  const conversationId = slug
  const conversation = getConversation(conversationId)

  useEffect(() => {
    if (conversationId) {
      setCurrentConversation(conversationId)
    }
  }, [conversationId, setCurrentConversation])

  // Auto-generate first response for new conversations
  useEffect(() => {
    if (conversation && conversation.messages.length === 1 && conversation.messages[0].type === 'question') {
      const firstQuestion = conversation.messages[0].content
      handleSendMessage(firstQuestion, true) // true indicates it's the initial response
    }
  }, [conversation])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // If conversation doesn't exist, redirect to home
  if (!conversation) {
    return (
      <main className="flex h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-4">Conversation not found</p>
          <Button 
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Return Home
          </Button>
        </div>
      </main>
    )
  }

  const handleSendMessage = async (content: string, isInitialResponse = false) => {
    if (!conversation) return

    setIsLoading(true)

    // Add user message only if it's not the initial response
    if (!isInitialResponse) {
      addMessage(conversationId, {
        type: 'question',
        content,
      })
    }

    // Add loading message for AI response
    const loadingMessageId = `loading-${Date.now()}`
    addMessage(conversationId, {
      type: 'answer',
      content: '',
      isLoading: true,
    })

    try {
      // Call search API with conversation context
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          collection: conversation.collection,
          conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Update loading message with actual response
      const messages = getConversation(conversationId)?.messages || []
      const loadingMessage = messages[messages.length - 1]
      
      if (loadingMessage) {
        updateMessage(conversationId, loadingMessage.id, {
          content: data.summary || 'I apologize, but I couldn\'t generate a response at this time.',
          isLoading: false,
          sources: data.searchResults?.map((result: any, index: number) => ({
            id: `source-${index}`,
            title: result.title,
            filename: result.filename || result.url?.split('/').pop() || `document-${index}`,
            similarity: Math.floor(Math.random() * 35) + 60, // Mock similarity 60-95%
            collection: result.collection || conversation.collection || 'General',
            url: result.url,
          })) || [],
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Update loading message with error
      const messages = getConversation(conversationId)?.messages || []
      const loadingMessage = messages[messages.length - 1]
      
      if (loadingMessage) {
        updateMessage(conversationId, loadingMessage.id, {
          content: 'I apologize, but I encountered an error while processing your request. Please try again.',
          isLoading: false,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    updateMessage(conversationId, messageId, { content: newContent })
    // TODO: Regenerate subsequent messages if needed
  }

  const handleSourceClick = (source: DocumentReference) => {
    if (source.url) {
      window.open(source.url, '_blank')
    }
  }

  // Get all sources from answer messages
  const allSources = conversation.messages
    .filter(m => m.type === 'answer' && m.sources)
    .flatMap(m => m.sources || [])
    .reduce((unique, source) => {
      if (!unique.find(s => s.id === source.id)) {
        unique.push(source)
      }
      return unique
    }, [] as DocumentReference[])

  const chatContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {conversation.title}
            </h1>
            {conversation.collection && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Collection: {conversation.collection}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isMobile && allSources.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              className="text-gray-600 dark:text-gray-400"
            >
              Sources ({allSources.length})
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="group">
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onEdit={handleEditMessage}
              onStartEdit={(messageId) => startEditingMessage(conversationId, messageId)}
              onCancelEdit={(messageId) => stopEditingMessage(conversationId, messageId)}
            />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask a follow-up question..."
      />
    </div>
  )

  if (isMobile) {
    return (
      <main className="flex flex-col h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
        {chatContent}
        <MobileNavigation />
        
        {/* Mobile Sources Modal/Sheet */}
        {showSources && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="w-full bg-white dark:bg-gray-900 rounded-t-lg max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Related Documents</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSources(false)}
                >
                  Close
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SourcesPanel
                  sources={allSources}
                  onSourceClick={handleSourceClick}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="flex h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
      <Sidebar />
      
      {/* Chat Area */}
      <div className="flex-1 flex">
        <div className={`flex-1 ${allSources.length > 0 ? 'mr-80' : ''}`}>
          {chatContent}
        </div>
        
        {/* Sources Sidebar */}
        {allSources.length > 0 && (
          <div className="w-80 flex-shrink-0">
            <SourcesPanel
              sources={allSources}
              onSourceClick={handleSourceClick}
              className="h-full"
            />
          </div>
        )}
      </div>
    </main>
  )
}