import React, { createContext, useContext, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, ShortcutRequest } from '../services/api'

interface ShortcutContextType {
  isHolding: boolean
  holdProgress: number
  triggerShortcut: (lessonId: string, sectionId: string, step: string) => Promise<void>
}

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined)

export const useShortcut = () => {
  const context = useContext(ShortcutContext)
  if (!context) {
    throw new Error('useShortcut must be used within a ShortcutProvider')
  }
  return context
}

interface ShortcutProviderProps {
  children: React.ReactNode
}

export const ShortcutProvider: React.FC<ShortcutProviderProps> = ({ children }) => {
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const triggerShortcut = useCallback(async (lessonId: string, sectionId: string, step: string) => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const request: ShortcutRequest = {
        lesson_id: lessonId,
        lesson_section_id: sectionId,
        lessons_step: step
      }

      const response = await api.triggerShortcut(request)
      
      // Store the response in localStorage so components can access it
      const shortcutResponse = {
        id: Date.now().toString(),
        prompt: response.input,
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
      
    } catch (error) {
      console.error('Failed to trigger shortcut:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating])

  const contextValue: ShortcutContextType = {
    isHolding,
    holdProgress,
    triggerShortcut
  }

  return (
    <ShortcutContext.Provider value={contextValue}>
      {children}
    </ShortcutContext.Provider>
  )
}
