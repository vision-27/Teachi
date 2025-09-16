import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Lesson, LessonDetail, LessonSection } from '../services/api'
import PlanningChatbot from './PlanningChatbot'
import './Planning.css'

interface LessonNote {
  id: string
  lessonId: string
  sectionId: string
  content: string
  timestamp: Date
}

const Planning: React.FC = () => {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<LessonNote[]>([])
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('lesson-notes')
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }))
        setNotes(parsedNotes)
      } catch (error) {
        console.error('Error loading notes from localStorage:', error)
      }
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('lesson-notes', JSON.stringify(notes))
  }, [notes])

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

  const handleLessonSelect = async (lessonId: string) => {
    try {
      const lessonDetail = await api.getLessonDetail(lessonId)
      setSelectedLesson(lessonDetail)
    } catch (err) {
      console.error('Error loading lesson detail:', err)
    }
  }

  const handleBackClick = () => {
    navigate('/')
  }

  const handleAddNote = (lessonId: string, sectionId: string) => {
    const newNote: LessonNote = {
      id: Date.now().toString(),
      lessonId,
      sectionId,
      content: '',
      timestamp: new Date()
    }
    setNotes(prev => [...prev, newNote])
    setEditingNote(newNote.id)
    setNoteContent('')
  }

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setEditingNote(noteId)
      setNoteContent(note.content)
    }
  }

  const handleSaveNote = () => {
    if (editingNote && noteContent.trim()) {
      setNotes(prev => prev.map(note => 
        note.id === editingNote 
          ? { ...note, content: noteContent.trim(), timestamp: new Date() }
          : note
      ))
    }
    setEditingNote(null)
    setNoteContent('')
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setNoteContent('')
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }

  const getNotesForSection = (lessonId: string, sectionId: string) => {
    return notes.filter(note => note.lessonId === lessonId && note.sectionId === sectionId)
  }

  const renderSectionContent = (section: LessonSection) => {
    if (typeof section.content === 'string') {
      return <p className="section-content">{section.content}</p>
    } else {
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

  const renderNotesForSection = (lessonId: string, sectionId: string) => {
    const sectionNotes = getNotesForSection(lessonId, sectionId)
    
    return (
      <div className="notes-section">
        <div className="notes-header">
          <h4 className="notes-title">📝 Notes</h4>
          <button 
            className="add-note-button"
            onClick={() => handleAddNote(lessonId, sectionId)}
          >
            + Add Note
          </button>
        </div>
        
        {sectionNotes.length === 0 ? (
          <div className="no-notes">
            <p>No notes yet. Click "Add Note" to start planning!</p>
          </div>
        ) : (
          <div className="notes-list">
            {sectionNotes.map(note => (
              <div key={note.id} className="note-item">
                {editingNote === note.id ? (
                  <div className="note-edit">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Enter your note..."
                      className="note-textarea"
                      rows={3}
                    />
                    <div className="note-actions">
                      <button 
                        className="save-note-button"
                        onClick={handleSaveNote}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-note-button"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="note-display">
                    <div className="note-content">{note.content}</div>
                    <div className="note-meta">
                      <span className="note-time">
                        {note.timestamp.toLocaleString()}
                      </span>
                      <div className="note-actions">
                        <button 
                          className="edit-note-button"
                          onClick={() => handleEditNote(note.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-note-button"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="planning-layout">
        <div className="planning-sidebar">
          <div className="planning-header">
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Home
            </button>
            <h1 className="planning-title">Planning</h1>
            <p className="planning-subtitle">Plan your lessons with notes</p>
          </div>
        </div>
        <div className="planning-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading lessons...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="planning-layout">
        <div className="planning-sidebar">
          <div className="planning-header">
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Home
            </button>
            <h1 className="planning-title">Planning</h1>
            <p className="planning-subtitle">Plan your lessons with notes</p>
          </div>
        </div>
        <div className="planning-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Failed to load lessons</h3>
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="planning-layout">
      <div className="planning-sidebar">
        <div className="planning-header">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Home
          </button>
          <h1 className="planning-title">Planning</h1>
          <p className="planning-subtitle">Plan your lessons with notes</p>
        </div>
        
        <div className="lessons-list">
          <h3 className="lessons-list-title">Lessons</h3>
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className={`lesson-card ${selectedLesson?.id === lesson.id ? 'lesson-card-selected' : ''}`}
                onClick={() => handleLessonSelect(lesson.id)}
              >
                <h4 className="lesson-card-title">{lesson.title}</h4>
                <p className="lesson-card-description">{lesson.summary}</p>
                <div className="lesson-notes-count">
                  {getNotesForSection(lesson.id, '').length} notes
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="planning-content">
        <div className="planning-main-content">
          {selectedLesson ? (
            <div className="selected-lesson">
              <h2 className="selected-lesson-title">{selectedLesson.title}</h2>
              <div className="lesson-sections">
                {selectedLesson.sections.map((section) => (
                  <div 
                    key={section.id} 
                    className={`lesson-section ${selectedSectionId === section.id ? 'lesson-section-selected' : ''}`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                  <h3 className="section-title">{section.title}</h3>
                  {renderSectionContent(section)}
                  {renderNotesForSection(selectedLesson.id, section.id)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-lesson-selected">
              <div className="no-lesson-icon">📚</div>
              <h2>Select a Lesson</h2>
              <p>Choose a lesson from the sidebar to start planning and adding notes.</p>
            </div>
          )}
        </div>
        
        <div className="planning-chatbot-column">
          <PlanningChatbot
            lessonId={selectedLesson?.id || ''}
            sectionId={selectedSectionId || ''}
            sectionTitle={selectedLesson?.sections.find(s => s.id === selectedSectionId)?.title || ''}
            isVisible={!!selectedLesson && !!selectedSectionId}
          />
        </div>
      </div>
    </div>
  )
}

export default Planning
