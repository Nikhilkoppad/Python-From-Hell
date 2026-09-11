import { useMemo, useState } from 'react';
import type { LearningLanguage, RoastIntensity } from './types';
import type { UserProgress } from './types';
import { CURRICULUM } from './data/curriculum';
import { loadProgress, saveProgress } from './utils/progressPersistence';
import { HellGate } from './components/Onboarding/HellGate';
import { RoastLanguageGate, type RoastLanguage } from './components/Onboarding/RoastLanguageGate';
import { LearningFlowController } from './components/LearningFlowController';
import App from './App';

/**
 * Product entry point.
 * New learners choose the language used for fictional profanity/roasts first,
 * then enter the normal HellGate language, intensity and diagnostic flow.
 */
export default function ProductEntryGate() {
  const [gateKey, setGateKey] = useState(0);
  const [entered, setEntered] = useState(false);
  const [roastLanguage, setRoastLanguage] = useState<RoastLanguage | null>(null);

  const storedProgress = useMemo(() => loadProgress(), [gateKey]);

  if (entered) {
    return (
      <LearningFlowController>
        <App />
      </LearningFlowController>
    );
  }

  const savedProgress =
    storedProgress && storedProgress.diagnosticCompleted
      ? (storedProgress as unknown as UserProgress)
      : null;

  const handleCompleteNewUser = (
    startingLevel: number,
    intensity: RoastIntensity,
    language: LearningLanguage
  ) => {
    const levelIndex = Math.max(
      0,
      Math.min(startingLevel - 1, CURRICULUM.length - 1)
    );
    const startingLesson =
      CURRICULUM[levelIndex]?.lessons[0] ??
      CURRICULUM[0].lessons[0];

    const nextProgress = {
      ...storedProgress,
      level: levelIndex + 1,
      currentLessonId: startingLesson.id,
      currentChallengeIndex: 0,
      currentTopicId: startingLesson.id,
      diagnosticCompleted: true,
      roastIntensity: intensity,
      learningLanguage: language,
      roastLanguage: roastLanguage ?? 'HINDI',
      lastActiveTimestamp: Date.now(),
    };

    saveProgress(nextProgress);
    localStorage.setItem('python-from-hell-roast-language', roastLanguage ?? 'HINDI');
    setEntered(true);
  };

  const handleResumeSession = () => {
    setEntered(true);
  };

  const handleResetSession = () => {
    localStorage.removeItem('python-from-hell-progress');
    localStorage.removeItem('python-from-hell-roast-language');
    sessionStorage.clear();
    setRoastLanguage(null);
    setEntered(false);
    setGateKey((value) => value + 1);
  };

  if (!roastLanguage && !savedProgress) {
    return <RoastLanguageGate onSelect={setRoastLanguage} />;
  }

  return (
    <HellGate
      key={gateKey}
      savedProgress={savedProgress}
      onCompleteNewUser={handleCompleteNewUser}
      onResumeSession={handleResumeSession}
      onResetSession={handleResetSession}
    />
  );
}
