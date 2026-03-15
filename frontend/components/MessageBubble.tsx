import React from 'react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'


interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  sources?: { source: string; chunk_id: string }[]
}

export function MessageBubble({
  role,
  content,
  timestamp,
  sources
}: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex mb-4 animate-fadeIn',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-xs md:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl',
          isUser
            ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-none shadow-lg shadow-primary/30'
            : 'bg-gradient-to-br from-white/10 to-white/5 text-foreground rounded-bl-none shadow-md border border-white/10 backdrop-blur-sm'
        )}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* ✅ Sources Section (Assistant Only) */}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Sources:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {sources.map((src, idx) => (
                <li key={idx}>
                  • {src.source} (Chunk {src.chunk_id})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p
            className={cn(
              'text-xs mt-2 opacity-70',
              isUser ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
