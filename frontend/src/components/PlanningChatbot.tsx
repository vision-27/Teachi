import React, { useState, useRef, useEffect } from 'react'
import { api, AskRequest } from '../services/api'
import './PlanningChatbot.css'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  sectionTitle?: string
}

interface PlanningChatbotProps {
  lessonId: string
  sectionId: string
  sectionTitle: string
  isVisible: boolean
}

const PlanningChatbot: React.FC<PlanningChatbotProps> = ({ 
  lessonId, 
  sectionId, 
  sectionTitle, 
  isVisible 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (inputValue.trim() && !isSubmitting) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue.trim(),
        timestamp: new Date(),
        sectionTitle
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputValue('')
      setIsSubmitting(true)
      
      try {
        const request: AskRequest = {
          lesson_id: lessonId,
          lesson_section_id: sectionId,
          lessons_step: '1',
          userPrompt: userMessage.content,
          language: ''
        }
        
        const response = await api.askAI(request)
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.response,
          timestamp: new Date(),
          sectionTitle
        }
        
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error('Failed to get AI response:', error)
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          sectionTitle
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  if (!isVisible) return null

  return (
    <div className="planning-chatbot">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span>Sidekick</span>
        </div>
        <div className="chatbot-actions">
          <button 
            className="chatbot-clear-button"
            onClick={clearChat}
            title="Clear chat"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="chatbot-context">
        <span className="context-label">Context:</span>
        <span className="context-text">{sectionTitle}</span>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 ? (
          <div className="chatbot-empty">
            <div className="empty-icon">💬</div>
            <div className="empty-text">
              Ask me anything about this section for planning help!
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.type}`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-meta">
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.sectionTitle && (
                  <span className="message-section">
                    {message.sectionTitle}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        {isSubmitting && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <div className="chatbot-input-container">
          <textarea
            ref={inputRef}
            className="chatbot-input"
            placeholder="Ask about this section for planning help..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="chatbot-send-button"
            disabled={!inputValue.trim() || isSubmitting}
          >
            {isSubmitting ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PlanningChatbot
