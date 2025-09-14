import React, { useRef, useEffect } from 'react'
import './AIResponsePanel.css'

interface AIResponse {
  id: string
  prompt: string
  response: string
  sectionTitle: string
  timestamp: Date
}

interface AIResponsePanelProps {
  responses: AIResponse[]
  selectedConversationId: string | null
  isGenerating: boolean
}

const AIResponsePanel: React.FC<AIResponsePanelProps> = ({ 
  responses, 
  selectedConversationId,
  isGenerating 
}) => {
  const responsesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new responses are added
    responsesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [responses, selectedConversationId])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const selectedConversation = selectedConversationId 
    ? responses.find(r => r.id === selectedConversationId) 
    : null

  return (
    <div className="ai-response-panel">
      <div className="ai-panel-header">
        <h3 className="ai-panel-title">
          <span className="ai-panel-icon"></span>
          Sidekick
        </h3>
        {selectedConversation && (
          <span className="ai-panel-section">{selectedConversation.sectionTitle}</span>
        )}
      </div>

      <div className="ai-panel-content">
        {!selectedConversation ? (
          <div className="ai-panel-empty">
            <div className="ai-panel-empty-icon">💬</div>
            <p className="ai-panel-empty-text">
              Select a question from the left panel to view the conversation.
            </p>
          </div>
        ) : (
          <div className="ai-responses-list">
            <div className="ai-response-item">
              <div className="ai-response-header">
                <span className="ai-response-section">{selectedConversation.sectionTitle}</span>
                <span className="ai-response-time">{formatTime(selectedConversation.timestamp)}</span>
              </div>
              <div className="ai-response-prompt">
                <strong>You:</strong> {selectedConversation.prompt}
              </div>
              <div className="ai-response-answer">
                <strong>AI:</strong> {selectedConversation.response}
              </div>
            </div>
            {isGenerating && (
              <div className="ai-response-loading">
                <div className="ai-loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={responsesEndRef} />
          </div>
        )}
      </div>

    </div>
  )
}

export default AIResponsePanel
