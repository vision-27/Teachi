import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Carousel from './Carousel'
import AIButton from './AIButton'
import VoiceButton from './VoiceButton'
import AIResponsePanel from './AIResponsePanel'
import { api, LessonDetail, LessonSection } from '../services/api'
import './LessonContent.css'

const LessonContent: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const [lessonData, setLessonData] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiResponses, setAiResponses] = useState<Array<{
    id: string
    prompt: string
    response: string
    sectionTitle: string
    timestamp: Date
  }>>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0) // Used by Carousel onSlideChange

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await api.getLessonDetail(lessonId)
        setLessonData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonId])

  // Listen for global shortcut events
  useEffect(() => {
    const handleShortcutTriggered = (event: CustomEvent) => {
      const shortcutResponse = event.detail
      const newResponse = {
        id: shortcutResponse.id,
        prompt: shortcutResponse.prompt,
        response: shortcutResponse.response,
        sectionTitle: shortcutResponse.sectionTitle,
        timestamp: new Date(shortcutResponse.timestamp)
      }
      
      setAiResponses(prev => [...prev, newResponse])
      setSelectedConversationId(newResponse.id)
    }

    window.addEventListener('shortcutTriggered', handleShortcutTriggered as EventListener)
    
    return () => {
      window.removeEventListener('shortcutTriggered', handleShortcutTriggered as EventListener)
    }
  }, [])

  const handleAIPromptSubmit = async (prompt: string, response: string, sectionTitle: string) => {
    console.log(`AI prompt submitted for section "${sectionTitle}":`, prompt)
    
    setIsGenerating(true)
    
    try {
      const newResponse = {
        id: Date.now().toString(),
        prompt,
        response,
        sectionTitle,
        timestamp: new Date()
      }
      
      setAiResponses(prev => [...prev, newResponse])
      // Auto-select the new conversation
      setSelectedConversationId(newResponse.id)
    } catch (error) {
      console.error('Error processing AI response:', error)
    } finally {
      setIsGenerating(false)
    }
  }


  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }



  const handleBackClick = () => {
    navigate('/lessons')
  }

  const renderSectionContent = (section: LessonSection) => {
    if (typeof section.content === 'string') {
      return <p className="section-content">{section.content}</p>
    } else {
      // Handle array of steps
      return (
        <div className="stages-list">
          {section.content.map((step, index) => (
            <div key={index} className="stage-item">
              <span className="stage-number">{index + 1}.</span>
              <div className="stage-content">
                <strong>{step.step}:</strong> {step.description}
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

  const renderSlides = () => {
    if (!lessonData) return []

    return lessonData.sections.map((section, index) => (
      <div key={section.id} className="lesson-section">
        <div className="section-content-wrapper">
          <h2 className="section-title">{section.title}</h2>
          {renderSectionContent(section)}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <AIButton 
              onSubmit={(prompt, response) => handleAIPromptSubmit(prompt, response, section.title)}
              lessonId={lessonId || ''}
              sectionId={section.id}
              sectionTitle={section.title}
              slideNum={index + 1}
            />
            <VoiceButton
              onSubmit={(input, response) => handleAIPromptSubmit(input, response, section.title)}
              lessonId={lessonId || ''}
              sectionId={section.id}
              sectionTitle={section.title}
              slideNum={index + 1}
            />
          </div>
        </div>
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="lesson-layout">
        <div className="lesson-sidebar-left">
          <div className="question-history">
            <h4 className="question-history-title">
              <span className="question-history-icon">💬</span>
              Question History
            </h4>
            {aiResponses.length === 0 ? (
              <div className="question-history-empty">
                <div className="question-history-empty-icon">🤔</div>
                <div className="question-history-empty-text">
                  No questions asked yet. Use the AI buttons in the lesson content to get started!
                </div>
              </div>
            ) : (
              <ul className="question-history-list">
                {aiResponses.map((response) => (
                  <li 
                    key={response.id} 
                    className={`question-history-item ${selectedConversationId === response.id ? 'question-history-item-selected' : ''}`}
                    onClick={() => handleConversationSelect(response.id)}
                  >
                    <div className="question-history-header">
                      <span className="question-history-section">{response.sectionTitle}</span>
                      <span className="question-history-time">
                        {response.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="question-history-text">{response.prompt}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="lesson-content">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Lessons
          </button>
          <div className="lesson-loading">
            <h1>Loading lesson...</h1>
            <p>Please wait while we fetch the lesson content.</p>
          </div>
        </div>
        <div className="lesson-sidebar-right">
          <AIResponsePanel
            responses={aiResponses}
            selectedConversationId={selectedConversationId}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lesson-layout">
        <div className="lesson-sidebar-left">
          <div className="question-history">
            <h4 className="question-history-title">
              <span className="question-history-icon">💬</span>
              Question History
            </h4>
            {aiResponses.length === 0 ? (
              <div className="question-history-empty">
                <div className="question-history-empty-icon">🤔</div>
                <div className="question-history-empty-text">
                  No questions asked yet. Use the AI buttons in the lesson content to get started!
                </div>
              </div>
            ) : (
              <ul className="question-history-list">
                {aiResponses.map((response) => (
                  <li 
                    key={response.id} 
                    className={`question-history-item ${selectedConversationId === response.id ? 'question-history-item-selected' : ''}`}
                    onClick={() => handleConversationSelect(response.id)}
                  >
                    <div className="question-history-header">
                      <span className="question-history-section">{response.sectionTitle}</span>
                      <span className="question-history-time">
                        {response.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="question-history-text">{response.prompt}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="lesson-content">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Lessons
          </button>
          <div className="lesson-error">
            <h1>Error Loading Lesson</h1>
            <p>{error}</p>
          </div>
        </div>
        <div className="lesson-sidebar-right">
          <AIResponsePanel
            responses={aiResponses}
            selectedConversationId={selectedConversationId}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    )
  }

  if (!lessonData) {
    return (
      <div className="lesson-layout">
        <div className="lesson-sidebar-left">
          <div className="question-history">
            <h4 className="question-history-title">
              <span className="question-history-icon">💬</span>
              Question History
            </h4>
            {aiResponses.length === 0 ? (
              <div className="question-history-empty">
                <div className="question-history-empty-icon">🤔</div>
                <div className="question-history-empty-text">
                  No questions asked yet. Use the AI buttons in the lesson content to get started!
                </div>
              </div>
            ) : (
              <ul className="question-history-list">
                {aiResponses.map((response) => (
                  <li 
                    key={response.id} 
                    className={`question-history-item ${selectedConversationId === response.id ? 'question-history-item-selected' : ''}`}
                    onClick={() => handleConversationSelect(response.id)}
                  >
                    <div className="question-history-header">
                      <span className="question-history-section">{response.sectionTitle}</span>
                      <span className="question-history-time">
                        {response.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="question-history-text">{response.prompt}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="lesson-content">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Lessons
          </button>
          <div className="lesson-not-found">
            <h1>Lesson Not Found</h1>
            <p>The lesson you're looking for doesn't exist.</p>
          </div>
        </div>
        <div className="lesson-sidebar-right">
          <AIResponsePanel
            responses={aiResponses}
            selectedConversationId={selectedConversationId}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    )
  }

  const sectionTitles = lessonData.sections.map(section => section.title)

  return (
    <div className="lesson-layout">
      <div className="lesson-sidebar-left">
        <div className="question-history">
          <h4 className="question-history-title">
            <span className="question-history-icon">💬</span>
            Question History
          </h4>
          {aiResponses.length === 0 ? (
            <div className="question-history-empty">
              <div className="question-history-empty-icon">🤔</div>
              <div className="question-history-empty-text">
                No questions asked yet. Use the AI buttons in the lesson content to get started!
              </div>
            </div>
          ) : (
            <ul className="question-history-list">
              {aiResponses.map((response) => (
                <li 
                  key={response.id} 
                  className={`question-history-item ${selectedConversationId === response.id ? 'question-history-item-selected' : ''}`}
                  onClick={() => handleConversationSelect(response.id)}
                >
                  <div className="question-history-header">
                    <span className="question-history-section">{response.sectionTitle}</span>
                    <span className="question-history-time">
                      {response.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="question-history-text">{response.prompt}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="lesson-content">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Lessons
        </button>
        <h1 className="lesson-title">{lessonData.title}</h1>
        <Carousel 
          sectionTitles={sectionTitles}
          onSlideChange={setCurrentSectionIndex}
        >
          {renderSlides()}
        </Carousel>
      </div>
      
      <div className="lesson-sidebar-right">
        <AIResponsePanel
          responses={aiResponses}
          selectedConversationId={selectedConversationId}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  )
}

export default LessonContent
