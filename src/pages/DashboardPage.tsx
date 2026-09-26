import React, { useState } from 'react';
import {
  ArrowRight,
  Terminal,
  Check,
  Lock,
  AlertTriangle,
  Play,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Code2,
  Send,
  Timer,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ImagePlus,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { BrandLogo, CUSTOM_LOGO_STORAGE_KEY, UserAvatar } from '../components/AppShell';
import { QUESTION_BANK } from '../data/curriculumData';
import { ConceptId } from '../types/learning';
import {
  AudioTranscribeMicButton,
  LiveVoiceCoachPanel,
} from '../components/VoiceAndAudioControls';
import {
  CMemorySandboxModal,
  TeacherCohortModal,
} from '../components/InteractiveModals';

export const DashboardPage: React.FC = () => {
  const {
    student,
    activeSubject,
    conceptStates,
    overallMastery,
    recommendedNextStep,
    setRoute,
    setActiveConceptId,
    recordAttempt,
    chatMessages,
    isAiTyping,
    sendTutorMessage,
    answerRapidCheck,
    clearChatContext,
    thresholds,
  } = useLearning();

  const dashboardQuestions = QUESTION_BANK.filter(
    (q) => q.conceptId === 'functions' || q.conceptId === 'pointers' || q.conceptId === 'loops'
  );
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number>(1);
  const [submittedFeedback, setSubmittedFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);

  const [tutorInput, setTutorInput] = useState<string>('');
  const [sandboxOpen, setSandboxOpen] = useState<boolean>(false);
  const [cohortOpen, setCohortOpen] = useState<boolean>(false);
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const handleDashboardLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        try {
          localStorage.setItem(CUSTOM_LOGO_STORAGE_KEY, reader.result);
          window.dispatchEvent(new Event('vidyaorbit-logo-change'));
          setHasCustomLogo(true);
        } catch {
          // ignore storage quota errors
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetDashboardLogo = () => {
    try {
      localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
      window.dispatchEvent(new Event('vidyaorbit-logo-change'));
      setHasCustomLogo(false);
    } catch {
      // ignore storage errors
    }
  };

  const currentQuestion = dashboardQuestions[quizIndex % dashboardQuestions.length];

  const handleSelectConcept = (
    conceptId: ConceptId,
    targetRoute: 'learning-content' | 'knowledge-map' = 'learning-content'
  ) => {
    setActiveConceptId(conceptId);
    setRoute(targetRoute);
  };

  const handleQuizSubmit = () => {
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
    recordAttempt({
      questionId: currentQuestion.id,
      conceptId: currentQuestion.conceptId,
      conceptName: currentQuestion.conceptName,
      selectedOptionIndex: selectedOption,
      correctOptionIndex: currentQuestion.correctAnswerIndex,
      isCorrect,
      difficulty: currentQuestion.difficulty,
      timeTakenSeconds: 32,
      hintsUsed: 0,
    });
    setSubmittedFeedback({
      isCorrect,
      explanation: currentQuestion.explanation,
    });
  };

  const handleNextDashboardQuestion = () => {
    setSubmittedFeedback(null);
    setQuizIndex((prev) => (prev + 1) % dashboardQuestions.length);
    setSelectedOption(0);
  };

  const handleSendTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim()) return;
    const msg = tutorInput;
    setTutorInput('');
    await sendTutorMessage(msg);
  };

  const variablesState = conceptStates.find((c) => c.id === 'variables')!;
  const loopsState = conceptStates.find((c) => c.id === 'loops')!;
  const functionsState = conceptStates.find((c) => c.id === 'functions')!;
  const pointersState = conceptStates.find((c) => c.id === 'pointers')!;

  const masteredCount = conceptStates.filter((c) => c.rawClassification === 'Mastered').length;

  // SVG Ring calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMastery / 100) * circumference;

  return (
    <div className="flex flex-col w-full pb-16 space-y-8">
      {/* 1. CLEAN BEGINNER-FRIENDLY WELCOME BANNER WITH VIDYAORBIT LOGO */}
      <section className="rounded-2xl bg-slate-50 border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
        {/* Dashboard Brand Identity Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium border-l border-slate-200 pl-3">
              Student Learning Dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#D4AF37] text-xs font-semibold text-slate-700 transition-colors">
              <ImagePlus className="w-3.5 h-3.5 text-[#B59024]" />
              <span>{hasCustomLogo ? 'Change Logo Image' : 'Upload Official Logo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleDashboardLogoUpload}
                className="hidden"
              />
            </label>
            {hasCustomLogo && (
              <button
                type="button"
                onClick={handleResetDashboardLogo}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-600 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF7E8] border border-[#D4AF37]/40 text-xs font-bold text-[#B59024]">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>
                  {activeSubject.code} · {activeSubject.name} (Year {activeSubject.year}, Sem{' '}
                  {activeSubject.semester})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRoute('subjects')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#D4AF37] transition-colors"
              >
                Switch Subject / View Syllabus →
              </button>
            </div>

            <h1 className="text-2xl md:text-4xl text-slate-900 font-extrabold tracking-tight">
              Welcome back, {student.name} 👋
            </h1>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Your overall mastery is{' '}
              <span className="text-slate-900 font-bold tabular-nums">{overallMastery}%</span>. You
              are just{' '}
              <span className="text-[#B59024] font-bold">
                {Math.max(0, thresholds.developingMin - functionsState.mastery)}% away in{' '}
                {functionsState.shortName}
              </span>{' '}
              from unlocking <span className="text-slate-900 font-semibold">Pointers</span>.
            </p>

            {/* Primary CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSelectConcept(recommendedNextStep.id, 'learning-content')}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-slate-950 text-sm font-bold hover:bg-[#c59f2d] shadow-xs transition-all whitespace-nowrap"
              >
                <span>Start Learning: Revise {recommendedNextStep.shortName}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setRoute('diagnostic')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-all whitespace-nowrap"
              >
                <Terminal className="w-4 h-4 text-[#B59024]" />
                <span>Take Diagnostic Test</span>
              </button>
            </div>
          </div>

          {/* Circular SVG Progress Ring */}
          <div className="vo-card-hover flex items-center gap-5 self-start lg:self-center p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r={radius}
                  stroke="#F1F5F9"
                  strokeWidth="10"
                />
                <circle
                  className="transition-all duration-700 ease-out"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r={radius}
                  stroke="#D4AF37"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="10"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900 leading-none tracking-tight tabular-nums">
                  {overallMastery}
                  <span className="text-[#B59024] text-base">%</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">
                  Mastery
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-1 pr-2">
              <div className="text-sm font-bold text-slate-900">Your Progress</div>
              <div className="text-xs text-slate-600 tabular-nums">
                {masteredCount} of {conceptStates.length} Topics Mastered
              </div>
              <div className="text-xs text-[#B59024] font-semibold pt-0.5">
                Next Unlock: Pointers ({pointersState.mastery}%)
              </div>
              <button
                type="button"
                onClick={() => setRoute('diagnostic-result')}
                className="text-xs text-slate-700 hover:text-[#B59024] font-semibold text-left underline underline-offset-2 pt-0.5"
              >
                View Full Report →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE CORE QUESTIONS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: What do I know? */}
        <div className="vo-card-hover p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>1. What Do I Know?</span>
              <span className="font-semibold text-[#B59024]">Your Knowledge</span>
            </div>
            <div className="text-base font-bold text-slate-900">Topic Mastery</div>
          </div>

          <div className="space-y-2.5">
            {[variablesState, loopsState, functionsState, pointersState].map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{c.shortName}</span>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      c.mastery >= thresholds.developingMin ? 'text-emerald-700' : 'text-[#B59024]'
                    }`}
                  >
                    {c.mastery}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      c.mastery >= thresholds.developingMin ? 'bg-emerald-600' : 'bg-[#D4AF37]'
                    }`}
                    style={{ width: `${c.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRoute('knowledge-map')}
            className="text-xs text-[#B59024] hover:underline font-bold flex items-center gap-1"
          >
            <span>See All 9 Topics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: What am I weak at? */}
        <div className="vo-card-hover p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>2. What Am I Weak At?</span>
              <AlertTriangle className="w-4 h-4 text-[#B59024]" />
            </div>
            <div className="text-base font-bold text-slate-900">
              Knowledge Gap: {pointersState.shortName}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Mastery:</span>
              <span className="font-mono font-bold text-[#B59024] tabular-nums">
                {pointersState.mastery}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Required First:</span>
              <span className="font-semibold text-slate-900">{functionsState.shortName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Functions Score:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {functionsState.mastery}% (Needs {thresholds.developingMin}%)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {pointersState.isRestrictedByPrerequisite
              ? 'Pointers is locked until your Functions score reaches 60%.'
              : `Functions is at ${functionsState.mastery}%, so Pointers is now unlocked!`}
          </p>
        </div>

        {/* Card 3: What should I learn next & Why? */}
        <div className="vo-card-hover p-5 rounded-2xl bg-[#FBF7E8]/70 border border-[#D4AF37] flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#B59024] font-bold">
              <span>3 &amp; 4. What To Learn Next</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-slate-900">
              Revise {recommendedNextStep.shortName}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/40 space-y-1">
            <div className="text-[11px] font-bold text-[#B59024]">Why this is recommended:</div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Your {recommendedNextStep.shortName} mastery is currently{' '}
              <span className="font-mono font-bold text-slate-900">
                {recommendedNextStep.mastery}%
              </span>
              , and it is needed before moving on to{' '}
              {recommendedNextStep.dependents.includes('pointers') ? 'Pointers' : 'the next topic'}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSelectConcept(recommendedNextStep.id, 'learning-content')}
            className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Lesson</span>
          </button>
        </div>

        {/* Card 4: Am I improving? */}
        <div className="vo-card-hover p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>5. Am I Improving?</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-base font-bold text-slate-900">Recent Improvement</div>
          </div>

          <div className="space-y-2.5">
            {[functionsState, pointersState, variablesState].map((item) => {
              const delta = item.mastery - item.previousMastery;
              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.shortName}</div>
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {item.previousMastery}% →{' '}
                      <span className="text-slate-900 font-bold">{item.mastery}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 tabular-nums">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{delta >= 0 ? `+${delta}%` : `${delta}%`}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setRoute('progress')}
            className="text-xs text-[#B59024] hover:underline font-bold flex items-center gap-1"
          >
            <span>View Detailed Progress</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. VISUAL ROADMAP SECTION */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#B59024] font-bold">
              Step-by-Step Topic Map
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Your C Programming Learning Path
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setRoute('knowledge-map')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all whitespace-nowrap self-start sm:self-auto"
          >
            Open Full Knowledge Map
          </button>
        </div>

        {/* Node Track */}
        <div className="overflow-x-auto pb-2 pt-2">
          <div className="min-w-[820px] flex items-center justify-between relative px-6 py-4">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-5 h-1 bg-slate-200 z-0" />
            <div
              className="absolute left-10 top-1/2 -translate-y-5 h-1 bg-[#D4AF37] z-0 transition-all duration-500"
              style={{ width: '54%' }}
            />

            {conceptStates
              .filter((c) =>
                [
                  'variables',
                  'operators',
                  'conditions',
                  'loops',
                  'functions',
                  'pointers',
                  'structures',
                ].includes(c.id)
              )
              .map((node) => {
                const isMastered = node.rawClassification === 'Mastered' || node.mastery >= 70;
                const isRecommended = node.id === recommendedNextStep.id;
                const isLocked = node.status === 'Locked' || node.isRestrictedByPrerequisite;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => handleSelectConcept(node.id, 'knowledge-map')}
                    className="relative z-10 flex flex-col items-center text-center group focus:outline-none"
                  >
                    {isRecommended ? (
                      <div className="w-11 h-11 rounded-full bg-[#D4AF37] p-1 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37]" />
                        </div>
                      </div>
                    ) : isLocked ? (
                      <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : isMastered ? (
                      <div className="w-11 h-11 rounded-full bg-[#D4AF37] text-slate-950 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#FBF7E8] border-2 border-[#D4AF37] text-[#B59024] flex items-center justify-center transition-transform group-hover:scale-105">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}

                    <span className="mt-2.5 text-xs text-slate-900 font-bold max-w-[115px] whitespace-nowrap">
                      {node.shortName}
                    </span>
                    <span
                      className={`mt-0.5 text-[11px] font-mono font-semibold tabular-nums ${
                        isRecommended
                          ? 'text-[#B59024]'
                          : isLocked
                          ? 'text-slate-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {isLocked ? `Locked (${node.mastery}%)` : `${node.mastery}%`}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* 4. TOPIC BREAKDOWN & QUICK PRACTICE (2-COL GRID) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Topic Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="vo-card-hover-subtle p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#B59024] font-bold">
                  Skill Breakdown
                </div>
                <h3 className="text-lg text-slate-900 font-bold mt-0.5">
                  Your Topic Scores
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRoute('diagnostic-result')}
                className="text-xs text-[#B59024] hover:underline font-bold"
              >
                Full Report →
              </button>
            </div>

            <div className="space-y-3.5">
              {conceptStates.slice(0, 8).map((c) => {
                const isStrong = c.rawClassification === 'Mastered';
                const isWeakOrGap =
                  c.rawClassification === 'Weak' || c.rawClassification === 'Knowledge Gap';

                if (isWeakOrGap) {
                  return (
                    <div
                      key={c.id}
                      className="vo-card-hover-subtle space-y-2 p-3.5 rounded-xl bg-[#FBF7E8]/60 border border-[#D4AF37]/50"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                          <span className="text-slate-900 font-bold">{c.name}</span>
                        </div>
                        <span className="text-[#B59024] font-mono font-bold">
                          {c.mastery}% · {c.status}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white overflow-hidden">
                        <div
                          className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                          style={{ width: `${c.mastery}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-600">
                        <span>Focus area: {c.deficitLabel}</span>
                        <button
                          type="button"
                          onClick={() => handleSelectConcept(c.id, 'learning-content')}
                          className="text-[#B59024] font-bold hover:underline"
                        >
                          Study Lesson →
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-800 font-medium">{c.name}</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          isStrong ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {c.mastery}% ({c.status})
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isStrong ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                        style={{ width: `${c.mastery}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Practice Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="vo-card-hover-subtle p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-[#B59024] font-bold">
                  Quick Practice
                </span>
                <div className="text-base text-slate-900 font-bold mt-0.5">
                  {currentQuestion.conceptName}: {currentQuestion.topic}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#FBF7E8] text-[#B59024] font-mono text-xs font-bold">
                {currentQuestion.difficulty}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="tabular-nums">
                Question {(quizIndex % dashboardQuestions.length) + 1} of {dashboardQuestions.length}
              </span>
              <button
                type="button"
                onClick={() => setRoute('adaptive-quiz')}
                className="text-[#B59024] hover:underline font-bold"
              >
                Open Quiz with Hints →
              </button>
            </div>

            {/* Question Prompt & Code Snippet */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-sm text-slate-900 font-medium leading-relaxed">
                {currentQuestion.question}
              </p>
              {currentQuestion.codeSnippet && (
                <pre className="p-3 rounded-lg bg-slate-900 text-xs font-mono text-[#D4AF37] overflow-x-auto leading-relaxed">
                  <code>{currentQuestion.codeSnippet}</code>
                </pre>
              )}
            </div>

            {/* Radio Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedOption(idx);
                      setSubmittedFeedback(null);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-[#FBF7E8] border-[#D4AF37]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#D4AF37] text-slate-950'
                          : 'bg-slate-100 text-transparent'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    <span className="text-xs text-slate-900 font-mono leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {submittedFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  submittedFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>
                    {submittedFeedback.isCorrect
                      ? '✓ Correct! Your mastery score was updated.'
                      : '✕ Not quite. Here is why:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextDashboardQuestion}
                    className="underline font-bold text-[#B59024]"
                  >
                    Next Question →
                  </button>
                </div>
                <p className="leading-relaxed text-slate-700">{submittedFeedback.explanation}</p>
              </div>
            )}

            {/* Quiz Footer */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {dashboardQuestions.slice(0, 5).map((q, i) => (
                  <span
                    key={q.id}
                    className={`w-2 h-2 rounded-full ${
                      i === quizIndex % 5
                        ? 'bg-[#D4AF37]'
                        : i < quizIndex % 5
                        ? 'bg-slate-400'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleQuizSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Check Answer</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VIDYAORBIT AI TUTOR PANEL */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-2xs p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center font-extrabold text-base">
              VO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  VidyaOrbit AI Tutor
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FBF7E8] text-xs text-[#B59024] font-bold">
                  Helping with {recommendedNextStep.shortName} ({recommendedNextStep.mastery}%)
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Ask for simple explanations, C code examples, or hints
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSandboxOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/40 text-slate-900 text-xs font-semibold hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Code2 className="w-3.5 h-3.5 text-[#B59024]" />
              <span>Visual Memory Step-Through</span>
            </button>
            <button
              type="button"
              onClick={() => setCohortOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Class View
            </button>
            <button
              type="button"
              onClick={clearChatContext}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:text-slate-900 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Voice Conversation Panel (gemini-3.8-live) */}
        <LiveVoiceCoachPanel
          studentName={student.name}
          studentLevel={student.level}
          conceptName={recommendedNextStep.shortName}
          conceptMastery={recommendedNextStep.mastery}
        />

        {/* Quick Pedagogical Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              label: 'Explain Simply',
              action: 'explain_simply',
              prompt: `Explain ${recommendedNextStep.shortName} in simple terms for a ${student.level} student.`,
            },
            {
              label: 'Give Example',
              action: 'give_example',
              prompt: `Show me a clear C code example for ${recommendedNextStep.shortName}.`,
            },
            {
              label: 'Give Me a Hint',
              action: 'give_hint',
              prompt: `Give me a conceptual hint on ${recommendedNextStep.shortName} without revealing the final answer.`,
            },
            {
              label: 'Explain My Mistake',
              action: 'explain_mistake',
              prompt: `Explain why pass-by-value vs pass-by-reference causes mistakes in ${recommendedNextStep.shortName}.`,
            },
            {
              label: 'What is recursion?',
              action: 'explain_simply',
              prompt: 'What is recursion and how do base cases work in C?',
            },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => sendTutorMessage(btn.prompt, btn.action)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#D4AF37] hover:bg-[#FBF7E8] text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Chat Stream Container */}
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
          {chatMessages.map((msg) =>
            msg.sender === 'ai' ? (
              <div key={msg.id} className="flex items-start gap-3 max-w-3xl">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37] shrink-0 flex items-center justify-center text-slate-950 text-xs font-extrabold">
                  VO
                </div>
                <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 text-slate-800 space-y-3 w-full">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-[#B59024]">VidyaOrbit AI Tutor</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {msg.text}
                  </div>

                  {msg.rapidCheck && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5">
                      <div className="text-xs text-[#B59024] font-bold">Quick Check</div>
                      <div className="text-xs text-slate-900 font-medium leading-relaxed">
                        {msg.rapidCheck.question}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {msg.rapidCheck.options.map((opt, idx) => {
                          const chosen = msg.rapidCheck?.selectedIndex === idx;
                          const isRight = idx === msg.rapidCheck?.correctIndex;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => answerRapidCheck(msg.id, idx)}
                              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors ${
                                chosen
                                  ? isRight
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-red-600 text-white'
                                  : 'bg-slate-100 text-slate-800 hover:bg-[#FBF7E8]'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {msg.rapidCheck.selectedIndex !== undefined && (
                        <div className="text-xs text-slate-700 pt-1 font-medium">
                          {msg.rapidCheck.selectedIndex === msg.rapidCheck.correctIndex
                            ? '✓ Correct! Because C passes by value, x in main() stays 8 unless you assign x = triple(x);'
                            : 'Not quite — C passes arguments by value, so x in main() stays 8 unless reassigned.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className="flex items-start gap-3 max-w-2xl ml-auto flex-row-reverse"
              >
                <UserAvatar name={student.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                <div className="p-3.5 rounded-2xl rounded-tr-xs bg-[#FBF7E8] border border-[#D4AF37]/40 text-slate-900 text-sm">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 gap-4">
                    <span className="font-bold text-slate-900">{student.name}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-snug">{msg.text}</p>
                </div>
              </div>
            )
          )}
          {isAiTyping && (
            <div className="text-xs text-[#B59024] font-mono animate-pulse pl-11">
              VidyaOrbit AI Tutor is preparing a response...
            </div>
          )}
        </div>

        {/* Chat Prompt Input Box with Audio Transcription (gemini-3.5-transcribe) */}
        <form onSubmit={handleSendTutor} className="pt-1">
          <div className="flex items-center gap-2 p-2 pl-4 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-[#D4AF37] focus-within:bg-white">
            <input
              type="text"
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              placeholder={`Ask VidyaOrbit AI about ${recommendedNextStep.shortName}, or use voice input...`}
              className="flex-1 bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400 text-xs"
            />
            <AudioTranscribeMicButton
              onTranscribed={(transcript) =>
                setTutorInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
              }
            />
            <button
              type="submit"
              disabled={isAiTyping}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </section>

      <CMemorySandboxModal isOpen={sandboxOpen} onClose={() => setSandboxOpen(false)} />
      <TeacherCohortModal isOpen={cohortOpen} onClose={() => setCohortOpen(false)} />
    </div>
  );
};
