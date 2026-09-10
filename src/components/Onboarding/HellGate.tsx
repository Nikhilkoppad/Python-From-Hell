import React, { useState } from 'react';
import {
  Skull,
  ArrowRight,
  RotateCcw,
  Flame,
  Zap,
  Brain,
} from 'lucide-react';

import type {
  LearningLanguage,
  UserProgress,
  RoastIntensity,
} from '../../types';

import { DiagnosticQuestions } from '../../data/diagnosticQuestions';

interface HellGateProps {
  savedProgress: UserProgress | null;
  onCompleteNewUser: (
    startingLevel: number,
    intensity: RoastIntensity,
    language: LearningLanguage
  ) => void;
  onResumeSession: () => void;
  onResetSession: () => void;
}

type GateStep =
  | 'WELCOME'
  | 'LANGUAGE'
  | 'MANIFEST'
  | 'ASSESSMENT'
  | 'DIAGNOSTIC'
  | 'VERDICT'
  | 'RETURNING';

export const HellGate: React.FC<HellGateProps> = ({
  savedProgress,
  onCompleteNewUser,
  onResumeSession,
  onResetSession,
}) => {
  const isReturning =
    !!savedProgress?.diagnosticCompleted;

  const [step, setStep] = useState<GateStep>('WELCOME');

  const [language, setLanguage] = useState<LearningLanguage>('HINDI');
  const hindi = language === 'HINDI';

  const [intensity, setIntensity] =
    useState<RoastIntensity>('SAVAGE');

  const [diagIndex, setDiagIndex] = useState(0);

  const [diagScore, setDiagScore] = useState(0);

  const [finalScore, setFinalScore] = useState(0);

  const [startingLevel, setStartingLevel] = useState(1);

  const questions =
    DiagnosticQuestions.QUESTIONS;

  /*
   * ============================================================
   * DIAGNOSTIC
   * ============================================================
   */

  const handleAnswerDiagnostic = (
    selectedIndex: number
  ) => {
    const currentQuestion =
      questions[diagIndex];

    const correct =
      selectedIndex ===
      currentQuestion.correctAnswer;

    const newScore =
      diagScore + (correct ? 1 : 0);

    setDiagScore(newScore);

    if (diagIndex + 1 < questions.length) {
      setDiagIndex(diagIndex + 1);
      return;
    }

    /*
     * IMPORTANT:
     *
     * Your old code could return Level 3 even though your
     * curriculum only has Levels 1 and 2.
     *
     * We clamp the result.
     */

    const maximumLevel = 2;

    const calculatedLevel =
      newScore >= questions.length
        ? maximumLevel
        : newScore >= 1
          ? 2
          : 1;

    setFinalScore(newScore);

    setStep('VERDICT');
    setStartingLevel(calculatedLevel);
  };

  /*
   * ============================================================
   * START TRAINING
   * ============================================================
   */

  const enterHell = () => {
    onCompleteNewUser(
      startingLevel,
      intensity,
      language
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 font-mono overflow-y-auto">

      {/* Background atmosphere */}

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#7f1d1d_0%,_transparent_60%)]" />
      </div>

      <div className="relative max-w-3xl w-full">

        {step === 'WELCOME' && (
          <div className="bg-slate-950 border-2 border-red-700 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(220,38,38,0.25)] space-y-7 text-center">
            <Skull className="w-16 h-16 text-red-600 mx-auto animate-pulse" />
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-red-500">BC, PYTHON HELL MEIN WELCOME.</h1>
              <p className="text-sm leading-relaxed text-slate-300">
                {isReturning
                  ? 'Bhai, tera purana code abhi bhi wahi pada hai. Bhaagne se bug solve nahi hota.'
                  : 'Naya shikaar aa gaya. Pehle language choose kar, phir Python teri logic ki talashi lega.'}
              </p>
            </div>
            {isReturning ? (
              <div className="grid gap-3 md:grid-cols-2">
                <button type="button" onClick={onResumeSession} className="rounded-xl bg-red-600 px-5 py-4 text-sm font-black text-white hover:bg-red-500">
                  BC, JAHAN CHHODA THA WAHIN SE CHAL →
                </button>
                <button type="button" onClick={onResetSession} className="rounded-xl border border-slate-700 bg-black px-5 py-4 text-sm font-black text-slate-200 hover:border-red-500">
                  SAB BHUL, NAYA SHURU KAR
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setStep('LANGUAGE')} className="w-full rounded-xl bg-red-600 px-5 py-4 text-sm font-black text-white hover:bg-red-500">
                BC, NAYA HELL SHURU KAR →
              </button>
            )}
          </div>
        )}

        {step === 'LANGUAGE' && (
          <div className="bg-slate-950 border-2 border-red-700 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(220,38,38,0.25)] space-y-8 text-center">
            <Skull className="w-16 h-16 text-red-600 mx-auto animate-pulse" />
            <div>
              <h1 className="text-3xl font-black text-red-500">PICK YOUR DAMAGE LANGUAGE</h1>
              <p className="mt-3 text-xs text-slate-400">Pehle bolo: Hindi/Hinglish mein sunna hai ya English mein? Default desi hai, BC.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 text-left">
              <button onClick={() => { setLanguage('ENGLISH'); setStep('MANIFEST'); }} className="rounded-xl border border-slate-700 bg-black p-6 hover:border-red-500">
                <span className="block text-lg font-black text-white">ENGLISH</span>
                <span className="mt-2 block text-xs text-slate-400">English teaching, English roasting. Thoda less desi damage.</span>
              </button>
              <button onClick={() => { setLanguage('HINDI'); setStep('MANIFEST'); }} className="rounded-xl border border-slate-700 bg-black p-6 hover:border-red-500">
                <span className="block text-lg font-black text-white">HINDI / HINGLISH</span>
                <span className="mt-2 block text-xs text-slate-400">Seedha samjhenge. Galti hui toh Hindi mein sunoge, BC.</span>
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            RETURNING USER
            ===================================================== */}

        {step === 'RETURNING' &&
          savedProgress && (

            <div className="bg-slate-950 border-2 border-red-700 rounded-2xl p-6 md:p-10 shadow-[0_0_80px_rgba(220,38,38,0.2)] space-y-8">

              <div className="text-center space-y-4">

                <Skull className="w-16 h-16 text-red-600 mx-auto animate-pulse" />

                <h1 className="text-3xl md:text-4xl font-black text-red-500">
                  BSDK, TU WAPAS AA GAYA.
                </h1>

                <p className="text-sm text-slate-400">
                  Yaad hai tu kis challenge se phat ke bhaaga tha.
                </p>

              </div>

              <div className="p-6 bg-black border border-red-900/50 rounded-xl">

                <div className="text-[10px] text-red-500 font-black tracking-widest mb-4">
                  YOUR CRIMINAL RECORD
                </div>

                <div className="grid grid-cols-2 gap-6">

                  <div>
                    <div className="text-[9px] text-slate-600">
                      LAST LOCATION
                    </div>

                    <div className="text-sm text-white font-bold mt-1">
                      {savedProgress.currentLessonId}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-600">
                      XP
                    </div>

                    <div className="text-sm text-yellow-400 font-bold mt-1">
                      {savedProgress.xp}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-600">
                      FAILURES
                    </div>

                    <div className="text-sm text-red-400 font-bold mt-1">
                      {savedProgress.incidents.length}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-600">
                      STREAK
                    </div>

                    <div className="text-sm text-orange-400 font-bold mt-1">
                      🔥 {savedProgress.streak}
                    </div>
                  </div>

                </div>
              </div>

              <div className="space-y-3">

                <button
                  onClick={onResumeSession}
                  className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest transition-all shadow-lg"
                >
                  ☠ BC, WAHIN SE SHURU KAR →
                  <ArrowRight className="inline ml-2 w-4 h-4" />
                </button>

                <button
                  onClick={onResetSession}
                  className="w-full py-3 text-slate-600 hover:text-red-400 text-xs uppercase transition-all"
                >
                  <RotateCcw className="inline mr-2 w-3 h-3" />
                  SAB UDAA AUR ZERO SE SHURU KAR
                </button>

              </div>

            </div>
          )}

        {/* =====================================================
            MANIFEST
            ===================================================== */}

        {step === 'MANIFEST' && (

          <div className="bg-slate-950 border-2 border-red-700 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(220,38,38,0.25)] space-y-8">

            <div className="text-center space-y-5">

              <Skull className="w-20 h-20 text-red-600 mx-auto animate-bounce" />

              <h1 className="text-4xl md:text-5xl font-black text-red-500 tracking-wider">
                PYTHON
                <br />
                FROM HELL
              </h1>

              <p className="text-xs text-slate-500 uppercase tracking-[0.4em]">
                Learn Python. Get Destroyed. Get Good.
              </p>

            </div>

            <div className="border-y border-red-900/40 py-6 space-y-4 text-sm text-slate-300 leading-relaxed">

              <p className="text-red-500 font-black text-lg">
                {hindi ? 'BC, tune ek shandaar kharaab decision liya hai.' : 'You have made a terrible fucking decision.'}
              </p>

              <p>
                {hindi ? 'Yeh normal Python course nahi hai, bhai.' : 'This is not a normal Python course.'}
              </p>

              <p>
                {hindi ? 'Pehle concept seedha samjhayenge, phir tere code ki bakchodi pakdenge.' : "I will explain concepts to you like you're five years old."}
              </p>

              <p>
                {hindi ? 'Python terms English mein rahenge. Baki daant desi hogi.' : 'Then I will treat you like a developer who should know better.'}
              </p>

              <p>
                {hindi ? 'Teri galti pakdi jayegi. Weak concept ko ghasit ke wapas samjhayenge. Excuse ka yahan koi kaam nahi.' : 'Your mistakes will be identified. Your weak concepts will be hunted. Your excuses will be ignored.'}
              </p>

              <p className="text-yellow-500 font-bold">
                {hindi ? 'Ratta maarne nahi aaya, BC. Python sach mein samajhne aaya hai.' : 'You are not here to memorize Python. You are here to actually fucking understand it.'}
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              {[
                ['📖', 'LEARN', 'Concepts explained from absolute zero.'],
                ['🧠', 'UNDERSTAND', 'Every important term explained.'],
                ['💀', 'PROVE IT', 'Write actual code under pressure.'],
              ].map(([icon, title, text]) => (
                <div
                  key={title}
                  className="p-4 bg-black border border-slate-800 rounded-xl"
                >
                  <div className="text-xl">{icon}</div>
                  <div className="text-xs font-black text-white mt-2">
                    {title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {text}
                  </div>
                </div>
              ))}

            </div>

            <button
              onClick={() => setStep('ASSESSMENT')}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest transition-all"
            >
              I'M STUPID ENOUGH — ENTER HELL
              <ArrowRight className="inline ml-2 w-4 h-4" />
            </button>

          </div>
        )}

        {/* =====================================================
            INTENSITY
            ===================================================== */}

        {step === 'ASSESSMENT' && (

          <div className="bg-slate-950 border-2 border-red-700 rounded-2xl p-8 space-y-8">

            <div className="text-center">

              <Flame className="w-12 h-12 text-orange-500 mx-auto" />

              <h2 className="text-2xl font-black text-white mt-3">
                {hindi ? 'APNI TABAHI CHUN, BC' : 'CHOOSE YOUR PUNISHMENT'}
              </h2>

              <p className="text-xs text-slate-500 mt-2">
                {hindi ? 'Teacher ka mood choose kar. Pyaar-vyaar nahi milega.' : 'Pick the personality of the bastard teaching you.'}
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {[
                {
                  id: 'SAVAGE',
                  title: 'SAVAGE',
                  desc: 'Sarcastic. Brutal. Relentless.',
                },
                {
                  id: 'APOCALYPSE',
                  title: 'APOCALYPSE',
                  desc: 'Maximum destruction. Zero mercy.',
                },
                {
                  id: 'DESI_SENIOR',
                  title: 'DESI SENIOR',
                  desc: 'That senior who asks "ye bhi nahi aata?"',
                },
                {
                  id: 'ACADEMIC',
                  title: 'ACADEMIC',
                  desc: 'Cold disappointment from a professor.',
                },
              ].map((item) => (

                <button
                  key={item.id}
                  onClick={() =>
                    setIntensity(
                      item.id as RoastIntensity
                    )
                  }
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    intensity === item.id
                      ? 'bg-red-950 border-red-500'
                      : 'bg-black border-slate-800 hover:border-red-900'
                  }`}
                >

                  <div className="flex items-center gap-2">

                    <Zap className="w-4 h-4 text-red-500" />

                    <span className="text-sm font-black text-white">
                      {item.title}
                    </span>

                  </div>

                  <p className="text-[10px] text-slate-500 mt-2">
                    {item.desc}
                  </p>

                </button>

              ))}

            </div>

            <button
              onClick={() => setStep('DIAGNOSTIC')}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest"
            >
              FINE. TEST MY BRAIN →
            </button>

          </div>
        )}

        {/* =====================================================
            DIAGNOSTIC
            ===================================================== */}

        {step === 'DIAGNOSTIC' && (

          <div className="bg-slate-950 border-2 border-red-700 rounded-2xl p-8 space-y-7">

            <div className="flex justify-between">

              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-black text-red-500">
                  {hindi ? 'DIMAAG KI TALASHI' : 'KNOWLEDGE INTERROGATION'}
                </span>
              </div>

              <span className="text-[10px] text-slate-600">
                {diagIndex + 1} / {questions.length}
              </span>

            </div>

            <div className="h-1 bg-slate-900 rounded-full">

              <div
                className="h-full bg-red-600 transition-all"
                style={{
                  width: `${((diagIndex + 1) / questions.length) * 100}%`,
                }}
              />

            </div>

            <div className="p-6 bg-black border border-slate-800 rounded-xl">

              <p className="text-sm text-white font-bold leading-relaxed">
                {questions[diagIndex].question}
              </p>

              {questions[diagIndex].codeSnippet && (

                <pre className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded text-xs text-green-400">
                  {questions[diagIndex].codeSnippet}
                </pre>

              )}

            </div>

            <div className="space-y-3">

              {questions[diagIndex].options.map(
                (option: string, index: number) => (

                  <button
                    key={index}
                    onClick={() =>
                      handleAnswerDiagnostic(index)
                    }
                    className="w-full p-4 text-left bg-black hover:bg-red-950/40 border border-slate-800 hover:border-red-700 rounded-xl text-xs text-slate-300 transition-all"
                  >
                    <span className="text-red-500 font-black mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>

                    {option}
                  </button>

                )
              )}

            </div>

          </div>
        )}

        {/* =====================================================
            DIAGNOSTIC VERDICT
            ===================================================== */}

        {step === 'VERDICT' && (

          <div className="bg-slate-950 border-2 border-red-700 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(220,38,38,0.25)] space-y-8 text-center">

            <Skull className="w-16 h-16 text-red-600 mx-auto" />

            <div>

              <h2 className="text-3xl font-black text-red-500">
                {hindi ? 'BC, DIAGNOSTIC KHATAM' : 'DIAGNOSTIC COMPLETE'}
              </h2>

              <p className="text-xs text-slate-500 mt-3">
                You scored {finalScore}/{questions.length}.
              </p>

            </div>

            <div className="p-6 bg-black border border-red-900/50 rounded-xl text-left space-y-4">

              {finalScore === 0 && (
                <>
                  <p className="text-red-500 font-black">
                    HOLY SHIT.
                  </p>

                  <p className="text-xs text-slate-400">
                    We're starting from the beginning.
                    Do not worry. That's exactly what this system is built for.
                  </p>
                </>
              )}

              {finalScore > 0 &&
                finalScore < questions.length && (
                  <>
                    <p className="text-yellow-500 font-black">
                      YOU KNOW SOME SHIT.
                    </p>

                    <p className="text-xs text-slate-400">
                      Not enough to skip the fundamentals.
                      We're going to find the holes in your knowledge.
                    </p>
                  </>
                )}

              {finalScore === questions.length && (
                <>
                  <p className="text-emerald-500 font-black">
                    FUCK.
                  </p>

                  <p className="text-xs text-slate-400">
                    You actually know some Python.
                    Fine. We'll start you further ahead.
                  </p>
                </>
              )}

            </div>

            <button
              onClick={enterHell}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest"
            >
              BEGIN MY PUNISHMENT →
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
