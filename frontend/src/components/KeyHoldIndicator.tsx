import React from 'react'
import './KeyHoldIndicator.css'

interface KeyHoldIndicatorProps {
  isVisible: boolean
  progress: number
  keyName: string
}

const KeyHoldIndicator: React.FC<KeyHoldIndicatorProps> = ({ 
  isVisible, 
  progress, 
  keyName 
}) => {
  if (!isVisible) return null

  return (
    <div className="key-hold-indicator">
      <div className="key-hold-content">
        <div className="key-hold-key">
          Hold <kbd>{keyName.toUpperCase()}</kbd>
        </div>
        <div className="key-hold-progress">
          <div 
            className="key-hold-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="key-hold-text">
          {progress < 100 ? 'Keep holding...' : 'Activated!'}
        </div>
      </div>
    </div>
  )
}

export default KeyHoldIndicator
