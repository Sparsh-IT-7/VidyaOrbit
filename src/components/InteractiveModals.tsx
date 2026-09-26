import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  StepForward,
  Cpu,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';

interface CMemorySandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TraceStep {
  line: number;
  explanation: string;
  stackFrames: {
    frameName: string;
    vars: { name: string; address: string; value: string; highlight?: boolean }[];
  }[];
  stdout: string;
}

const PASS_BY_VALUE_STEPS: TraceStep[] = [
  {
    line: 6,
    explanation: 'main() begins execution and allocates "score" at stack address 0x7ffd10 with value 50.',
    stackFrames: [
      {
        frameName: 'main() [Active Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '50', highlight: true }],
      },
    ],
    stdout: '',
  },
  {
    line: 7,
    explanation: 'main() calls updateScore(score). A copy of 50 is pushed into a new stack frame for parameter "s" at 0x7ffd04.',
    stackFrames: [
      {
        frameName: 'updateScore(int s) [Active Frame]',
        vars: [{ name: 'int s (copy)', address: '0x7ffd04', value: '50', highlight: true }],
      },
      {
        frameName: 'main() [Caller Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '50' }],
      },
    ],
    stdout: '',
  },
  {
    line: 3,
    explanation: 'Inside updateScore(), s = s + 20 updates ONLY local address 0x7ffd04 to 70. Address 0x7ffd10 in main() stays 50!',
    stackFrames: [
      {
        frameName: 'updateScore(int s) [Active Frame]',
        vars: [{ name: 'int s (copy)', address: '0x7ffd04', value: '70', highlight: true }],
      },
      {
        frameName: 'main() [Caller Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '50' }],
      },
    ],
    stdout: '',
  },
  {
    line: 8,
    explanation: 'updateScore() returns and its stack frame is popped. printf("%d", score) reads 0x7ffd10 and prints 50.',
    stackFrames: [
      {
        frameName: 'main() [Active Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '50', highlight: true }],
      },
    ],
    stdout: '50',
  },
];

const POINTER_DEREF_STEPS: TraceStep[] = [
  {
    line: 6,
    explanation: 'main() allocates "score" at stack address 0x7ffd10 with initial value 50.',
    stackFrames: [
      {
        frameName: 'main() [Active Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '50', highlight: true }],
      },
    ],
  stdout: '',
  },
  {
    line: 7,
    explanation: 'main() calls updateViaPtr(&score), passing the exact memory address 0x7ffd10 into pointer parameter "int *p".',
    stackFrames: [
      {
        frameName: 'updateViaPtr(int *p) [Active Frame]',
        vars: [{ name: 'int *p', address: '0x7ffd00', value: '0x7ffd10 (&score)', highlight: true }],
      },
      {
        frameName: 'main() [Caller Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '50' }],
      },
    ],
    stdout: '',
  },
  {
    line: 3,
    explanation: '*p = *p + 20 dereferences address 0x7ffd10 and writes 70 directly into main()’s "score" variable!',
    stackFrames: [
      {
        frameName: 'updateViaPtr(int *p) [Active Frame]',
        vars: [{ name: 'int *p', address: '0x7ffd00', value: '0x7ffd10 (&score)' }],
      },
      {
        frameName: 'main() [Caller Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '70', highlight: true }],
      },
    ],
    stdout: '',
  },
  {
    line: 8,
    explanation: 'updateViaPtr() returns. printf("%d", score) in main() now prints the mutated value 70.',
    stackFrames: [
      {
        frameName: 'main() [Active Frame]',
        vars: [{ name: 'int score', address: '0x7ffd10', value: '70', highlight: true }],
      },
    ],
    stdout: '70',
  },
];

export const CMemorySandboxModal: React.FC<CMemorySandboxModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'value' | 'pointer'>('value');
  const [stepIdx, setStepIdx] = useState<number>(0);

  if (!isOpen) return null;

  const steps = mode === 'value' ? PASS_BY_VALUE_STEPS : POINTER_DEREF_STEPS;
  const currentStep = steps[stepIdx] || steps[0];

  const codeLines =
    mode === 'value'
      ? [
          '#include <stdio.h>',
          'void updateScore(int s) {',
          '    s = s + 20; // Local copy only',
          '}',
          'int main() {',
          '    int score = 50;',
          '    updateScore(score);',
          '    printf("%d", score);',
          '    return 0;',
          '}',
        ]
      : [
          '#include <stdio.h>',
          'void updateViaPtr(int *p) {',
          '    *p = *p + 20; // Dereferences 0x7ffd10',
          '}',
          'int main() {',
          '    int score = 50;',
          '    updateViaPtr(&score);',
          '    printf("%d", score);',
          '    return 0;',
          '}',
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Visual C Memory Step-Through
              </h2>
              <p className="text-xs text-slate-500">
                See why Functions (Pass-by-Value) is learned before Pointers (Pass-by-Address)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & Step Controls */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('value');
                setStepIdx(0);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === 'value'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Functions: Pass-by-Value
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('pointer');
                setStepIdx(0);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === 'pointer'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Pointers: Pass-by-Address (&amp; / *)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 pr-2 tabular-nums">
              Step {stepIdx + 1} of {steps.length}
            </span>
            <button
              type="button"
              onClick={() => setStepIdx(0)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={() => setStepIdx((s) => (s + 1) % steps.length)}
              className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] flex items-center gap-1.5"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>{stepIdx < steps.length - 1 ? 'Next Step' : 'Restart'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Code Column (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="text-xs font-bold text-slate-700">C Code Execution</div>
            <div className="p-4 rounded-xl bg-slate-900 font-mono text-xs space-y-1">
              {codeLines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isCurrentLine = currentStep.line === lineNum;
                return (
                  <div
                    key={lineNum}
                    className={`px-2 py-1 rounded flex items-center gap-3 transition-colors ${
                      isCurrentLine
                        ? 'bg-[#D4AF37]/25 text-[#D4AF37] font-bold border-l-2 border-[#D4AF37]'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="w-4 text-right text-slate-500 select-none">{lineNum}</span>
                    <span className="whitespace-pre">{lineText}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/40 space-y-1">
              <div className="text-xs font-bold text-[#B59024]">What is happening here:</div>
              <p className="text-xs text-slate-800 leading-relaxed">{currentStep.explanation}</p>
            </div>
          </div>

          {/* Stack Memory Frames Column (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="text-xs font-bold text-slate-700">Memory Boxes (Call Stack)</div>
            <div className="space-y-3">
              {currentStep.stackFrames.map((frame) => (
                <div
                  key={frame.frameName}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <div className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                    {frame.frameName}
                  </div>
                  <div className="space-y-2">
                    {frame.vars.map((v) => (
                      <div
                        key={v.address}
                        className={`p-2.5 rounded-lg border flex items-center justify-between font-mono text-xs ${
                          v.highlight
                            ? 'bg-[#FBF7E8] border-[#D4AF37] text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{v.name}</div>
                          <div className="text-[10px] text-slate-400">Address: {v.address}</div>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-slate-900 text-[#D4AF37] font-bold">
                          {v.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs">
              <span className="text-slate-400">Program Output: </span>
              <span className="text-[#D4AF37] font-bold">
                {currentStep.stdout || '(waiting for printf...)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TeacherCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherCohortModal: React.FC<TeacherCohortModalProps> = ({ isOpen, onClose }) => {
  const { student, overallMastery, applyDemoPreset } = useLearning();

  if (!isOpen) return null;

  const cohortStudents = [
    {
      name: student.name + ' (Current)',
      overall: `${overallMastery}%`,
      weakConcept: 'Functions (52%)',
      blockedConcept: 'Pointers (31%)',
      recommendedAction: 'Revise Functions → Unlock Pointers',
      preset: 'default_gap' as const,
    },
    {
      name: 'Maya Lin',
      overall: '74%',
      weakConcept: 'Pointers (44%)',
      blockedConcept: 'Structures (35%)',
      recommendedAction: 'Functions Developing (72%) · Pointers Active',
      preset: 'functions_unlocked' as const,
    },
    {
      name: 'Rohan Verma',
      overall: '85%',
      weakConcept: 'Structures (66%)',
      blockedConcept: 'None (All Unlocked)',
      recommendedAction: 'Capstone Structures Practice',
      preset: 'high_mastery' as const,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Class Overview (Teacher Preview)
              </h2>
              <p className="text-xs text-slate-500">
                Compare how VidyaOrbit adapts learning paths for different student profiles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Common Bottleneck</div>
              <div className="text-base font-bold text-[#B59024] mt-1">
                Functions → Pointers
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                64% of students revise Functions before unlocking Pointers
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Class Average Mastery</div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
                75.6%
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                +6.2% this week
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Scoring Engine</div>
              <div className="text-base font-bold text-slate-900 mt-1">100% Deterministic</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Rule-based grading + AI explanations
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900">
              Switch Student Profile (Click to load their live state):
            </div>
            <div className="space-y-2.5">
              {cohortStudents.map((s) => (
                <div
                  key={s.name}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900">{s.name}</span>
                      <span className="font-mono text-xs font-bold text-[#B59024]">
                        {s.overall} Mastery
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Weak Area: <strong className="text-slate-900">{s.weakConcept}</strong> ·
                      Locked: <strong className="text-amber-700">{s.blockedConcept}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Recommended: {s.recommendedAction}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      applyDemoPreset(s.preset);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  >
                    <span>Load Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
