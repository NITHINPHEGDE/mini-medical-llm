'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import { Send, LogOut, Menu, Plus } from 'lucide-react'
import { MessageBubble } from '@/components/MessageBubble'
import { apiService } from '@/services/api'
import jsPDF from 'jspdf'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: { source: string; chunk_id: string }[]
}

export default function ChatPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const res = await apiService.getConversations()
      setConversations(res)
    } catch (err) {
      console.error('Failed to load chats:', err)
    }
  }
const downloadPDF = () => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const margin = 50
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const maxWidth = pageWidth - margin * 2

  let y = 80

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('MediAssist Conversation Summary', margin, 50)

  doc.setFontSize(11)

  const checkPageBreak = () => {
    if (y > pageHeight - 60) {
      doc.addPage()
      y = 50
    }
  }

  messages.forEach((msg) => {
    checkPageBreak()

    // Role
    doc.setFont('helvetica', 'bold')
    doc.text(msg.role.toUpperCase(), margin, y)
    y += 18

    doc.setFont('helvetica', 'normal')

    const cleaned = msg.content
      .replace(/\*\*/g, '')
      .replace(/#/g, '')

    const lines = doc.splitTextToSize(cleaned, maxWidth)

    lines.forEach((line: string) => {
      checkPageBreak()
      doc.text(line, margin, y)
      y += 14
    })

    // Sources
    if (msg.sources && msg.sources.length > 0) {
      y += 8
      checkPageBreak()

      doc.setFont('helvetica', 'italic')
      doc.text('Sources:', margin, y)
      y += 16

      doc.setFont('helvetica', 'normal')

      msg.sources.forEach((src) => {
        const sourceText = `• ${src.source} (Chunk ${src.chunk_id})`
        const sourceLines = doc.splitTextToSize(sourceText, maxWidth)

        sourceLines.forEach((line: string) => {
          checkPageBreak()
          doc.text(line, margin + 10, y)
          y += 14
        })
      })
    }

    y += 25
  })

  doc.save('MediAssist-Chat.pdf')
}




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    let currentConversationId = conversationId

    try {
      // Create conversation if none exists
      if (!currentConversationId) {
        const convo = await apiService.createConversation()
        currentConversationId = convo.conversation_id
        setConversationId(currentConversationId)
        await loadChats()
      }

      const userMessage: ChatMessage = {
        role: 'user',
        content: input,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      const data = await apiService.chat(input, currentConversationId!)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer || 'No answer returned.',
        sources: data.sources || [],
      }

      setMessages((prev) => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chat failed:', error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative w-64 h-screen bg-secondary border-r transition-all duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between p-4">
          <div>
            <h1 className="text-lg font-bold mb-4">MediAssist</h1>

            <Button
              onClick={() => {
                setMessages([])
                setConversationId(null)
              }}
              className="w-full mb-4"
            >
              <Plus size={16} className="mr-2" />
              New Chat
            </Button>

            {/* ✅ Conversation List */}
            <div className="space-y-2">
              {conversations.map((chat: any) => (
                <button
                  key={chat.id}
                  onClick={async () => {
                    setConversationId(chat.id)
                    const msgs = await apiService.getMessages(chat.id)
                    setMessages(msgs)
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-muted text-sm truncate"
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-2 truncate">{user?.email}</p>

            <Button
              onClick={handleLogout}
              className="w-full"
              variant="outline"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu size={20} />
          </button>

          <h2 className="text-lg font-semibold">Health Assistant</h2>

          <button onClick={downloadPDF}>
            Download PDF
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
              timestamp={new Date()}
              sources={message.sources}
            />

          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Spinner />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your health concern..."
              disabled={isLoading}
              rows={1}
              className="flex-1 border rounded-lg px-4 py-2 resize-none"
            />

            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Spinner /> : <Send size={20} />}
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}
