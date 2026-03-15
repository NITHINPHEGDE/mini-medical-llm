import { useEffect, useCallback } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const STORAGE_KEY = 'mediassist_chat_history'

export function useChatHistory() {
  // Save chat messages to localStorage
  const saveChatHistory = useCallback((messages: any[]) => {
    try {
      const chatMessages: ChatMessage[] = messages.map((msg, index) => ({
        id: msg.id || `msg-${index}-${Date.now()}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString(),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatMessages))
    } catch (error) {
      console.error('[v0] Failed to save chat history:', error)
    }
  }, [])

  // Load chat messages from localStorage
  const loadChatHistory = useCallback((): ChatMessage[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('[v0] Failed to load chat history:', error)
      return []
    }
  }, [])

  // Clear chat history
  const clearChatHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('[v0] Failed to clear chat history:', error)
    }
  }, [])

  return {
    saveChatHistory,
    loadChatHistory,
    clearChatHistory,
  }
}
