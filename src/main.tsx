import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HellGate } from './components/Onboarding/HellGate'
import { loadProgress, saveProgress } from './utils/progressPersistence'
import type { LearningLanguage, RoastIntensity, UserProgress } from './types'

const HELLGATE_VERSION_KEY = 'python-from-hell-hellgate-v1'

type PersistedGateData = Partial<UserProgress> & Record<string, unknown>

function Startup() {
  const saved = useMemo(() => loadProgress() as PersistedGateData, [])
  const [showGate, setShowGate] = useState(
    () => localStorage.getItem(HELLGATE_VERSION_KEY) !== 'entered'
  )

  const savedProgress = useMemo(() => {
    if (Object.keys(saved).length === 0) return null
    return {
      ...saved,
      xp: Number(saved.xp ?? 0),
      streak: Number(saved.streak ?? 1),
      level: Number(saved.level ?? 1),
      currentLessonId: String(saved.currentLessonId ?? 'l1_1_print'),
      currentChallengeIndex: Number(saved.currentChallengeIndex ?? 0),
      completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons : [],
      diagnosticCompleted: Boolean(saved.diagnosticCompleted),
      incidents: Array.isArray(saved.incidents) ? saved.incidents : [],
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
      roastIntensity: String(saved.roastIntensity ?? 'APOCALYPSE'),
      learningLanguage: String(saved.learningLanguage ?? 'HINDI'),
      interviewReadiness: Number(saved.interviewReadiness ?? 0),
    } as UserProgress
  }, [saved])

  const enterApplication = () => {
    localStorage.setItem(HELLGATE_VERSION_KEY, 'entered')
    setShowGate(false)
    window.location.reload()
  }

  const startNewUser = (level: number, intensity: RoastIntensity, language: LearningLanguage) => {
    saveProgress({
      ...saved,
      level,
      roastIntensity: intensity,
      learningLanguage: language,
      diagnosticCompleted: true,
      lastActiveTimestamp: Date.now(),
    })
    enterApplication()
  }

  const resetSession = () => {
    localStorage.removeItem('python-from-hell-progress-v3')
    localStorage.removeItem('python-from-hell-progress-v2')
    localStorage.removeItem('python-from-hell-progress')
    localStorage.setItem(HELLGATE_VERSION_KEY, 'entered')
    setShowGate(false)
    window.location.reload()
  }

  return (
    <>
      <App />
      {showGate && (
        <HellGate
          savedProgress={savedProgress}
          onCompleteNewUser={startNewUser}
          onResumeSession={enterApplication}
          onResetSession={resetSession}
        />
      )}
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Startup />
  </StrictMode>,
)
