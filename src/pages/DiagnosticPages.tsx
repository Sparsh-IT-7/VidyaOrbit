import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldAlert,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { QUESTION_BANK } from '../data/curriculumData';

export const DiagnosticAssessmentPage: React.FC = () => {
  const { recordAttempt, setRoute, updateStudent } = useLearning();

  const diagnosticQuestions = QUESTION_BANK.slice(0, 8);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timePerQuestion, setTimePerQuestion] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ = diagnosticQuestions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / diagnosticQuestions.length) * 100);

  const recordTimeForCurrent = () => {
    const deltaSec = Math.max(3, Math.round((Date.now() - questionStartTime) / 1000));
    setTimePerQuestion((prev) => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + deltaSec,
    }));
    setQuestionStartTime(Date.now());
  };

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));
  };

  const toggleMarkReview = () => {
    setMarkedForReview((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleNext = () => {
    recordTimeForCurrent();
    if (currentIndex < diagnosticQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    recordTimeForCurrent();
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleFinishDiagnostic = () => {
    recordTimeForCurrent();
    diagnosticQuestions.forEach((q) => {
      const chosen = selectedAnswers[q.id];
      if (chosen !== undefined) {
        recordAttempt({
          questionId: q.id,
          conceptId: q.conceptId,
          conceptName: q.conceptName,
          selectedOptionIndex: chosen,
          correctOptionIndex: q.correctAnswerIndex,
          isCorrect: chosen === q.correctAnswerIndex,
          difficulty: q.difficulty,
          timeTakenSeconds: timePerQuestion[q.id] || 18,
          hintsUsed: 0,
        });
      }
    });
    updateStudent({ diagnosticCompleted: true });
    setRoute('diagnostic-result');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-[#B59024]">
            Diagnostic Assessment
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
            C Programming Skill Check
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 tabular-nums">
            <Clock className="w-4 h-4 text-[#B59024]" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
          <button
            type="button"
            onClick={() => setRoute('diagnostic-result')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all whitespace-nowrap"
          >
            See Results →
          </button>
        </div>
      </div>

      {/* Question Progress Strip */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 tabular-nums">
            <span>
              Question {currentIndex + 1} of {diagnosticQuestions.length}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#B59024]">Topic: {currentQ.topic}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              Difficulty:{' '}
              <strong className="text-[#B59024] font-mono">{currentQ.difficulty}</strong>
            </span>
            <span className="font-mono text-slate-400 tabular-nums">{progressPercent}%</span>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#D4AF37] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Number Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {diagnosticQuestions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isMarked = markedForReview[q.id];
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  recordTimeForCurrent();
                  setCurrentIndex(idx);
                }}
                className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center relative ${
                  isCurrent
                    ? 'bg-slate-900 text-white ring-2 ring-[#D4AF37]'
                    : isAnswered
                    ? 'bg-[#D4AF37] text-slate-950'
                    : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                {idx + 1}
                {isMarked && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">
              Concept: <span className="text-slate-900 font-semibold">{currentQ.conceptName}</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          <button
            type="button"
            onClick={toggleMarkReview}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shrink-0 ${
              markedForReview[currentQ.id]
                ? 'bg-[#FBF7E8] border-[#D4AF37] text-[#B59024]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{markedForReview[currentQ.id] ? 'Marked' : 'Mark for Review'}</span>
          </button>
        </div>

        {currentQ.codeSnippet && (
          <div className="p-4 rounded-xl bg-slate-900">
            <div className="text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800 mb-3 flex justify-between">
              <span>main.c</span>
              <span>C Program</span>
            </div>
            <pre className="text-xs md:text-sm font-mono text-[#D4AF37] overflow-x-auto leading-relaxed">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Answer Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQ.id] === idx;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#FBF7E8] border-[#D4AF37]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#D4AF37] text-slate-950'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letter}
                </div>
                <span className="text-sm text-slate-900 font-mono">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < diagnosticQuestions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishDiagnostic}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] shadow-xs transition-all"
              >
                <span>Finish &amp; See My Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DiagnosticResultPage: React.FC = () => {
  const {
    conceptStates,
    overallMastery,
    thresholds,
    setRoute,
    setActiveConceptId,
  } = useLearning();

  const strongAreas = conceptStates.filter(
    (c) => c.rawClassification === 'Mastered' || c.mastery >= 70
  );
  const weakAreas = conceptStates.filter((c) => c.rawClassification === 'Weak');
  const knowledgeGaps = conceptStates.filter((c) => c.rawClassification === 'Knowledge Gap');
  const restrictedConcepts = conceptStates.filter((c) => c.isRestrictedByPrerequisite);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Overall Score Hero */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B59024]">
            <Sparkles className="w-4 h-4" />
            <span>Diagnostic Report Complete</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Your C Programming Knowledge Profile
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Instead of just one overall grade, VidyaOrbit checks your mastery on each individual
            concept and identifies which prerequisites need review first.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRoute('learning-path')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-slate-950 text-sm font-bold hover:bg-[#c59f2d] shadow-xs transition-all"
            >
              <span>View My Personalized Learning Path</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRoute('settings')}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Sliders className="w-3.5 h-3.5 text-[#B59024]" />
              <span>Adjust Mastery Thresholds</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center min-w-[210px] space-y-1.5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Overall Score</div>
          <div className="text-5xl font-extrabold text-[#B59024] font-mono tabular-nums">
            {overallMastery}%
          </div>
          <div className="text-xs text-slate-500">
            Across 9 C Programming Topics
          </div>
        </div>
      </section>

      {/* Concept Mastery Breakdown Bars */}
      <section className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Concept Mastery Breakdown</h2>
            <p className="text-xs text-slate-500">
              {thresholds.masteredMin}–100% Mastered · {thresholds.developingMin}–
              {thresholds.masteredMin - 1}% Developing · {thresholds.weakMin}–
              {thresholds.developingMin - 1}% Weak · Below {thresholds.weakMin}% Knowledge Gap
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conceptStates.map((c) => {
            const isMastered = c.rawClassification === 'Mastered';
            const isDeveloping = c.rawClassification === 'Developing';
            const isWeak = c.rawClassification === 'Weak';
            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConceptId(c.id);
                  setRoute('learning-content');
                }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D4AF37] cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{c.shortName}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-slate-400">{c.attemptsCount} tries</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-bold ${
                        isMastered
                          ? 'text-emerald-700'
                          : isDeveloping
                          ? 'text-slate-700'
                          : 'text-[#B59024]'
                      }`}
                    >
                      {c.mastery}% — {c.status}
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isMastered
                        ? 'bg-emerald-600'
                        : isDeveloping
                        ? 'bg-slate-500'
                        : isWeak
                        ? 'bg-[#D4AF37]'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${c.mastery}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">{c.reason}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Classification Buckets: Strong Areas, Weak Areas, Knowledge Gaps */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strong Areas */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Strong Areas</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500">
            Topics you understand well:
          </p>
          <div className="space-y-2">
            {strongAreas.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-900">{c.shortName}</span>
                <span className="font-mono font-bold text-emerald-700 tabular-nums">
                  {c.mastery}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Weak Areas</h3>
            <AlertTriangle className="w-5 h-5 text-[#B59024]" />
          </div>
          <p className="text-xs text-slate-500">
            Topics ({thresholds.weakMin}%–{thresholds.developingMin - 1}%) to review next:
          </p>
          <div className="space-y-2">
            {weakAreas.length > 0 ? (
              weakAreas.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/50 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{c.shortName}</span>
                    <span className="font-mono font-bold text-[#B59024] tabular-nums">
                      {c.mastery}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{c.reason}</p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500">
                No topics currently in Weak range.
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Gaps */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Knowledge Gaps</h3>
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs text-slate-500">
            Topics below {thresholds.weakMin}% mastery:
          </p>
          <div className="space-y-2">
            {knowledgeGaps.length > 0 ? (
              knowledgeGaps.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{c.shortName}</span>
                    <span className="font-mono font-bold text-amber-800 tabular-nums">
                      {c.mastery}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{c.reason}</p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500">
                No critical knowledge gaps below {thresholds.weakMin}%.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prerequisite Gap Explanation Banner */}
      <section className="p-6 md:p-8 rounded-2xl bg-[#FBF7E8] border border-[#D4AF37] space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#B59024]">
          <Lock className="w-4 h-4" />
          <span>Prerequisite Check</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Prerequisite Gap: Functions is required before Pointers
        </h3>

        <p className="text-sm text-slate-700 leading-relaxed">
          “Pointers is currently restricted because Functions is an important prerequisite and your
          Functions mastery is below the recommended level.”
        </p>

        {restrictedConcepts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {restrictedConcepts.map((rc) => (
              <div
                key={rc.id}
                className="p-4 rounded-xl bg-white border border-[#D4AF37]/40 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{rc.name}</span>
                  <span className="font-mono text-slate-500">
                    Needs {rc.blockingPrerequisiteName} ({rc.blockingPrerequisiteMastery}%)
                  </span>
                </div>
                <p className="text-xs text-slate-600">{rc.recommendedAction}</p>
              </div>
            ))}
          </div>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setRoute('learning-path')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-slate-950 text-sm font-bold hover:bg-[#c59f2d] transition-all"
          >
            <span>View My Personalized Learning Path</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
