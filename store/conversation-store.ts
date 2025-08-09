import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DocumentReference {
  id: string
  title: string
  filename: string
  similarity: number // 0-100%
  collection?: string
  url?: string
  content?: string // Preview of the chunk content
  page?: number // Page number in the document
}

export interface ConversationMessage {
  id: string
  type: 'question' | 'answer'
  content: string
  timestamp: Date
  isEditing?: boolean
  sources?: DocumentReference[] // For answers
  isLoading?: boolean
}

export interface ConversationThread {
  id: string
  title: string // First question truncated
  messages: ConversationMessage[]
  collection?: string
  createdAt: Date
  updatedAt: Date
}

interface ConversationState {
  conversations: Record<string, ConversationThread>
  currentConversationId?: string
  
  // Core conversation management
  createConversation: (question: string, collection?: string) => string
  addMessage: (conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ConversationMessage>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  
  // Conversation management
  setCurrentConversation: (conversationId: string) => void
  deleteConversation: (conversationId: string) => void
  updateConversationTitle: (conversationId: string, title: string) => void
  
  // Message editing
  startEditingMessage: (conversationId: string, messageId: string) => void
  stopEditingMessage: (conversationId: string, messageId: string) => void
  
  // Utility functions
  getConversation: (conversationId: string) => ConversationThread | undefined
  getMessageCount: (conversationId: string) => number
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Helper function to truncate text for titles
const truncateText = (text: string, maxLength: number = 50) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: {},
      currentConversationId: undefined,

      createConversation: (question: string, collection?: string) => {
        const conversationId = generateId()
        const messageId = generateId()
        const now = new Date()
        
        const questionMessage: ConversationMessage = {
          id: messageId,
          type: 'question',
          content: question,
          timestamp: now,
        }

        const conversation: ConversationThread = {
          id: conversationId,
          title: truncateText(question),
          messages: [questionMessage],
          collection,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          conversations: {
            ...state.conversations,
            [conversationId]: conversation,
          },
          currentConversationId: conversationId,
        }))

        return conversationId
      },

      addMessage: (conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
        set((state) => {
          const conversation = state.conversations[conversationId]
          if (!conversation) return state

          const newMessage: ConversationMessage = {
            ...message,
            id: generateId(),
            timestamp: new Date(),
          }

          return {
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                messages: [...conversation.messages, newMessage],
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      updateMessage: (conversationId: string, messageId: string, updates: Partial<ConversationMessage>) => {
        set((state) => {
          const conversation = state.conversations[conversationId]
          if (!conversation) return state

          const updatedMessages = conversation.messages.map((message) =>
            message.id === messageId ? { ...message, ...updates } : message
          )

          return {
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                messages: updatedMessages,
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      deleteMessage: (conversationId: string, messageId: string) => {
        set((state) => {
          const conversation = state.conversations[conversationId]
          if (!conversation) return state

          const updatedMessages = conversation.messages.filter((message) => message.id !== messageId)

          return {
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                messages: updatedMessages,
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      setCurrentConversation: (conversationId: string) => {
        set({ currentConversationId: conversationId })
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          const { [conversationId]: deleted, ...remainingConversations } = state.conversations
          return {
            conversations: remainingConversations,
            currentConversationId: state.currentConversationId === conversationId ? undefined : state.currentConversationId,
          }
        })
      },

      updateConversationTitle: (conversationId: string, title: string) => {
        set((state) => {
          const conversation = state.conversations[conversationId]
          if (!conversation) return state

          return {
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                title: truncateText(title),
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      startEditingMessage: (conversationId: string, messageId: string) => {
        get().updateMessage(conversationId, messageId, { isEditing: true })
      },

      stopEditingMessage: (conversationId: string, messageId: string) => {
        get().updateMessage(conversationId, messageId, { isEditing: false })
      },

      getConversation: (conversationId: string) => {
        return get().conversations[conversationId]
      },

      getMessageCount: (conversationId: string) => {
        const conversation = get().conversations[conversationId]
        return conversation?.messages.length || 0
      },
    }),
    {
      name: 'iris-ai-conversations',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
)
