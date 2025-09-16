import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const Landing: React.FC = () => {
  const navigate = useNavigate()

  const handleLessonsClick = () => {
    navigate('/lessons')
  }

  const handlePlanningClick = () => {
    navigate('/planning')
  }

  return (
    <div className="landing">
      <div className="landing-content">
        <div className="landing-logo">
          <img src="/teachi-logo.png" alt="Teachi Logo" className="landing-logo-img" />
        </div>
        <h1 className="landing-title">Welcome to Teachi</h1>
        <p className="landing-subtitle">Sidekick for Superhero teachers</p>
        <p className="landing-description">
            Teachi is an offline AI learning hub for rural schools, easing teacher workloads and giving students reliable, curriculum-aligned resources without internet.
        </p>
        <div className="landing-actions">
          <button 
            className="landing-cta planning-cta"
            onClick={handlePlanningClick}
          >
            Plan Lessons
          </button>
          <button 
            className="landing-cta"
            onClick={handleLessonsClick}
          >
            Start Learning
          </button>
          
        </div>
      </div>
    </div>
  )
}

export default Landing
