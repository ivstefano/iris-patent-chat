import { create } from "zustand"

interface ConversationItem {
  question: string
  answer: string
  isEditing?: boolean
}

interface ConversationState {
  conversations: Record<string, ConversationItem[]>
  addConversation: (slug: string, question: string, answer: string) => void
  addFollowUp: (slug: string, question: string) => void
  updateQuestion: (slug: string, index: number, newQuestion: string) => void
  setEditing: (slug: string, index: number, isEditing: boolean) => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: {},

  addConversation: (slug, question, answer) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [slug]: [{ question, answer }],
      },
    })),

  addFollowUp: (slug, question) =>
    set((state) => {
      // Answer will be provided by the API call
      const answer = "Loading..."
      const currentConversation = state.conversations[slug] || []

      return {
        conversations: {
          ...state.conversations,
          [slug]: [...currentConversation, { question, answer }],
        },
      }
    }),

  updateQuestion: (slug, index, newQuestion) =>
    set((state) => {
      const currentConversation = [...(state.conversations[slug] || [])]

      if (currentConversation[index]) {
        currentConversation[index] = {
          question: newQuestion,
          answer: currentConversation[index].answer, // Keep existing answer
          isEditing: false,
        }
      }

      return {
        conversations: {
          ...state.conversations,
          [slug]: currentConversation,
        },
      }
    }),

  setEditing: (slug, index, isEditing) =>
    set((state) => {
      const currentConversation = [...(state.conversations[slug] || [])]

      if (currentConversation[index]) {
        currentConversation[index] = {
          ...currentConversation[index],
          isEditing,
        }
      }

      return {
        conversations: {
          ...state.conversations,
          [slug]: currentConversation,
        },
      }
    }),
}))
