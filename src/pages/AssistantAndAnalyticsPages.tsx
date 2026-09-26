import React, { useState } from 'react';
import {
  Send,
  RotateCcw,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { UserAvatar } from '../components/AppShell';
import { ConceptId, StudentLevel } from '../types/learning';
import { DEFAULT_THRESHOLDS } from '../engine/deterministicEngine';
import {
  AudioTranscribeMicButton,
  LiveVoiceCoachPanel,
} from '../components/VoiceAndAudioControls';

export const AiAssistantPage: React.FC = () => {
  const {
    student,
    conceptStates,
    activeConceptId,
    setActiveConceptId,
    chatMessages,
    isAiTyping,
    sendTutorMessage,
    answerRapidCheck,
    clearChatContext,
  } = useLearning();

  const [promptInput, setPromptInput] = useState<string>('');

  const activeConcept =
    conceptStates.find((c) => c.id === activeConceptId) ||
    conceptStates.find((c) => c.id === 'functions')!;

  const weakConcepts = conceptStates.filter(
    (c) => c.rawClassification === 'Weak' || c.rawClassification === 'Knowledge Gap'
  );

  const quickActions = [
    {
      label: 'Explain Simply',
      action: 'explain_simply',
      prompt: `Explain ${activeConcept.shortName} simply for a ${student.level} student.`,
    },
    {
      label: 'Give Example',
      action: 'give_example',
      prompt: `Provide a step-by-step C code example for ${activeConcept.shortName}.`,
    },
    {
      label: 'Give Me a Hint',
      action: 'give_hint',
      prompt: `Give me a progressive conceptual hint for ${activeConcept.shortName}.`,
    },
    {
      label: 'Explain My Mistake',
      action: 'explain_mistake',
      prompt: `Explain my recent mistake pattern (${activeConcept.deficitLabel}) in ${activeConcept.shortName}.`,
    },
    {
      label: 'Summarize This',
      action: 'summarize',
      prompt: `Summarize the most important rules of ${activeConcept.shortName} in C.`,
    },
    {
      label: 'Practice Question',
      action: 'practice_question',
      prompt: `Give me a targeted practice question on ${activeConcept.shortName}.`,
    },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const msg = promptInput;
    setPromptInput('');
    await sendTutorMessage(msg, undefined, activeConcept.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-16">
      {/* Left Context Inspector Panel (4 cols) */}
      <aside className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200 space-y-5 lg:sticky lg:top-22 shadow-2xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center font-extrabold text-base">
            VO
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Your Study Profile</h1>
            <p className="text-xs text-[#B59024] font-medium">Shared with VidyaOrbit AI Tutor</p>
          </div>
        </div>

        {/* Concept Context Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Current Topic Focus
          </label>
          <select
            value={activeConcept.id}
            onChange={(e) => setActiveConceptId(e.target.value as ConceptId)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-[#D4AF37]"
          >
            {conceptStates.map((c) => (
              <option key={c.id} value={c.id}>
                0{c.order}. {c.shortName} — {c.mastery}% ({c.status})
              </option>
            ))}
          </select>
        </div>

        {/* Live Context Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Student Level:</span>
            <span className="font-semibold text-slate-900">{student.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Subject:</span>
            <span className="font-semibold text-slate-900">{student.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Topic Mastery:</span>
            <span className="font-mono font-bold text-[#B59024] tabular-nums">
              {activeConcept.mastery}% ({activeConcept.status})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Prerequisites:</span>
            <span className="text-slate-900 font-medium">
              {activeConcept.prerequisites.length > 0
                ? activeConcept.prerequisites
                    .map((p) => conceptStates.find((c) => c.id === p)?.shortName)
                    .join(', ')
                : 'None'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <div className="text-slate-500">Area to Improve:</div>
            <div className="text-amber-800 font-medium">{activeConcept.deficitLabel}</div>
          </div>
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <div className="text-slate-500">Weak Topics:</div>
            <div className="text-slate-900 font-medium">
              {weakConcepts.map((w) => `${w.shortName} (${w.mastery}%)`).join(', ') || 'None'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/40 text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900">How AI Helps:</strong> The AI Tutor uses your mastery
          profile to give simple explanations and hints, while the platform engine handles all
          grading and topic unlocks.
        </div>
      </aside>

      {/* Right Main Chat Interface (8 cols) */}
      <div className="lg:col-span-8 p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-[#B59024]">
              Personalized AI Learning Assistant
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              VidyaOrbit AI Tutor — {activeConcept.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={clearChatContext}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Real-Time Voice Conversation Panel (gemini-3.8-live) */}
        <LiveVoiceCoachPanel
          studentName={student.name}
          studentLevel={student.level}
          conceptName={activeConcept.shortName}
          conceptMastery={activeConcept.mastery}
        />

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500">
            Quick questions for {activeConcept.shortName}:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={() => sendTutorMessage(qa.prompt, qa.action, activeConcept.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D4AF37] hover:bg-[#FBF7E8] text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all"
              >
                {qa.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                sendTutorMessage(
                  'What is recursion and how does the base case prevent stack overflow?',
                  'explain_simply',
                  'functions'
                )
              }
              className="px-3.5 py-2 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/50 text-xs font-bold text-[#B59024] hover:bg-[#D4AF37]/20 transition-all"
            >
              Ask: “What is recursion?”
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {chatMessages.map((msg) =>
            msg.sender === 'ai' ? (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37] shrink-0 flex items-center justify-center text-slate-950 text-xs font-extrabold">
                  VO
                </div>
                <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 text-slate-800 space-y-3 w-full">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-[#B59024]">
                      VidyaOrbit AI Tutor {msg.actionTag ? `· ${msg.actionTag}` : ''}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {msg.text}
                  </div>
                  {msg.rapidCheck && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-[#B59024]">
                        Quick Check
                      </div>
                      <p className="text-xs text-slate-900">{msg.rapidCheck.question}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.rapidCheck.options.map((opt, idx) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => answerRapidCheck(msg.id, idx)}
                            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold ${
                              msg.rapidCheck?.selectedIndex === idx
                                ? idx === msg.rapidCheck.correctIndex
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-800 hover:bg-[#FBF7E8]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className="flex items-start gap-3 max-w-xl ml-auto flex-row-reverse"
              >
                <UserAvatar name={student.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                <div className="p-4 rounded-2xl rounded-tr-xs bg-[#FBF7E8] border border-[#D4AF37]/40 text-slate-900 text-sm">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 gap-4">
                    <span className="font-bold text-slate-900">{student.name}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            )
          )}
          {isAiTyping && (
            <div className="text-xs font-mono text-[#B59024] animate-pulse pl-11">
              Preparing explanation for {student.name}...
            </div>
          )}
        </div>

        {/* Input Form with Audio Transcription (gemini-3.5-transcribe) */}
        <form onSubmit={handleSend} className="pt-2">
          <div className="flex items-center gap-2 p-2 pl-4 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-[#D4AF37] focus-within:bg-white">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={`Ask about ${activeConcept.shortName} or use voice input...`}
              className="flex-1 bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400 text-xs"
            />
            <AudioTranscribeMicButton
              onTranscribed={(transcript) =>
                setPromptInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
              }
            />
            <button
              type="submit"
              disabled={isAiTyping}
              className="px-5 py-2.5 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProgressDashboardPage: React.FC = () => {
  const { conceptStates, attempts, overallMastery, setRoute, setActiveConceptId } = useLearning();

  return (
    <div className="space-y-8 pb-16">
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-[#B59024]">
            Your Learning Progress
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Progress &amp; Practice History
          </h1>
          <p className="text-sm text-slate-600">
            See how your topic scores have improved and review your recent quiz attempts.
          </p>
        </div>

        <div className="flex items-center gap-5 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div>
            <div className="text-xs text-slate-500">Overall Mastery</div>
            <div className="text-3xl font-extrabold font-mono text-[#B59024] tabular-nums">
              {overallMastery}%
            </div>
          </div>
          <div className="pl-5 border-l border-slate-200">
            <div className="text-xs text-slate-500">Questions Answered</div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {attempts.length}
            </div>
          </div>
        </div>
      </section>

      {/* Concept Delta Grid */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">
          Topic Improvement (Before vs Current)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {conceptStates.map((c) => {
            const delta = c.mastery - c.previousMastery;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConceptId(c.id);
                  setRoute('learning-content');
                }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D4AF37] cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{c.shortName}</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1 tabular-nums">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {delta >= 0 ? `+${delta}%` : `${delta}%`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono text-slate-500 tabular-nums">
                  <span>
                    {c.previousMastery}% → <strong className="text-slate-900">{c.mastery}%</strong>
                  </span>
                  <span>{c.status}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37] rounded-full"
                    style={{ width: `${c.mastery}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Attempt Audit Table */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Question Attempts</h2>
          <span className="text-xs font-mono text-slate-400">
            {attempts.length} recorded attempts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-3 font-semibold">Time</th>
                <th className="py-3 px-3 font-semibold">Topic</th>
                <th className="py-3 px-3 font-semibold">Difficulty</th>
                <th className="py-3 px-3 font-semibold">Result</th>
                <th className="py-3 px-3 font-semibold text-right">Hints Used</th>
                <th className="py-3 px-3 font-semibold text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...attempts].reverse().map((att) => (
                <tr key={att.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-slate-500 tabular-nums">
                    {att.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{att.conceptName}</td>
                  <td className="py-3 px-3 font-mono text-[#B59024] font-semibold">
                    {att.difficulty}
                  </td>
                  <td className="py-3 px-3">
                    {att.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-600 tabular-nums">
                    {att.hintsUsed}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-900 tabular-nums">
                    {att.timeTakenSeconds}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const StudentProfilePage: React.FC = () => {
  const {
    student,
    overallMastery,
    conceptStates,
    applyDemoPreset,
    setRoute,
  } = useLearning();

  const masteredNodes = conceptStates.filter((c) => c.rawClassification === 'Mastered');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <UserAvatar
            name={student.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37]"
          />
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#B59024]">{student.role}</div>
            <h1 className="text-2xl font-extrabold text-slate-900">{student.name}</h1>
            <div className="text-xs text-slate-500 font-mono">{student.email}</div>
            <div className="text-xs text-slate-700 font-medium pt-1">
              Course: {student.subject} · Level: {student.level} · Goal:{' '}
              {student.dailyTargetMinutes}m/day
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRoute('settings')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
        >
          Edit Settings
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
          <div className="text-xs text-slate-500">Overall Mastery</div>
          <div className="text-3xl font-extrabold text-[#B59024] font-mono tabular-nums">
            {overallMastery}%
          </div>
          <div className="text-xs text-slate-500">Weighted Topic Average</div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
          <div className="text-xs text-slate-500">Mastered Topics</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {masteredNodes.length} / {conceptStates.length}
          </div>
          <div className="text-xs text-slate-500">C Programming</div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
          <div className="text-xs text-slate-500">Explanation Style</div>
          <div className="text-base font-bold text-slate-900 pt-1">{student.explanationStyle}</div>
          <div className="text-xs text-slate-500">{student.preferredLanguage}</div>
        </div>
      </section>

      {/* Demo State Switcher Card */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">
          Test Different Student Progress States
        </h2>
        <p className="text-xs text-slate-600">
          Click any preset below to see how VidyaOrbit updates your Dashboard, Knowledge Map, and
          Learning Path:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => applyDemoPreset('default_gap')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D4AF37] text-left space-y-1.5"
          >
            <div className="text-xs font-bold text-[#B59024]">
              1. Initial Diagnostic (68%)
            </div>
            <p className="text-[11px] text-slate-600">
              Functions is Weak (52%) and locks Pointers (31%). Recommended next: Revise Functions.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyDemoPreset('functions_unlocked')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D4AF37] text-left space-y-1.5"
          >
            <div className="text-xs font-bold text-slate-900">
              2. Functions Revised (72%)
            </div>
            <p className="text-[11px] text-slate-600">
              Functions crosses 60% → Pointers unlocks and becomes your next recommended step!
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyDemoPreset('high_mastery')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D4AF37] text-left space-y-1.5"
          >
            <div className="text-xs font-bold text-slate-900">
              3. Advanced Mastery (85%)
            </div>
            <p className="text-[11px] text-slate-600">
              7/9 topics Mastered; Pointers at 78%; Structures unlocked.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const {
    thresholds,
    updateThresholds,
    student,
    updateStudent,
    setRoute,
  } = useLearning();

  const [savedBanner, setSavedBanner] = useState(false);

  const handleResetDefaults = () => {
    updateThresholds(DEFAULT_THRESHOLDS);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="text-xs font-bold text-[#B59024]">
          Platform Preferences
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">
          Customize your profile and mastery score thresholds.
        </p>
      </section>

      {savedBanner && (
        <div className="p-4 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] text-xs font-bold text-[#B59024]">
          ✓ Mastery thresholds reset to default values (80% / 60% / 40%).
        </div>
      )}

      {/* Configurable Mastery Thresholds */}
      <section className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Mastery Score Thresholds
            </h2>
            <p className="text-xs text-slate-500">
              Adjusting these sliders immediately updates your Knowledge Map and Learning Path.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Reset Defaults
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Mastered Threshold (Default: 80%)
              </span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums">
                ≥ {thresholds.masteredMin}%
              </span>
            </div>
            <input
              type="range"
              min={70}
              max={95}
              value={thresholds.masteredMin}
              onChange={(e) => updateThresholds({ masteredMin: Number(e.target.value) })}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Developing &amp; Prerequisite Unlock Threshold (Default: 60%)
              </span>
              <span className="font-mono font-bold text-[#B59024] tabular-nums">
                ≥ {thresholds.developingMin}%
              </span>
            </div>
            <input
              type="range"
              min={45}
              max={69}
              value={thresholds.developingMin}
              onChange={(e) => updateThresholds({ developingMin: Number(e.target.value) })}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Weak Threshold (Below this is a Knowledge Gap; Default: 40%)
              </span>
              <span className="font-mono font-bold text-amber-700 tabular-nums">
                ≥ {thresholds.weakMin}%
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={44}
              value={thresholds.weakMin}
              onChange={(e) => updateThresholds({ weakMin: Number(e.target.value) })}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Minimum Question Attempts Required for “Mastered”
              </span>
              <span className="font-mono font-bold text-[#B59024] tabular-nums">
                {thresholds.minAttemptsForMastery} attempts
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              value={thresholds.minAttemptsForMastery}
              onChange={(e) =>
                updateThresholds({ minAttemptsForMastery: Number(e.target.value) })
              }
              className="w-full accent-[#D4AF37]"
            />
          </div>
        </div>
      </section>

      {/* Student Preferences */}
      <section className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">Student Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Student Name</label>
            <input
              type="text"
              value={student.name}
              onChange={(e) => updateStudent({ name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Current Level
            </label>
            <select
              value={student.level}
              onChange={(e) => updateStudent({ level: e.target.value as StudentLevel })}
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setRoute('dashboard')}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all"
          >
            Save &amp; Return to Dashboard
          </button>
        </div>
      </section>
    </div>
  );
};
