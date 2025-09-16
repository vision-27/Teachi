import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Landing from './components/Landing'
import LessonsList from './components/LessonsList'
import LessonContent from './components/LessonContent'
import Planning from './components/Planning'
import KeyHoldIndicator from './components/KeyHoldIndicator'
import { ShortcutProvider } from './contexts/ShortcutContext'
import { useGlobalShortcut } from './hooks/useGlobalShortcut'
import './App.css'

const AppContent: React.FC = () => {
  const { isHolding, holdProgress } = useGlobalShortcut({
    onShortcutTriggered: () => {
      console.log('Global shortcut triggered!')
    }
  })

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/lessons" element={<LessonsList />} />
          <Route path="/lesson/:lessonId" element={<LessonContent />} />
          <Route path="/planning" element={<Planning />} />
        </Routes>
      </main>
      
      <KeyHoldIndicator 
        isVisible={isHolding}
        progress={holdProgress}
        keyName="v"
      />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <ShortcutProvider>
        <AppContent />
      </ShortcutProvider>
    </Router>
  )
}

export default App