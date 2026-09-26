import React from 'react';
import {
  Check,
  Lock,
  AlertTriangle,
  ArrowDown,
  Play,
  BookOpen,
  BrainCircuit,
  GitBranch,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { ConceptId } from '../types/learning';

export const KnowledgeMapPage: React.FC = () => {
  const {
    activeSubject,
    conceptStates,
    activeConceptId,
    setActiveConceptId,
    setRoute,
    thresholds,
    boostConceptMastery,
  } = useLearning();

  const selectedConcept =
    conceptStates.find((c) => c.id === activeConceptId) ||
    conceptStates[0];

  const handleLaunchLesson = (id: ConceptId) => {
    setActiveConceptId(id);
    setRoute('learning-content');
  };

  const handleLaunchQuiz = (id: ConceptId) => {
    setActiveConceptId(id);
    setRoute('adaptive-quiz');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-bold text-[#B59024]">
            Concept Dependency Graph · {activeSubject.code}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {activeSubject.name} — What You Know
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Click any topic in {activeSubject.name} below to see your current mastery score, required prerequisites, and what topics it unlocks next.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-slate-800 font-medium">Mastered (≥{thresholds.masteredMin}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
            <span className="text-slate-800 font-medium">
              Developing / Weak ({thresholds.weakMin}–{thresholds.masteredMin - 1}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-slate-500 font-medium">
              Locked (Prerequisite &lt;{thresholds.developingMin}%)
            </span>
          </div>
        </div>
      </section>

      {/* Main 2-Column Split: Left = Dependency Chain Graph, Right = Concept Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Dependency Chain (7 cols) */}
        <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              {activeSubject.name} Topic Chain
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Step 01 → 0{conceptStates.length}
            </span>
          </div>

          <div className="pt-2 flex flex-col items-center">
            {conceptStates.map((node, index) => {
              const isSelected = node.id === selectedConcept.id;
              const isMastered = node.rawClassification === 'Mastered';
              const isDeveloping = node.rawClassification === 'Developing';
              const isLocked = node.status === 'Locked' || node.isRestrictedByPrerequisite;

              return (
                <React.Fragment key={node.id}>
                  <button
                    type="button"
                    onClick={() => setActiveConceptId(node.id)}
                    className={`vo-card-hover w-full max-w-xl p-4 rounded-xl border text-left flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#FBF7E8] border-[#D4AF37] shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Visual State Icon */}
                      {isLocked ? (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                      ) : isMastered ? (
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      ) : isDeveloping ? (
                        <div className="w-10 h-10 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] text-[#B59024] flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                          0{node.order}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{node.name}</span>
                          <span className="text-xs font-mono text-slate-500">
                            {isLocked
                              ? '🔒 Locked'
                              : isMastered
                              ? '✓ Mastered'
                              : isDeveloping
                              ? '● Developing'
                              : '⚠ Needs Practice'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {node.prerequisites.length > 0
                            ? `Requires: ${node.prerequisites
                                .map((p) => conceptStates.find((c) => c.id === p)?.shortName)
                                .join(', ')}`
                            : 'Starting Topic'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
                        {node.mastery}%
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {node.attemptsCount} tries
                      </div>
                    </div>
                  </button>

                  {index < conceptStates.length - 1 && (
                    <div className="py-1.5 flex flex-col items-center text-[#D4AF37]">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Concept Detail Panel (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-22 space-y-6">
          <div className="vo-card-hover-subtle p-6 md:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold text-[#B59024]">
                  Topic 0{selectedConcept.order} Details
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedConcept.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedConcept.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-extrabold font-mono text-[#B59024] tabular-nums">
                  {selectedConcept.mastery}%
                </div>
                <div className="text-xs text-slate-500 font-semibold">{selectedConcept.status}</div>
              </div>
            </div>

            {/* Recent Performance & Mastery Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Progress</span>
                <span className="font-mono text-slate-900 font-bold tabular-nums">
                  {selectedConcept.previousMastery}% → {selectedConcept.mastery}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                  style={{ width: `${selectedConcept.mastery}%` }}
                />
              </div>
            </div>

            {/* Prerequisites & Dependent Concepts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-[#B59024]" />
                  <span>Prerequisites</span>
                </div>
                {selectedConcept.prerequisites.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedConcept.prerequisites.map((pid) => {
                      const pNode = conceptStates.find((c) => c.id === pid);
                      if (!pNode) return null;
                      const met = pNode.mastery >= thresholds.developingMin;
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => setActiveConceptId(pid)}
                          className="w-full flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#D4AF37] text-left"
                        >
                          <span className="text-slate-800 font-medium">{pNode.shortName}</span>
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              met ? 'text-emerald-700' : 'text-[#B59024]'
                            }`}
                          >
                            {pNode.mastery}% {met ? '✓' : '⚠'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">None (First Topic)</div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#B59024]" />
                  <span>Unlocks Next</span>
                </div>
                {selectedConcept.dependents.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedConcept.dependents.map((did) => {
                      const dNode = conceptStates.find((c) => c.id === did);
                      if (!dNode) return null;
                      return (
                        <button
                          key={did}
                          type="button"
                          onClick={() => setActiveConceptId(did)}
                          className="w-full flex items-center justify-between text-xs p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#D4AF37] text-left"
                        >
                          <span className="text-slate-800 font-medium">{dNode.shortName}</span>
                          <span className="font-mono text-slate-500 tabular-nums">
                            {dNode.mastery}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Final Topic</div>
                )}
              </div>
            </div>

            {/* Deterministic Reason & Recommended Action */}
            <div className="p-4 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/40 space-y-2">
              <div className="text-xs font-bold text-slate-900">
                Why this status:
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedConcept.reason}</p>
              <div className="pt-2 border-t border-[#D4AF37]/30 text-xs text-[#B59024] font-bold">
                Recommended: {selectedConcept.recommendedAction}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {selectedConcept.isRestrictedByPrerequisite &&
              selectedConcept.blockingPrerequisiteId ? (
                <button
                  type="button"
                  onClick={() => handleLaunchLesson(selectedConcept.blockingPrerequisiteId!)}
                  className="w-full py-3 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    Study Prerequisite First: {selectedConcept.blockingPrerequisiteName} (
                    {selectedConcept.blockingPrerequisiteMastery}%)
                  </span>
                </button>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLaunchLesson(selectedConcept.id)}
                  className="py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>Open Lesson</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchQuiz(selectedConcept.id)}
                  className="py-3 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] text-slate-900 text-xs font-bold hover:bg-[#D4AF37]/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <BrainCircuit className="w-4 h-4 text-[#B59024]" />
                  <span>Practice Quiz</span>
                </button>
              </div>
            </div>

            {/* Interactive Prerequisite Simulator */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Test Unlock Slider ({selectedConcept.shortName}):
                </span>
                <span className="font-mono text-[#B59024] font-bold">
                  {selectedConcept.mastery}%
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={95}
                value={selectedConcept.mastery}
                onChange={(e) =>
                  boostConceptMastery(selectedConcept.id, Number(e.target.value))
                }
                className="w-full accent-[#D4AF37]"
              />
              <div className="text-[11px] text-slate-400">
                Slide {selectedConcept.shortName} above {thresholds.developingMin}% to see dependent topics in {activeSubject.name} unlock immediately.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PersonalizedLearningPathPage: React.FC = () => {
  const {
    activeSubject,
    learningPath,
    recommendedNextStep,
    setActiveConceptId,
    setRoute,
  } = useLearning();

  const handleStartItem = (conceptId: ConceptId, activityType: string) => {
    setActiveConceptId(conceptId);
    if (activityType === 'Practice' || activityType === 'Assessment') {
      setRoute('adaptive-quiz');
    } else {
      setRoute('learning-content');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B59024]">
            <Sparkles className="w-4 h-4" />
            <span>Personalized Study Plan · {activeSubject.name} ({activeSubject.code})</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Key Learning Steps — {activeSubject.name}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ordered step-by-step based on what you already know, which topics need practice, and
            prerequisite rules.
          </p>
        </div>

        <div className="vo-card-hover p-4 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] space-y-2 shrink-0">
          <div className="text-xs text-[#B59024] font-bold">Recommended Next</div>
          <div className="text-lg font-bold text-slate-900">
            {recommendedNextStep.shortName} ({recommendedNextStep.mastery}%)
          </div>
          <button
            type="button"
            onClick={() => handleStartItem(recommendedNextStep.id, 'Revision')}
            className="w-full py-2 px-4 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Now</span>
          </button>
        </div>
      </section>

      {/* Vertical Path Timeline */}
      <section className="space-y-4">
        {learningPath.map((item, idx) => {
          const isCompleted = item.status === 'Completed';
          const isRecommended = item.status === 'Recommended';
          const isLocked = item.status === 'Locked';

          return (
            <React.Fragment key={item.id}>
              <div
                className={`vo-card-hover-subtle p-5 md:p-6 rounded-2xl border ${
                  isRecommended
                    ? 'bg-[#FBF7E8]/60 border-[#D4AF37] shadow-sm'
                    : isCompleted
                    ? 'bg-white border-slate-200'
                    : isLocked
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Icon Column */}
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : isRecommended ? (
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    ) : isLocked ? (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                        {idx + 1}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`font-bold ${
                            isRecommended
                              ? 'text-[#B59024]'
                              : isCompleted
                              ? 'text-emerald-700'
                              : isLocked
                              ? 'text-slate-400'
                              : 'text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{item.activityType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500 inline-flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3" />
                          {item.estimatedMinutes} mins
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Why:</strong> {item.reason}
                      </p>

                      {!isCompleted && (
                        <div className="pt-2 max-w-md space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                            <span>Current Mastery</span>
                            <span>{item.mastery}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#D4AF37]"
                              style={{ width: `${item.mastery}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="shrink-0 flex items-center">
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleStartItem(item.conceptId, 'Revision')}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D4AF37] text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Review</span>
                      </button>
                    ) : isLocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveConceptId(item.conceptId);
                          setRoute('knowledge-map');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Why Locked?</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartItem(item.conceptId, item.activityType)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                          isRecommended
                            ? 'bg-[#D4AF37] text-slate-950 hover:bg-[#c59f2d] shadow-xs'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Learning</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {idx < learningPath.length - 1 && (
                <div className="flex justify-center text-[#D4AF37]">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </section>
    </div>
  );
};
