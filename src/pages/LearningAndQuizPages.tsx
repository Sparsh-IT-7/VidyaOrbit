import React, { useState } from 'react';
import {
  Play,
  Lightbulb,
  CheckCircle2,
  Send,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { CONCEPT_LESSONS, QUESTION_BANK } from '../data/curriculumData';
import { evaluateAdaptiveDifficulty } from '../engine/deterministicEngine';
import { ConceptId, Difficulty, StudentLevel } from '../types/learning';
import { AudioTranscribeMicButton } from '../components/VoiceAndAudioControls';

export const LearningContentPage: React.FC = () => {
  const {
    conceptStates,
    activeConceptId,
    setActiveConceptId,
    student,
    updateStudent,
    setRoute,
    chatMessages,
    isAiTyping,
    sendTutorMessage,
    boostConceptMastery,
  } = useLearning();

  const currentConceptState =
    conceptStates.find((c) => c.id === activeConceptId) ||
    conceptStates.find((c) => c.id === 'functions')!;

  const lessonData = CONCEPT_LESSONS[currentConceptState.id] || CONCEPT_LESSONS.functions;
  const levelContent = lessonData.levels[student.level] || lessonData.levels.Beginner;

  const [codeOutputVisible, setCodeOutputVisible] = useState<boolean>(true);
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [assistantInput, setAssistantInput] = useState<string>('');

  const handleSelectConcept = (id: ConceptId) => {
    setActiveConceptId(id);
    setPracticeAnswer(null);
  };

  const handlePracticeCheck = (idx: number) => {
    setPracticeAnswer(idx);
    if (idx === levelContent.practicePrompt.correctIndex) {
      boostConceptMastery(
        currentConceptState.id,
        Math.min(100, currentConceptState.mastery + 4)
      );
    }
  };

  const handleQuickAiButton = (action: string, promptText: string) => {
    sendTutorMessage(promptText, action, currentConceptState.id);
  };

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    const text = assistantInput;
    setAssistantInput('');
    sendTutorMessage(text, undefined, currentConceptState.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-16">
      {/* LEFT COLUMN: Topic Navigation (3 cols) */}
      <aside className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200 space-y-5 lg:sticky lg:top-22 shadow-2xs">
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <div className="text-xs font-bold text-[#B59024]">Course Topics</div>
          <h2 className="text-base font-bold text-slate-900">C Programming</h2>
        </div>

        <div className="space-y-1.5">
          {conceptStates.map((c) => {
            const isActive = c.id === currentConceptState.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectConcept(c.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="truncate">
                  0{c.order}. {c.shortName}
                </span>
                <span
                  className={`font-mono tabular-nums ${
                    isActive ? 'text-[#B59024] font-bold' : 'text-slate-400'
                  }`}
                >
                  {c.mastery}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
            In This Lesson
          </div>
          <div className="space-y-1 text-slate-600">
            <a href="#sec-what" className="block py-1 hover:text-[#B59024]">
              1. What are {currentConceptState.shortName}?
            </a>
            <a href="#sec-why" className="block py-1 hover:text-[#B59024]">
              2. Why they are used
            </a>
            <a href="#sec-syntax" className="block py-1 hover:text-[#B59024]">
              3. C Syntax
            </a>
            <a href="#sec-example" className="block py-1 hover:text-[#B59024]">
              4. Code Example
            </a>
            <a href="#sec-mistakes" className="block py-1 hover:text-[#B59024]">
              5. Common Mistakes
            </a>
            <a href="#sec-practice" className="block py-1 hover:text-[#B59024]">
              6. Quick Practice
            </a>
          </div>
        </div>
      </aside>

      {/* CENTER COLUMN: Main Lesson (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        {/* Lesson Header & Level Adaptation Switcher */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#B59024] font-bold">
              Topic 0{currentConceptState.order} · Mastery: {currentConceptState.mastery}% (
              {currentConceptState.status})
            </div>

            {/* Student Level Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200">
              {(['Beginner', 'Intermediate', 'Advanced'] as StudentLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateStudent({ level: lvl })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    student.level === lvl
                      ? 'bg-[#D4AF37] text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {lessonData.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{lessonData.subtitle}</p>
          </div>

          {/* 4 Quick Action Buttons */}
          <div className="pt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleQuickAiButton(
                  'explain_simply',
                  `Explain ${currentConceptState.shortName} more simply for a ${student.level} student.`
                )
              }
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#D4AF37] text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all"
            >
              Explain More Simply
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickAiButton(
                  'give_example',
                  `Show me another practical C code example for ${currentConceptState.shortName}.`
                )
              }
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#D4AF37] text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all"
            >
              Show Example
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickAiButton(
                  'give_hint',
                  `Give me a conceptual hint to avoid ${currentConceptState.deficitLabel} in ${currentConceptState.shortName}.`
                )
              }
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#D4AF37] text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all"
            >
              Give Me a Hint
            </button>
            <button
              type="button"
              onClick={() => setRoute('adaptive-quiz')}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all"
            >
              Practice This Topic →
            </button>
          </div>
        </div>

        {/* Section 1 & 2: What & Why */}
        <div
          id="sec-what"
          className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-2xs"
        >
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              1. What are {currentConceptState.shortName}? ({student.level} Mode)
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{levelContent.whatIsIt}</p>
          </div>

          <div id="sec-why" className="pt-4 border-t border-slate-100 space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              2. Why {currentConceptState.shortName} Are Used
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{levelContent.whyUsed}</p>
          </div>
        </div>

        {/* Section 3: Syntax */}
        <div
          id="sec-syntax"
          className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs"
        >
          <h2 className="text-lg font-bold text-slate-900">3. Basic Syntax</h2>
          <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs md:text-sm text-[#D4AF37] overflow-x-auto leading-relaxed">
            <code>{levelContent.syntax}</code>
          </pre>
        </div>

        {/* Section 4: Worked Code Example & Walkthrough */}
        <div
          id="sec-example"
          className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              4. Example: {levelContent.codeExample.title}
            </h2>
            <button
              type="button"
              onClick={() => setCodeOutputVisible((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{codeOutputVisible ? 'Hide Output' : 'Run Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs md:text-sm text-slate-100 overflow-x-auto leading-relaxed">
            <code>{levelContent.codeExample.code}</code>
          </pre>

          {codeOutputVisible && (
            <div className="p-3.5 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/50 font-mono text-xs space-y-1">
              <div className="text-slate-500">Program Output:</div>
              <div className="text-slate-900 font-bold">{levelContent.codeExample.output}</div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-[#B59024]">How it works step-by-step:</div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {levelContent.codeExample.walkthrough.map((stepText, idx) => (
                <li key={stepText} className="flex items-start gap-2">
                  <span className="font-mono text-[#B59024] font-bold">0{idx + 1}.</span>
                  <span>{stepText}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 5: Common Mistakes */}
        <div
          id="sec-mistakes"
          className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs"
        >
          <h2 className="text-lg font-bold text-slate-900">5. Common Mistakes to Avoid</h2>
          {levelContent.commonMistakes.map((m) => (
            <div
              key={m.mistakeTitle}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="text-sm font-bold text-amber-800">{m.mistakeTitle}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-red-600">✕ Common Mistake</div>
                  <pre className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-red-300 overflow-x-auto">
                    <code>{m.badCode}</code>
                  </pre>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-emerald-700">✓ Correct Way</div>
                  <pre className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-[#D4AF37] overflow-x-auto">
                    <code>{m.fixedCode}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{m.explanation}</p>
            </div>
          ))}
        </div>

        {/* Section 6: Inline Concept Practice */}
        <div
          id="sec-practice"
          className="p-6 rounded-2xl bg-[#FBF7E8]/60 border border-[#D4AF37] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">6. Quick Check</h2>
            <span className="text-xs text-[#B59024] font-bold">+4% Mastery Boost</span>
          </div>

          <p className="text-sm text-slate-900 font-medium">{levelContent.practicePrompt.question}</p>

          {levelContent.practicePrompt.code && (
            <pre className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-[#D4AF37] overflow-x-auto">
              <code>{levelContent.practicePrompt.code}</code>
            </pre>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {levelContent.practicePrompt.options.map((opt, idx) => {
              const selected = practiceAnswer === idx;
              const isCorrect = idx === levelContent.practicePrompt.correctIndex;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handlePracticeCheck(idx)}
                  className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all ${
                    selected
                      ? isCorrect
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-[#D4AF37]'
                  }`}
                >
                  [{String.fromCharCode(65 + idx)}] {opt}
                </button>
              );
            })}
          </div>

          {practiceAnswer !== null && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">
                {practiceAnswer === levelContent.practicePrompt.correctIndex
                  ? '✓ Great job! Your topic mastery has been updated.'
                  : '✕ Let us review why:'}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {levelContent.practicePrompt.explanation}
              </p>
              <button
                type="button"
                onClick={() => setRoute('adaptive-quiz')}
                className="inline-flex items-center gap-1.5 text-[#B59024] hover:underline font-bold pt-1"
              >
                <span>Practice more in Adaptive Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Compact AI Study Helper (3 cols) */}
      <aside className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200 space-y-4 lg:sticky lg:top-22 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-slate-950 font-extrabold text-xs flex items-center justify-center">
              VO
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">AI Study Helper</div>
              <div className="text-[11px] text-[#B59024] font-medium">
                {currentConceptState.shortName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRoute('ai-assistant')}
            className="text-[11px] text-[#B59024] font-semibold hover:underline"
          >
            Full View
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Explain Simply', action: 'explain_simply', q: `Explain ${currentConceptState.shortName} simply.` },
            { label: 'Show Example', action: 'give_example', q: `Give me an example of ${currentConceptState.shortName}.` },
            { label: 'Give a Hint', action: 'give_hint', q: `Give me a hint for ${currentConceptState.shortName}.` },
            { label: 'Summarize', action: 'summarize', q: `Summarize ${currentConceptState.shortName} key points.` },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => handleQuickAiButton(b.action, b.q)}
              className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#D4AF37] hover:bg-[#FBF7E8] text-[11px] font-semibold text-slate-700 hover:text-slate-900 text-left transition-colors"
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Recent AI Response Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {chatMessages.slice(-3).map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                m.sender === 'ai'
                  ? 'bg-slate-50 border border-slate-200 text-slate-700'
                  : 'bg-[#FBF7E8] border border-[#D4AF37]/40 text-slate-900'
              }`}
            >
              <div className="text-[10px] font-bold text-[#B59024] mb-1">
                {m.sender === 'ai' ? 'VidyaOrbit AI' : student.name}
              </div>
              {m.text}
            </div>
          ))}
          {isAiTyping && (
            <div className="text-[11px] text-[#B59024] font-mono animate-pulse">
              Writing explanation...
            </div>
          )}
        </div>

        <form onSubmit={handleAssistantSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            value={assistantInput}
            onChange={(e) => setAssistantInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37] focus:bg-white"
          />
          <AudioTranscribeMicButton
            compact
            onTranscribed={(transcript) =>
              setAssistantInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
            }
          />
          <button
            type="submit"
            className="h-9 px-3 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </aside>
    </div>
  );
};

export const AdaptiveQuizPage: React.FC = () => {
  const {
    setActiveConceptId,
    adaptiveDifficulty,
    setAdaptiveDifficulty,
    recentQuizWindow,
    pushQuizWindowResult,
    recordAttempt,
    setRoute,
  } = useLearning();

  const [questionCursor, setQuestionCursor] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hintStage, setHintStage] = useState<number>(0);
  const [totalHintsUsedSession, setTotalHintsUsedSession] = useState<number>(0);
  const [lastSubmissionFeedback, setLastSubmissionFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    adaptationMessage: string;
    direction: 'up' | 'down' | 'same';
    recommendRevision: boolean;
  } | null>(null);

  const matchingDifficultyQuestions = QUESTION_BANK.filter(
    (q) => q.difficulty === adaptiveDifficulty
  );
  const pool =
    matchingDifficultyQuestions.length > 0 ? matchingDifficultyQuestions : QUESTION_BANK;
  const currentQuestion = pool[questionCursor % pool.length];

  const handleRevealHint = (stage: number) => {
    if (stage > hintStage) {
      setHintStage(stage);
      if (stage <= 3) {
        setTotalHintsUsedSession((c) => c + 1);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
    const updatedWindow = [...recentQuizWindow.slice(-4), isCorrect];
    pushQuizWindowResult(isCorrect);

    recordAttempt({
      questionId: currentQuestion.id,
      conceptId: currentQuestion.conceptId,
      conceptName: currentQuestion.conceptName,
      selectedOptionIndex: selectedOption,
      correctOptionIndex: currentQuestion.correctAnswerIndex,
      isCorrect,
      difficulty: adaptiveDifficulty,
      timeTakenSeconds: 28,
      hintsUsed: Math.min(3, hintStage),
    });

    const adaptation = evaluateAdaptiveDifficulty(updatedWindow, adaptiveDifficulty);
    if (adaptation.changed) {
      setAdaptiveDifficulty(adaptation.nextDifficulty);
    }

    setLastSubmissionFeedback({
      isCorrect,
      explanation: currentQuestion.explanation,
      adaptationMessage: `${isCorrect ? 'Correct!' : 'Incorrect.'} ${adaptation.explanation}`,
      direction: adaptation.direction,
      recommendRevision: adaptation.recommendRevision,
    });
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setHintStage(0);
    setLastSubmissionFeedback(null);
    setQuestionCursor((c) => c + 1);
  };

  const windowCorrectCount = recentQuizWindow.filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <section className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#B59024]">
            Adaptive Practice
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Adaptive Quiz &amp; Step-by-Step Hints
          </h1>
          <p className="text-xs text-slate-600">
            Question difficulty automatically adjusts based on your last 5 answers.
          </p>
        </div>

        {/* Difficulty Tier Indicator */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white border border-slate-200 shrink-0">
          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => {
            const active = adaptiveDifficulty === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setAdaptiveDifficulty(d)}
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#D4AF37] text-slate-950 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </section>

      {/* 5-Question Recent Performance Window Bar */}
      <section className="p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Last 5 Answers:</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((slotIdx) => {
              const val = recentQuizWindow[slotIdx];
              return (
                <span
                  key={slotIdx}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold ${
                    val === undefined
                      ? 'bg-slate-50 text-slate-400 border border-slate-200'
                      : val
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {val === undefined ? '—' : val ? '✓' : '✕'}
                </span>
              );
            })}
          </div>
          <span className="font-mono text-[#B59024] font-bold tabular-nums">
            ({windowCorrectCount}/{recentQuizWindow.length} Correct)
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 font-mono tabular-nums">
          <span>Hints Used: {Math.min(3, hintStage)}/3</span>
          <span>Total Session Hints: {totalHintsUsedSession}</span>
        </div>
      </section>

      {/* Main Question & Progressive Hints Card */}
      <section className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#B59024]">
              Topic: {currentQuestion.conceptName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">{currentQuestion.topic}</span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-700">
            Difficulty: {adaptiveDifficulty}
          </span>
        </div>

        <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
          {currentQuestion.question}
        </h2>

        {currentQuestion.codeSnippet && (
          <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs md:text-sm text-[#D4AF37] overflow-x-auto leading-relaxed">
            <code>{currentQuestion.codeSnippet}</code>
          </pre>
        )}

        {/* Progressive Hint System */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Lightbulb className="w-4 h-4 text-[#B59024]" />
              <span>Need a hand? Reveal step-by-step hints:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleRevealHint(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  hintStage >= 1
                    ? 'bg-[#D4AF37] text-slate-950 font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#D4AF37]'
                }`}
              >
                Hint 1
              </button>
              <button
                type="button"
                onClick={() => handleRevealHint(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  hintStage >= 2
                    ? 'bg-[#D4AF37] text-slate-950 font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#D4AF37]'
                }`}
              >
                Hint 2
              </button>
              <button
                type="button"
                onClick={() => handleRevealHint(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  hintStage >= 3
                    ? 'bg-[#D4AF37] text-slate-950 font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#D4AF37]'
                }`}
              >
                Hint 3
              </button>
              <button
                type="button"
                onClick={() => handleRevealHint(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  hintStage >= 4
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                Show Explanation
              </button>
            </div>
          </div>

          {hintStage > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
              {hintStage >= 1 && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                  <strong className="text-[#B59024]">Hint 1 (Concept Clue):</strong>{' '}
                  {currentQuestion.hints.hint1}
                </div>
              )}
              {hintStage >= 2 && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                  <strong className="text-[#B59024]">Hint 2 (How to Approach):</strong>{' '}
                  {currentQuestion.hints.hint2}
                </div>
              )}
              {hintStage >= 3 && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                  <strong className="text-[#B59024]">Hint 3 (Almost There):</strong>{' '}
                  {currentQuestion.hints.hint3}
                </div>
              )}
              {hintStage >= 4 && (
                <div className="p-3 rounded-lg bg-[#FBF7E8] border border-[#D4AF37] text-slate-900">
                  <strong className="text-[#B59024]">Full Explanation &amp; Answer:</strong>{' '}
                  {currentQuestion.explanation} (Correct Option:{' '}
                  <strong>
                    [{String.fromCharCode(65 + currentQuestion.correctAnswerIndex)}]{' '}
                    {currentQuestion.options[currentQuestion.correctAnswerIndex]}
                  </strong>
                  )
                </div>
              )}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedOption(idx)}
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
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm text-slate-900 font-mono">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Post-Response Adaptation Explanation Box */}
        {lastSubmissionFeedback && (
          <div
            className={`p-5 rounded-xl border space-y-2.5 ${
              lastSubmissionFeedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-amber-50 border-amber-300'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              {lastSubmissionFeedback.direction === 'up' && (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              )}
              {lastSubmissionFeedback.direction === 'down' && (
                <TrendingDown className="w-4 h-4 text-amber-600" />
              )}
              {lastSubmissionFeedback.direction === 'same' && (
                <Minus className="w-4 h-4 text-[#B59024]" />
              )}
              <span>{lastSubmissionFeedback.adaptationMessage}</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Why:</strong> {lastSubmissionFeedback.explanation}
            </p>

            {lastSubmissionFeedback.recommendRevision && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveConceptId(currentQuestion.conceptId);
                    setRoute('learning-content');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"
                >
                  Review {currentQuestion.conceptName} Lesson →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setActiveConceptId(currentQuestion.conceptId);
              setRoute('learning-content');
            }}
            className="text-xs text-[#B59024] hover:underline font-bold"
          >
            ← Open {currentQuestion.conceptName} Lesson
          </button>

          <div className="flex items-center gap-3">
            {!lastSubmissionFeedback ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-6 py-3 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <span>Submit Answer</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
