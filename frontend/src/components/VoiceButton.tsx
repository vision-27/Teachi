import React, { useState } from 'react'
import { api, VoiceRequest } from '../services/api'
import './VoiceButton.css'

interface VoiceButtonProps {
  onSubmit: (input: string, response: string) => void
  lessonId: string
  sectionId: string
  sectionTitle: string
  slideNum?: number
  language: string
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onSubmit, 
  lessonId, 
  sectionId, 
  slideNum,
  language
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleVoiceClick = async () => {
    if (isListening || isProcessing) return

    setIsListening(true)
    setIsProcessing(true)

    try {
      const request: VoiceRequest = {
        lesson_id: lessonId,
        lesson_section_id: sectionId,
        lessons_step: slideNum ? slideNum.toString() : '1',
        language: language
      }

      const response = await api.askVoice(request)
      await onSubmit(response.input, response.response)
    } catch (error) {
      console.error('Failed to get voice response:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsListening(false)
      setIsProcessing(false)
    }
  }

  return (
    <button 
      className={`voice-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
      onClick={handleVoiceClick}
      disabled={isProcessing}
      title={isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ask with voice'}
    >
      <span className="voice-icon">
        {isListening ? '🎤' : isProcessing ? '⏳' : '🎙️'}
      </span>
      <span className="voice-text">
        {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Command'}
      </span>
    </button>
  )
}

export default VoiceButton
