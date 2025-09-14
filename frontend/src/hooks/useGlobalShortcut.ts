import { useKeyHold } from './useKeyHold'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, VoiceRequest } from '../services/api'

interface UseGlobalShortcutOptions {
  onShortcutTriggered?: () => void
}

export const useGlobalShortcut = ({ onShortcutTriggered }: UseGlobalShortcutOptions = {}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleShortcutComplete = async () => {
    // Check if we're on a lesson page
    const lessonMatch = location.pathname.match(/^\/lesson\/(.+)$/)
    if (lessonMatch) {
      const lessonId = lessonMatch[1]
      console.log('Shortcut triggered on lesson:', lessonId)
      
      try {
        // Use VoiceRequest structure for the shortcut endpoint
        const request: VoiceRequest = {
          lesson_id: lessonId,
          lesson_section_id: 'intro', // Default section - could be improved to get current section
          lessons_step: '1'
        }

        const response = await api.triggerShortcut(request)
        
        // Handle different actions
        if (response.action === 'ask') {
          // Store the response in localStorage so components can access it
          const shortcutResponse = {
            id: Date.now().toString(),
            prompt: 'Voice Command', // Since we don't have the original prompt
            response: response.response,
            sectionTitle: 'Shortcut',
            timestamp: new Date().toISOString()
          }
          
          // Store in localStorage for components to pick up
          localStorage.setItem('lastShortcutResponse', JSON.stringify(shortcutResponse))
          
          // Dispatch a custom event to notify components
          window.dispatchEvent(new CustomEvent('shortcutTriggered', { 
            detail: shortcutResponse 
          }))
          
          onShortcutTriggered?.()
        } else if (typeof response.action === 'object' && response.action.lesson_id) {
          // Handle move action - navigate to the lesson
          console.log('Navigating to lesson:', response.action.lesson_id)
          navigate(`/lesson/${response.action.lesson_id}`)
          onShortcutTriggered?.()
        } else {
          console.log('Unknown shortcut action:', response.action)
        }
      } catch (error) {
        console.error('Failed to trigger shortcut:', error)
      }
    } else {
      // On other pages, try to make a call with null values
      console.log('Shortcut triggered on non-lesson page')
      
      try {
        const request: VoiceRequest = {
          lesson_id: 'none',
          lesson_section_id: 'none',
          lessons_step: 'none'
        }

        const response = await api.triggerShortcut(request)
        
        // Handle different actions
        if (response.action === 'ask') {
          // Store the response in localStorage so components can access it
          const shortcutResponse = {
            id: Date.now().toString(),
            prompt: 'Voice Command', // Since we don't have the original prompt
            response: response.response,
            sectionTitle: 'Shortcut',
            timestamp: new Date().toISOString()
          }
          
          // Store in localStorage for components to pick up
          localStorage.setItem('lastShortcutResponse', JSON.stringify(shortcutResponse))
          
          // Dispatch a custom event to notify components
          window.dispatchEvent(new CustomEvent('shortcutTriggered', { 
            detail: shortcutResponse 
          }))
          
          onShortcutTriggered?.()
        } else if (typeof response.action === 'object' && response.action.lesson_id) {
          // Handle move action - navigate to the lesson
          console.log('Navigating to lesson:', response.action.lesson_id)
          navigate(`/lesson/${response.action.lesson_id}`)
          onShortcutTriggered?.()
        } else {
          console.log('Unknown shortcut action:', response.action)
        }
      } catch (error) {
        console.error('Failed to trigger shortcut on non-lesson page:', error)
        onShortcutTriggered?.()
      }
    }
  }

  const { isHolding, holdProgress, cancelHold } = useKeyHold({
    key: '~',
    duration: 200, 
    onHoldComplete: () => {
      console.log('Global V key hold completed - calling API')
      handleShortcutComplete()
    },
    onHoldStart: () => console.log('Global V key hold started'),
    onHoldCancel: () => console.log('Global V key hold cancelled')
  })

  return {
    isHolding,
    holdProgress,
    cancelHold,
    isOnLessonPage: location.pathname.includes('/lesson/')
  }
}
