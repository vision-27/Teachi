import React, { useState, useEffect } from 'react'
import './Carousel.css'

interface CarouselProps {
  children: React.ReactNode[]
  sectionTitles: string[]
  onSlideChange?: (index: number) => void
}

const Carousel: React.FC<CarouselProps> = ({ children, sectionTitles, onSlideChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    onSlideChange?.(index)
  }

  const goToPrevious = () => {
    const newIndex = currentSlide === 0 ? children.length - 1 : currentSlide - 1
    setCurrentSlide(newIndex)
    onSlideChange?.(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentSlide === children.length - 1 ? 0 : currentSlide + 1
    setCurrentSlide(newIndex)
    onSlideChange?.(newIndex)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="carousel">
      <div className="carousel-header">
        <div className="slide-counter">
          {currentSlide + 1} of {children.length}
        </div>
      </div>

      <div className="carousel-container">
        <div className="carousel-content">
          <div 
            className="carousel-slides" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {children.map((child, index) => (
              <div key={index} className="carousel-slide">
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>

      

      <div className="carousel-dots">
        {sectionTitles.map((title, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to ${title}`}
          >
            <span className="dot-title">{title}</span>
          </button>
        ))}
      </div>

    </div>
  )
}

export default Carousel
