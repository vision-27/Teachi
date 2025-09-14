export interface Lesson {
  id: string
  title: string
  summary: string
}

export interface LessonStep {
  step: string
  description: string
}

export interface LessonSection {
  id: string
  title: string
  content: string | LessonStep[]
}

export interface LessonDetail {
  id: string
  title: string
  sections: LessonSection[]
}

export interface AskRequest {
  lesson_id: string
  lesson_section_id: string
  lessons_step: string
  userPrompt: string
}

export interface AskResponse {
  input: string
  response: string
}

export interface VoiceRequest {
  lesson_id: string
  lesson_section_id: string
  lessons_step: string
}

export interface VoiceResponse {
  input: string
  response: string
}

export interface MoveToLesson {
  lesson_id: string
}

export type ShortcutAction = 'ask' | MoveToLesson

export interface ShortcutResponse {
  response: string
  lesson_id: string
  lesson_section_id: string
  lessons_step: string
  action: ShortcutAction
}

export interface ShortcutRequest {
  lesson_id: string
  lesson_section_id: string
  lessons_step: string
}

const API_BASE_URL = 'http://localhost:3001'

export const api = {
  async getLessons(): Promise<Lesson[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lessons`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const lessons = await response.json()
      console.log('API: Lessons:', lessons)
      return lessons
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
      throw error
    }
  },

  async getLessonDetail(lessonId: string): Promise<LessonDetail> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Lesson not found: ${lessonId}`)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const lessonDetail = await response.json()
      console.log('API: Lesson detail:', lessonDetail)
      return lessonDetail
    } catch (error) {
      console.error('Failed to fetch lesson detail:', error)
      throw error
    }
  },

  async askAI(request: AskRequest): Promise<AskResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Bad request')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const askResponse = await response.json()
      return askResponse
    } catch (error) {
      console.error('Failed to get AI response:', error)
      throw error
    }
  },

  async askVoice(request: VoiceRequest): Promise<VoiceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Bad request')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const voiceResponse = await response.json()
      return voiceResponse
    } catch (error) {
      console.error('Failed to get voice response:', error)
      throw error
    }
  },

  async triggerShortcut(request: VoiceRequest): Promise<ShortcutResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shortcut`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Bad request')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const shortcutResponse = await response.json()
      return shortcutResponse
    } catch (error) {
      console.error('Failed to trigger shortcut:', error)
      throw error
    }
  }
}