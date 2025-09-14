import { useState, useEffect, useCallback } from 'react'

interface UseKeyHoldOptions {
  key: string
  duration?: number
  onHoldComplete?: () => void
  onHoldStart?: () => void
  onHoldCancel?: () => void
}

export const useKeyHold = ({
  key,
  duration = 1000, // 1 second default
  onHoldComplete,
  onHoldStart,
  onHoldCancel
}: UseKeyHoldOptions) => {
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null)
  const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null)
  const [keyDownTime, setKeyDownTime] = useState<number | null>(null)

  const startHold = useCallback(() => {
    const now = Date.now()
    setKeyDownTime(now)
    
    setIsHolding(prev => {
      if (prev) return prev // Already holding, don't start again
      
      setHoldProgress(0)
      onHoldStart?.()

      // Start progress animation
      const progressInterval = setInterval(() => {
        setHoldProgress(prev => {
          const newProgress = prev + (100 / (duration / 50)) // Update every 50ms
          return Math.min(newProgress, 100)
        })
      }, 50)

      setProgressTimer(progressInterval)

      // Set timer for hold completion
      const timer = setTimeout(() => {
        onHoldComplete?.()
        setIsHolding(false)
        setHoldProgress(0)
        clearInterval(progressInterval)
        setKeyDownTime(null)
      }, duration)

      setHoldTimer(timer)
      
      return true
    })
  }, [duration, onHoldComplete, onHoldStart])

  const cancelHold = useCallback(() => {
    if (holdTimer) {
      clearTimeout(holdTimer)
      setHoldTimer(null)
    }
    if (progressTimer) {
      clearInterval(progressTimer)
      setProgressTimer(null)
    }
    setIsHolding(false)
    setHoldProgress(0)
    setKeyDownTime(null)
    onHoldCancel?.()
  }, [holdTimer, progressTimer, onHoldCancel])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase() && !event.repeat) {
        console.log('Key down detected:', event.key, 'isHolding:', isHolding)
        event.preventDefault()
        event.stopPropagation()
        startHold()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        console.log('Key up detected:', event.key, 'isHolding:', isHolding, 'keyDownTime:', keyDownTime)
        event.preventDefault()
        event.stopPropagation()
        
        // Only cancel if we've been holding for at least 100ms to avoid rapid key events
        if (keyDownTime && (Date.now() - keyDownTime) > 100) {
          cancelHold()
        } else {
          console.log('Ignoring key up - too quick')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    document.addEventListener('keyup', handleKeyUp, { capture: true })

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('keyup', handleKeyUp, { capture: true })
      cancelHold()
    }
  }, [key, startHold, cancelHold, isHolding, keyDownTime])

  return {
    isHolding,
    holdProgress,
    cancelHold
  }
}
