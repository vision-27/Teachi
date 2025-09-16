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
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-logo">
            <img src="/teachi-logo.png" alt="Teachi Logo" className="hero-logo-img" style={{ width: '300px', height: 'auto', background: 'none' }} />
          </div>
          <h1 className="hero-title">Empower Your Teaching with AI</h1>
          <p className="hero-subtitle">Sidekick for Superhero Teachers</p>
          <p className="hero-description">
            Teachi is your AI-powered teaching assistant, simplifying content delivery and providing on-demand information to make your classroom more engaging.
          </p>
          <div className="hero-actions">
            <button 
              className="hero-cta primary-cta"
              onClick={handleLessonsClick}
            >
              Start Teaching
            </button>
            <button 
              className="hero-cta secondary-cta"
              onClick={handlePlanningClick}
            >
              Plan Lessons
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Key Benefits of Teachi</h2>
          <p className="features-subtitle">
            Teachi offers a range of features designed to enhance your teaching experience and save you time.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-streamlined">📚</div>
              </div>
              <h3 className="feature-title">Streamlined Content Delivery</h3>
              <p className="feature-description">
                Easily present your lessons with interactive AI-generated content that adapts to your students' needs.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-instant">⚡</div>
              </div>
              <h3 className="feature-title">Instant Access to Information</h3>
              <p className="feature-description">
                Get instant answers to complex questions and access in-depth explanations on any topic, right when you need them.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-efficiency">⏰</div>
              </div>
              <h3 className="feature-title">Time-Saving Efficiency</h3>
              <p className="feature-description">
                Reduce lesson planning time and focus on what matters most: engaging with your students and fostering a love of learning.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Landing
