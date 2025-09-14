import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Lesson } from '../services/api'
import './LessonsList.css'

const LessonsList: React.FC = () => {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedLessons = await api.getLessons()
        setLessons(fetchedLessons)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons')
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const handleLessonClick = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`)
  }

  const handleBackClick = () => {
    navigate('/')
  }

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Re-trigger the useEffect by updating a dependency
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="lessons-list">
        <div className="lessons-header">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Home
          </button>
          <h1 className="lessons-title">Available Lessons</h1>
          <p className="lessons-subtitle">Choose a lesson to start learning</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lessons-list">
        <div className="lessons-header">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Home
          </button>
          <h1 className="lessons-title">Available Lessons</h1>
          <p className="lessons-subtitle">Choose a lesson to start learning</p>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Failed to load lessons</h3>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lessons-list">
      <div className="lessons-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Home
        </button>
        <h1 className="lessons-title">Available Lessons</h1>
        <p className="lessons-subtitle">Choose a lesson to start learning</p>
      </div>

      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id} 
            className="lesson-card"
            onClick={() => handleLessonClick(lesson.id)}
          >
            <div className="lesson-card-header">
              <h3 className="lesson-card-title">{lesson.title}</h3>
            </div>
            <p className="lesson-card-description">{lesson.summary}</p>
            <div className="lesson-card-footer">
              <span className="lesson-arrow">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LessonsList
