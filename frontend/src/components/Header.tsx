import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <a href="/" className="logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/teachi-logo.png" alt="Teachi Logo" className="logo-icon" />
            <span className="logo-text">Teachi</span>
          </a>
        </div>
      </div>
      
      <nav className="header-nav">
        <a href="/" className="nav-link">Home</a>

        <a href="lessons" className="nav-link">Lessons</a>
      </nav>
      
      <div className="header-right">
      </div>
    </header>
  )
}

export default Header
