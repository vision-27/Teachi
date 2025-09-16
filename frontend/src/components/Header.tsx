import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const Header: React.FC = () => {
  const location = useLocation()
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    if (path === '/lessons') {
      return location.pathname.startsWith('/lesson') || location.pathname === '/lessons'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <Link to="/" className="logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/teachi-logo.png" alt="Teachi Logo" className="logo-icon" />
            <span className="logo-text">Teachi</span>
          </Link>
        </div>
      </div>
      
      <nav className="header-nav">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/planning" className={`nav-link ${isActive('/planning') ? 'active' : ''}`}>
          Planning
        </Link>
        <Link to="/lessons" className={`nav-link ${isActive('/lessons') ? 'active' : ''}`}>
          Lessons
        </Link>
      </nav>
      
      <div className="header-right">
      </div>
    </header>
  )
}

export default Header
