import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  GitBranch,
  BrainCircuit,
  Target,
  Sliders,
  Bot,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { GlobalHeader } from '../components/AppShell';
import { ConceptId, StudentLevel } from '../types/learning';

export const LandingPage: React.FC = () => {
  const { setRoute, startDemoMode } = useLearning();

  const workflowSteps = [
    { step: '01', title: 'Diagnostic Test', desc: 'Short check across core C Programming topics' },
    { step: '02', title: 'Knowledge Profile', desc: 'Measures your mastery on every concept' },
    { step: '03', title: 'Gap Detection', desc: 'Finds weak topics and missing prerequisites' },
    { step: '04', title: 'Personalized Path', desc: 'Recommends the exact lesson you need next' },
    { step: '05', title: 'Adaptive Quiz', desc: 'Adjusts difficulty and offers step-by-step hints' },
    { step: '06', title: 'Improved Mastery', desc: 'Updates your profile and unlocks advanced topics' },
  ];

  const capabilities = [
    {
      title: 'Adaptive Learning',
      engineType: 'Deterministic Engine',
      description:
        'Your study plan changes automatically based on your real performance instead of forcing a one-size-fits-all syllabus.',
      icon: Sliders,
    },
    {
      title: 'Knowledge Gap Detection',
      engineType: 'Concept Analysis',
      description:
        'Pinpoints specific weak concepts (40–59%) and knowledge gaps (<40%) rather than hiding them behind an average grade.',
      icon: Target,
    },
    {
      title: 'Prerequisite Intelligence',
      engineType: 'Dependency Graph',
      description:
        'Ensures foundational concepts (like Functions) are solid before unlocking dependent topics (like Pointers).',
      icon: GitBranch,
    },
    {
      title: 'Adaptive Assessments',
      engineType: 'Sliding-Window Engine',
      description:
        'Steps question difficulty up or down based on your last 5 answers and provides 3-stage progressive hints.',
      icon: BrainCircuit,
    },
    {
      title: 'AI Learning Assistant',
      engineType: 'Pedagogical AI Layer',
      description:
        'Gives beginner-friendly explanations, C code examples, hints, and mistake walkthroughs tailored to your level.',
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Global Website Header with Official VidyaOrbit Logo */}
      <GlobalHeader mode="public" />

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1280px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF7E8] border border-[#D4AF37]/40 text-xs font-bold text-[#B59024]">
              <span>VidyaOrbit · Adaptive Engineering Learning Platform</span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Learn What You Need. <span className="text-[#B59024]">Next.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              An AI-powered personalized learning platform that understands what you know,
              identifies what you are missing, and dynamically changes what you should learn next.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => setRoute('login')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-sm hover:bg-[#c59f2d] transition-all whitespace-nowrap"
              >
                <span>Student Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRoute('signup')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all whitespace-nowrap"
              >
                <span>Create Student Account</span>
              </button>
              <a
                href="#workflow"
                className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>See How It Works</span>
              </a>
            </div>
          </div>

          {/* Clean Student Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="vo-card-hover p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs text-[#B59024] font-bold">
                    Student Snapshot · Alex Chen
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    C Programming Mastery: 68%
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  9 Core Topics
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-800 font-semibold">1. Strong: Variables &amp; Loops</span>
                    <span className="font-mono text-emerald-700 font-bold tabular-nums">
                      91% · 73%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '91%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-800 font-semibold">2. Needs Practice: Functions</span>
                    <span className="font-mono text-[#B59024] font-bold tabular-nums">
                      45% → 52%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: '52%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      3. Locked Topic: Pointers
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      31% (Needs Functions ≥ 60%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '31%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/40 space-y-1.5">
                <div className="text-xs font-bold text-[#B59024]">
                  Recommended Next Step: Revise Functions
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Your Functions mastery is 52%, and reaching 60% will unlock Pointers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section id="workflow" className="py-16 px-6 md:px-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-[1280px] mx-auto space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold text-[#B59024] uppercase tracking-wider">
              How VidyaOrbit Works
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              A Simple 6-Step Adaptive Learning Loop
            </h2>
            <p className="text-sm text-slate-600">
              Every practice question updates your profile and adjusts what you should study next.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {workflowSteps.map((item, idx) => (
              <div
                key={item.step}
                className="vo-card-hover p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#B59024]">
                      Step {item.step}
                    </span>
                    {idx < workflowSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-[#D4AF37] hidden lg:block" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="capabilities" className="py-16 px-6 md:px-12 max-w-[1280px] mx-auto w-full space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-[#B59024] uppercase tracking-wider">
            Key Features
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Designed for Clear, Step-by-Step Mastery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="vo-card-hover p-6 rounded-2xl bg-white border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FBF7E8] border border-[#D4AF37]/40 text-[#B59024] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{cap.engineType}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{cap.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{cap.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deterministic vs AI Separation Architecture Banner */}
      <section id="architecture" className="py-12 px-6 md:px-12 max-w-[1280px] mx-auto w-full pb-20">
        <div className="vo-card-hover-subtle p-8 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#B59024]">
              <ShieldCheck className="w-4 h-4" />
              <span>Deterministic Learning Engine</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Transparent Rules for Scoring &amp; Prerequisites
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The AI never guesses your score or decides whether a topic is unlocked. All scoring,
              mastery percentages, prerequisite checks, and difficulty adjustments are calculated by
              predictable, transparent rules.
            </p>
          </div>

          <div className="space-y-2.5 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-[#B59024]" />
              <span>AI Learning Support</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Friendly Explanations, Hints &amp; Code Examples
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Guided by your learning profile, the VidyaOrbit AI Tutor gives simple explanations, C
              code examples, and helpful hints without giving away quiz answers prematurely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Shared Minimal Layout Wrapper for Student Authentication Pages ---

const AuthPageLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      <GlobalHeader mode="auth" />

      <main className="max-w-md w-full mx-auto my-8 px-4 sm:px-0">{children}</main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
        VidyaOrbit · Adaptive Engineering Education Platform
      </footer>
    </div>
  );
};

// --- Login & Create Student Account Page ---

export const AuthPage: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const {
    setRoute,
    loginStudent,
    registerStudent,
    resendVerificationEmail,
    setAuthEmailContext,
    setAuthTokenParam,
  } = useLearning();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(mode === 'login' ? 'alex.chen@cityuniversity.edu' : '');
  const [password, setPassword] = useState(mode === 'login' ? 'Password123!' : '');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Request & feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [previewVerificationToken, setPreviewVerificationToken] = useState<string | undefined>();

  // Reset messages when switching between login and signup
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setNeedsEmailVerification(false);
    setRegistrationComplete(false);
    setPreviewVerificationToken(undefined);
    if (mode === 'login') {
      if (!email) setEmail('alex.chen@cityuniversity.edu');
      if (!password) setPassword('Password123!');
    } else {
      setPassword('');
      setConfirmPassword('');
    }
  }, [mode]);

  const validateInputs = (): string | null => {
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'signup' && name.trim().length < 2) {
      return 'Please enter your full name.';
    }
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return 'Please enter a valid email address.';
    }
    if (!password) {
      return 'Please enter your password.';
    }
    if (mode === 'signup' && password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (mode === 'signup' && password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    setSuccessMsg('');
    setNeedsEmailVerification(false);

    const validationError = validateInputs();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await loginStudent({
          email: email.trim(),
          password,
        });
        if (!result.ok) {
          setErrorMsg(result.error || 'Incorrect email or password.');
          if (result.code === 'EMAIL_NOT_VERIFIED') {
            setNeedsEmailVerification(true);
          }
        } else {
          setSuccessMsg(result.message || 'Signed in successfully.');
        }
      } else {
        const result = await registerStudent({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        });
        if (!result.ok) {
          setErrorMsg(result.error || 'Unable to send verification email. Please try again.');
        } else {
          setAuthEmailContext(email.trim().toLowerCase());
          setRoute('verify-email');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (isResending || !email.trim()) return;
    setIsResending(true);
    setErrorMsg('');
    try {
      const result = await resendVerificationEmail(email.trim());
      if (!result.ok) {
        setErrorMsg(result.error || 'Your verification email could not be sent. Please try again.');
      } else {
        setSuccessMsg(result.message || 'Verification email sent. Please check your inbox.');
        if (result.previewToken) {
          setPreviewVerificationToken(result.previewToken);
        }
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Header with Login Logo */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center shadow-2xs shrink-0">
              {mode === 'login' ? (
                <LogIn className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <UserPlus className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B59024]">
                VidyaOrbit
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {mode === 'login' ? 'Student Login' : 'Create Account'}
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {mode === 'login'
              ? 'Sign in to access your diagnostic tests, performance analysis, syllabus, and AI Tutor.'
              : 'Register with your student email to personalize your syllabus and track concept mastery.'}
          </p>
        </div>

        {/* Error Message Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2.5"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>

            {needsEmailVerification && (
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendVerification}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] text-slate-950 font-bold text-xs hover:bg-[#c59f2d] disabled:opacity-60 transition-colors"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthEmailContext(email.trim());
                    setRoute('verify-email');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-300 bg-white text-slate-800 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Open Verification Page
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Message Alert */}
        {successMsg && (
          <div
            role="status"
            className="p-4 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] text-xs text-slate-900 space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#B59024] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900">{successMsg}</p>
                {registrationComplete && (
                  <p className="text-slate-600 leading-relaxed">
                    We sent a verification link to <span className="font-mono font-semibold">{email}</span>.
                    Please verify your email before logging in.
                  </p>
                )}
              </div>
            </div>

            {registrationComplete && (
              <div className="pt-2 border-t border-[#D4AF37]/30 flex flex-col gap-2">
                {previewVerificationToken && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTokenParam(previewVerificationToken);
                      setRoute('verify-email');
                    }}
                    className="w-full py-2.5 px-3.5 rounded-lg bg-[#D4AF37] text-slate-950 font-bold text-xs hover:bg-[#c59f2d] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MailCheck className="w-4 h-4" />
                    <span>Verify Email Now (Click Verification Link)</span>
                  </button>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={handleResendVerification}
                    className="text-xs font-semibold text-[#B59024] hover:underline disabled:opacity-50"
                  >
                    {isResending ? 'Sending verification email...' : 'Resend Verification Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoute('login')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    Return to Login →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        {!registrationComplete && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="student-full-name"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Full Name
                </label>
                <input
                  id="student-full-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900 disabled:bg-slate-50"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="student-email"
                className="block text-xs font-semibold text-slate-800"
              >
                {mode === 'login' ? 'Email Address' : 'Student Email'}
              </label>
              <input
                id="student-email"
                type="email"
                required
                autoComplete="email"
                placeholder="student@university.edu"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="student-password"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setAuthEmailContext(email.trim());
                      setRoute('forgot-password');
                    }}
                    className="text-xs font-semibold text-[#B59024] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="student-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-16 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="student-confirm-password"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="student-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-16 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900 disabled:bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {showConfirmPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-sm hover:bg-[#c59f2d] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Login' : 'Create Student Account'}</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Switch between Login and Create Student Account */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-2">
          {mode === 'login' ? (
            <div className="text-xs text-slate-600">
              Don&apos;t have a student account yet?{' '}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setRoute('signup')}
                className="text-[#B59024] font-bold hover:underline ml-1"
              >
                Create Student Account
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              Already have a verified student account?{' '}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setRoute('login')}
                className="text-[#B59024] font-bold hover:underline ml-1"
              >
                Student Login
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthPageLayout>
  );
};

// --- Email Verification Page (6-Digit OTP) ---

export const VerifyEmailPage: React.FC = () => {
  const {
    setRoute,
    authEmailContext,
    setAuthEmailContext,
    authTokenParam,
    setAuthTokenParam,
    verifyStudentEmail,
    resendVerificationEmail,
  } = useLearning();

  const [otpInput, setOtpInput] = useState(
    authTokenParam && /^\d{6}$/.test(authTokenParam) ? authTokenParam : ''
  );
  const [emailInput, setEmailInput] = useState(authEmailContext || '');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    if (authEmailContext && !emailInput) {
      setEmailInput(authEmailContext);
    }
  }, [authEmailContext]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleVerifyOtp = async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim().replace(/\s+/g, '');
    const cleanEmail = (emailInput || authEmailContext || '').trim().toLowerCase();

    if (!cleanEmail) {
      setStatus('error');
      setMessage('Please enter the student email address you registered with.');
      return;
    }

    if (!cleanCode || !/^\d{6}$/.test(cleanCode)) {
      setStatus('error');
      setMessage('Incorrect verification code. Please enter your 6-digit OTP.');
      return;
    }

    setStatus('verifying');
    setMessage('');
    setResendFeedback('');

    const result = await verifyStudentEmail(cleanCode, cleanEmail);
    if (result.ok) {
      setStatus('verified');
      setMessage(result.message || 'Email verified successfully.');
      setAuthTokenParam('');
    } else {
      setStatus('error');
      setErrorCode(result.code);
      setMessage(result.error || 'Incorrect verification code. Please try again.');
      if (result.email) {
        setEmailInput(result.email);
      }
    }
  };

  const handleResend = async () => {
    const targetEmail = (emailInput || authEmailContext || '').trim().toLowerCase();
    if (!targetEmail) {
      setStatus('error');
      setMessage('Please enter your registered student email address to resend OTP.');
      return;
    }
    if (isResending || cooldownSeconds > 0) return;

    setIsResending(true);
    setResendFeedback('');
    setMessage('');
    try {
      const res = await resendVerificationEmail(targetEmail);
      if (res.ok) {
        setAuthEmailContext(targetEmail);
        setStatus('idle');
        setOtpInput('');
        setCooldownSeconds(res.retryAfterSeconds ?? 30);
        setResendFeedback(
          res.message || 'A new 6-digit verification code has been sent to your email.'
        );
      } else {
        setStatus('error');
        if (res.retryAfterSeconds) {
          setCooldownSeconds(res.retryAfterSeconds);
        }
        setMessage(res.error || 'Unable to send verification email. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center shadow-2xs shrink-0">
              <MailCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B59024]">
                VidyaOrbit
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Verify Your Email</h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            We sent a 6-digit verification code to your email
            {(emailInput || authEmailContext) ? (
              <>
                {' '}
                (<span className="font-mono font-semibold text-slate-900">{emailInput || authEmailContext}</span>)
              </>
            ) : null}
            .
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/50 text-xs font-semibold text-[#B59024]">
            <span>⏱️ Your verification code expires in 5 minutes. (OTP expires in 5 minutes.)</span>
          </div>
        </div>

        {status === 'verifying' && (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#B59024] animate-spin" />
            <div className="text-sm font-semibold text-slate-800">
              Verifying your 6-digit code...
            </div>
          </div>
        )}

        {status === 'verified' && (
          <div className="p-5 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#B59024] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">{message}</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Your student account is now active. You can continue directly to your VidyaOrbit
                  Dashboard or Login page.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setRoute('dashboard')}
                className="flex-1 h-11 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-sm hover:bg-[#c59f2d] transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRoute('login')}
                className="px-4 h-11 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs text-red-800"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">{message}</div>
                {errorCode === 'EXPIRED_OTP' && (
                  <p className="text-red-700">
                    Click &ldquo;Resend OTP&rdquo; below to receive a fresh 6-digit verification code.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {resendFeedback && (
          <div className="p-3.5 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] text-xs text-slate-900">
            <div className="font-semibold">{resendFeedback}</div>
          </div>
        )}

        {status !== 'verified' && status !== 'verifying' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp(otpInput);
            }}
            className="space-y-4 pt-2 border-t border-slate-100"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="verify-email-address"
                className="block text-xs font-semibold text-slate-800"
              >
                Student Email
              </label>
              <input
                id="verify-email-address"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="student@example.com"
                className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="verify-otp-code"
                className="block text-xs font-semibold text-slate-800"
              >
                Enter OTP
              </label>
              <input
                id="verify-otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-xl font-mono font-bold tracking-[0.4em] text-center text-slate-900"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="submit"
                disabled={otpInput.trim().length !== 6}
                className="flex-1 h-11 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-sm hover:bg-[#c59f2d] disabled:opacity-60 transition-colors"
              >
                Verify Email
              </button>

              <button
                type="button"
                disabled={isResending || cooldownSeconds > 0}
                onClick={handleResend}
                className="px-5 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-200 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {isResending
                    ? 'Sending...'
                    : cooldownSeconds > 0
                    ? `Resend OTP (${cooldownSeconds}s)`
                    : 'Resend OTP'}
                </span>
              </button>
            </div>

            {cooldownSeconds > 0 && (
              <p className="text-xs text-slate-500 text-center">
                You can request another code in {cooldownSeconds} seconds.
              </p>
            )}
          </form>
        )}

        <div className="pt-4 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => setRoute('login')}
            className="text-xs font-bold text-[#B59024] hover:underline"
          >
            Continue to Login
          </button>
        </div>
      </div>
    </AuthPageLayout>
  );
};

// --- Forgot Password Page ---

export const ForgotPasswordPage: React.FC = () => {
  const {
    setRoute,
    authEmailContext,
    requestPasswordReset,
    setAuthTokenParam,
  } = useLearning();

  const [email, setEmail] = useState(authEmailContext || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState('');
  const [previewResetToken, setPreviewResetToken] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    setSubmittedMsg('');
    setPreviewResetToken(undefined);

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordReset(cleanEmail);
      if (!result.ok) {
        setErrorMsg(result.error || 'Could not send reset link right now. Please try again.');
      } else {
        setSubmittedMsg(
          result.message ||
            'If an account exists for this email, a password reset link has been sent.'
        );
        if (result.previewToken) {
          setPreviewResetToken(result.previewToken);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center shadow-2xs shrink-0">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B59024]">
                VidyaOrbit
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Reset Your Password</h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Enter your student email address and we will send you a temporary link to create a new
            password.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submittedMsg && (
          <div
            role="status"
            className="p-4 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] text-xs text-slate-900 space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#B59024] shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{submittedMsg}</span>
            </div>

            <div className="pt-2 border-t border-[#D4AF37]/30">
              <button
                type="button"
                onClick={() => {
                  if (previewResetToken) {
                    setAuthTokenParam(previewResetToken);
                  }
                  setRoute('reset-password');
                }}
                className="w-full py-2.5 px-3.5 rounded-lg bg-[#D4AF37] text-slate-950 font-bold text-xs hover:bg-[#c59f2d] flex items-center justify-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>Enter 6-Digit Password Reset Code →</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="reset-email-input"
              className="block text-xs font-semibold text-slate-800"
            >
              Email Address
            </label>
            <input
              id="reset-email-input"
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900 disabled:bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-sm hover:bg-[#c59f2d] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => setRoute('login')}
            className="text-xs font-bold text-[#B59024] hover:underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    </AuthPageLayout>
  );
};

// --- Reset Password Page ---

export const ResetPasswordPage: React.FC = () => {
  const { setRoute, authTokenParam, setAuthTokenParam, confirmPasswordReset } = useLearning();

  const [token, setToken] = useState(authTokenParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (authTokenParam) {
      setToken(authTokenParam);
    }
  }, [authTokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    if (!token.trim()) {
      setErrorMsg('Reset token is missing. Please request a new password reset link.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmPasswordReset({
        token: token.trim(),
        newPassword,
        confirmNewPassword,
      });
      if (!result.ok) {
        setErrorMsg(
          result.error || 'This password reset link is invalid or has expired. Request a new one.'
        );
      } else {
        setResetSuccess(true);
        setSuccessMsg(result.message || 'Your password has been reset successfully.');
        setAuthTokenParam('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center shadow-2xs shrink-0">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B59024]">
                VidyaOrbit
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Password</h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Choose a strong password (at least 8 characters) for your VidyaOrbit student account.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs text-red-800"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setRoute('forgot-password')}
                className="text-xs font-bold text-[#B59024] hover:underline"
              >
                Request a new reset link →
              </button>
            </div>
          </div>
        )}

        {resetSuccess ? (
          <div className="p-5 rounded-xl bg-[#FBF7E8] border border-[#D4AF37] space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#B59024] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">{successMsg}</div>
                <p className="text-xs text-slate-700">
                  You can now sign in to your student account with your new password.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRoute('login')}
              className="w-full h-11 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-sm hover:bg-[#c59f2d] transition-colors flex items-center justify-center gap-2"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!authTokenParam && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  6-Digit Password Reset Code (OTP)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code from your email"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm font-mono font-bold tracking-widest text-slate-900"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="new-password-input"
                className="block text-xs font-semibold text-slate-800"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password-input"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 pl-3.5 pr-16 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showNewPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-new-password-input"
                className="block text-xs font-semibold text-slate-800"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-new-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full h-11 pl-3.5 pr-16 rounded-lg bg-white border border-slate-300 focus:border-[#D4AF37] outline-none text-sm text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showConfirmPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-sm hover:bg-[#c59f2d] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => setRoute('login')}
            className="text-xs font-bold text-[#B59024] hover:underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    </AuthPageLayout>
  );
};

// --- Onboarding Page ---

export const OnboardingPage: React.FC = () => {
  const {
    student,
    updateStudent,
    setRoute,
    subjects,
    activeSubject,
    conceptStates,
    selectEngineeringSubject,
  } = useLearning();
  const [step, setStep] = useState<number>(1);
  const [selectedTopics, setSelectedTopics] = useState<ConceptId[]>(student.selectedTopics);
  const [goal, setGoal] = useState<string>(student.learningGoal);
  const [level, setLevel] = useState<StudentLevel>(student.level);
  const [style, setStyle] = useState<typeof student.explanationStyle>(student.explanationStyle);
  const [language, setLanguage] = useState<string>(student.preferredLanguage);
  const [dailyTarget, setDailyTarget] = useState<number>(student.dailyTargetMinutes);

  const toggleTopic = (id: ConceptId) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((t) => t !== id) : prev) : [...prev, id]
    );
  };

  const handleFinish = () => {
    updateStudent({
      selectedTopics,
      learningGoal: goal,
      level,
      explanationStyle: style,
      preferredLanguage: language,
      dailyTargetMinutes: dailyTarget,
    });
    setRoute('diagnostic');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <GlobalHeader
        mode="onboarding"
        onboardingStepText={`Step ${step} of 4 · Setup Your Profile`}
      />

      <div className="max-w-3xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-10 space-y-8 my-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>1. Engineering Subject</span>
            <span>2. Learning Goal</span>
            <span>3. Current Level</span>
            <span>4. Preferences</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#D4AF37] transition-all duration-200"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#B59024]">Step 1 of 4</div>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">
                  What engineering subject do you want to learn?
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Select a subject from the SubjectManagement catalog and customize your topics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoute('subjects')}
                className="text-xs font-bold text-[#B59024] hover:underline shrink-0 self-start sm:self-center"
              >
                Manage All Subjects →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((subj) => {
                const isSelected = subj.id === activeSubject.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => selectEngineeringSubject(subj.id)}
                    className={`vo-card-hover p-4 rounded-xl border text-left flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FBF7E8] border-[#D4AF37]'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-[#D4AF37] font-mono text-[11px] font-bold">
                          {subj.code}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Year {subj.year} · Sem {subj.semester}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{subj.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {subj.syllabus.length} Syllabus Units · {subj.credits} Credits
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#D4AF37] text-slate-950'
                          : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-700">
                Included Core Diagnostic Concepts for {activeSubject.name} ({conceptStates.length} topics):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {conceptStates.map((topic) => {
                  const checked = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={`vo-card-hover p-3 rounded-xl border text-left flex items-center justify-between ${
                        checked
                          ? 'bg-[#FBF7E8]/60 border-[#D4AF37] text-slate-900'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{topic.shortName}</div>
                        <div className="text-[11px] text-slate-400">Topic 0{topic.order}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          checked
                            ? 'bg-[#D4AF37] text-slate-950'
                            : 'bg-slate-100 border border-slate-300'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold text-[#B59024]">Step 2 of 4</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">What is your learning goal?</h1>
              <p className="text-sm text-slate-600 mt-1">
                We use your goal to tailor your {activeSubject.name} examples and practice exercises.
              </p>
            </div>

            <div className="space-y-3">
              {[
                `Master ${activeSubject.name} fundamentals and core concepts.`,
                `Prepare for ${activeSubject.code} college exams and lab assignments.`,
                `Strengthen weak areas and unlock advanced topics in ${activeSubject.name}.`,
              ].map((presetGoal) => (
                <button
                  key={presetGoal}
                  type="button"
                  onClick={() => setGoal(presetGoal)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    goal === presetGoal
                      ? 'bg-[#FBF7E8] border-[#D4AF37] text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-medium">{presetGoal}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      goal === presetGoal
                        ? 'bg-[#D4AF37] text-slate-950'
                        : 'border border-slate-300'
                    }`}
                  >
                    {goal === presetGoal && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Or write your own goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-200 focus:border-[#D4AF37] outline-none text-sm text-slate-900"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold text-[#B59024]">Step 3 of 4</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">What is your current level?</h1>
              <p className="text-sm text-slate-600 mt-1">
                This sets how simple or detailed your lessons and starting questions will be.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  {
                    lvl: 'Beginner' as StudentLevel,
                    desc: `New to ${activeSubject.name}. Use everyday analogies and simple step-by-step walkthroughs.`,
                  },
                  {
                    lvl: 'Intermediate' as StudentLevel,
                    desc: `Know foundational ${activeSubject.name} concepts, and want more practice with core & advanced syllabus topics.`,
                  },
                  {
                    lvl: 'Advanced' as StudentLevel,
                    desc: `Familiar with ${activeSubject.name} fundamentals. Focus on deep analysis, optimization, and tricky edge cases.`,
                  },
                ]
              ).map((item) => (
                <button
                  key={item.lvl}
                  type="button"
                  onClick={() => setLevel(item.lvl)}
                  className={`vo-card-hover p-5 rounded-xl border text-left flex flex-col justify-between ${
                    level === item.lvl
                      ? 'bg-[#FBF7E8] border-[#D4AF37] text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">{item.lvl}</span>
                      {level === item.lvl && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold text-[#B59024]">Step 4 of 4</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Study Preferences</h1>
              <p className="text-sm text-slate-600 mt-1">
                Choose how you prefer the AI Tutor to explain topics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Explanation Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-[#D4AF37]"
                >
                  <option value="Step-by-step with code">Step-by-step with code examples</option>
                  <option value="Visual & Analogy-driven">Simple everyday analogies</option>
                  <option value="Concise & Formal">Short &amp; direct summaries</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-[#D4AF37]"
                >
                  <option value="English">English</option>
                  <option value="English + Hindi Bilingual">English + Hindi Explanations</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Daily Study Goal</span>
                <span className="font-mono font-bold text-[#B59024] tabular-nums">
                  {dailyTarget} mins / day
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={90}
                step={15}
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>15m (Quick)</span>
                <span>30m (Regular)</span>
                <span>60m (Focused)</span>
                <span>90m (Deep)</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRoute('dashboard')}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Skip to Dashboard
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4AF37] text-slate-950 text-sm font-bold hover:bg-[#c59f2d] transition-all"
            >
              <span>Start Diagnostic Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        VidyaOrbit uses your preferences to personalize lessons and practice questions.
      </div>
    </div>
  );
};
