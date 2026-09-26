import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  AppRoute,
  AttemptRecord,
  ChatMessage,
  ConceptId,
  ConceptLessonData,
  ConceptMasteryState,
  Difficulty,
  LearningPathItem,
  QuestionMetadata,
  StudentProfile,
  ThresholdConfig,
} from '../types/learning';
import {
  DEFAULT_THRESHOLDS,
  evaluateKnowledgeGraph,
  generatePersonalizedLearningPath,
} from '../engine/deterministicEngine';
import {
  CreateSubjectInput,
  EngineeringSubject,
  SyllabusUnit,
  subjectManagementService,
} from '../services/SubjectManagement';
import {
  getQuestionsForSubject,
  resolveConceptLesson,
  resolveSubjectCurriculum,
} from '../data/subjectRegistry';

export interface AuthActionResponse {
  ok: boolean;
  message?: string;
  error?: string;
  code?: string;
  email?: string;
  alreadyVerified?: boolean;
  deliveryMode?: 'smtp' | 'fallback_outbox';
  previewToken?: string;
  previewUrl?: string;
  retryAfterSeconds?: number;
  expiresInSeconds?: number;
}

interface LearningContextValue {
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
  isAuthenticated: boolean;
  jwtToken: string | null;
  student: StudentProfile;
  updateStudent: (patch: Partial<StudentProfile>) => void;

  // SMTP & Backend Authentication State & Methods
  authEmailContext: string;
  setAuthEmailContext: (email: string) => void;
  authTokenParam: string;
  setAuthTokenParam: (token: string) => void;
  registerStudent: (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<AuthActionResponse>;
  loginStudent: (payload: {
    email: string;
    password: string;
  }) => Promise<AuthActionResponse>;
  verifyStudentEmail: (otpCode: string, emailOverride?: string) => Promise<AuthActionResponse>;
  resendVerificationEmail: (email: string) => Promise<AuthActionResponse>;
  requestPasswordReset: (email: string) => Promise<AuthActionResponse>;
  confirmPasswordReset: (payload: {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<AuthActionResponse>;
  loginWithCredentials: (email: string, name?: string, redirectRoute?: AppRoute) => Promise<void>;
  startDemoMode: (targetRoute?: AppRoute) => void;
  logout: () => Promise<void>;

  // Subject Management Service State
  subjects: EngineeringSubject[];
  activeSubject: EngineeringSubject;
  activeSubjectId: string;
  selectEngineeringSubject: (subjectId: string) => void;
  addEngineeringSubject: (input: CreateSubjectInput) => EngineeringSubject;
  addSyllabusUnitToSubject: (subjectId: string, unit: SyllabusUnit) => void;
  deleteEngineeringSubject: (subjectId: string) => void;
  resetEngineeringSubjects: () => void;

  // Deterministic Engine State
  thresholds: ThresholdConfig;
  updateThresholds: (patch: Partial<ThresholdConfig>) => void;
  baselineScores: Record<ConceptId, number>;
  previousScores: Record<ConceptId, number>;
  attemptCountsBase: Record<ConceptId, number>;
  attempts: AttemptRecord[];
  subjectQuestions: QuestionMetadata[];
  getLessonForConcept: (conceptId: ConceptId) => ConceptLessonData;
  recordAttempt: (attempt: Omit<AttemptRecord, 'id' | 'studentId' | 'timestamp'>) => void;
  boostConceptMastery: (conceptId: ConceptId, newScore: number) => void;
  applyDemoPreset: (preset: 'default_gap' | 'functions_unlocked' | 'high_mastery') => void;

  // Computed Deterministic Outputs
  conceptStates: ConceptMasteryState[];
  overallMastery: number;
  learningPath: LearningPathItem[];
  recommendedNextStep: ConceptMasteryState;
  activeConceptId: ConceptId;
  setActiveConceptId: (id: ConceptId, subjectIdOverride?: string) => void;

  // Adaptive Quiz State
  adaptiveDifficulty: Difficulty;
  setAdaptiveDifficulty: (d: Difficulty) => void;
  recentQuizWindow: boolean[];
  pushQuizWindowResult: (isCorrect: boolean) => void;
  resetQuizWindow: () => void;

  // AI Tutor State
  chatMessages: ChatMessage[];
  isAiTyping: boolean;
  sendTutorMessage: (prompt: string, actionType?: string, conceptOverride?: ConceptId) => Promise<void>;
  answerRapidCheck: (msgId: string, optionIdx: number) => void;
  clearChatContext: () => void;
}

const SESSION_TOKEN_KEY = 'vidyaorbit_jwt_session_v1';
const SESSION_USER_KEY = 'vidyaorbit_student_profile_v1';

const INITIAL_STUDENT: StudentProfile = {
  id: 'usr_alex_01',
  name: 'Alex Chen',
  email: 'alex.chen@cityuniversity.edu',
  role: 'VidyaOrbit Learner',
  subject: 'C Programming',
  selectedTopics: [
    'variables',
    'datatypes',
    'operators',
    'conditions',
    'loops',
    'functions',
    'arrays',
    'pointers',
    'structures',
  ],
  learningGoal: 'Learn C Programming fundamentals and master memory management.',
  level: 'Intermediate',
  explanationStyle: 'Step-by-step with code',
  preferredLanguage: 'English',
  dailyTargetMinutes: 30,
  streakDays: 14,
  diagnosticCompleted: true,
};

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg_init_1',
    sender: 'ai',
    text: 'Hello Alex! I noticed your **Functions** mastery improved from **45% → 52%**, which puts you just **8% away** from unlocking **Pointers (currently 31%)**. Remember that in C, arguments are passed *by value* by default—so modifying a parameter inside a function only changes its stack copy unless you return the new value or pass a pointer address.',
    timestamp: 'Just now',
    actionTag: 'Deterministic Gap Analysis',
  },
  {
    id: 'msg_init_2',
    sender: 'student',
    text: 'That makes total sense! Could you give me a quick check on pass-by-value vs return values in Functions?',
    timestamp: '1m ago',
  },
  {
    id: 'msg_init_3',
    sender: 'ai',
    text: 'Absolutely! Here is a 30-second rapid check tailored to your current **Functions (52%)** module:',
    timestamp: 'Just now',
    rapidCheck: {
      question:
        'If int x = 8 is passed to int triple(int n) { return n * 3; }, and we call triple(x); without assigning the return value, what is x in main()?',
      options: ['[A] 8 (unchanged)', '[B] 24 (tripled)', '[C] 0 (reset)'],
      correctIndex: 0,
    },
  },
];

const INITIAL_ATTEMPTS: AttemptRecord[] = [
  {
    id: 'att_1',
    studentId: 'usr_alex_01',
    questionId: 'q_var_1',
    conceptId: 'variables',
    conceptName: 'Variables',
    selectedOptionIndex: 1,
    correctOptionIndex: 1,
    isCorrect: true,
    difficulty: 'Easy',
    timeTakenSeconds: 22,
    hintsUsed: 0,
    timestamp: '20m ago',
  },
  {
    id: 'att_2',
    studentId: 'usr_alex_01',
    questionId: 'q_loop_1',
    conceptId: 'loops',
    conceptName: 'Loops',
    selectedOptionIndex: 1,
    correctOptionIndex: 1,
    isCorrect: true,
    difficulty: 'Medium',
    timeTakenSeconds: 38,
    hintsUsed: 0,
    timestamp: '16m ago',
  },
  {
    id: 'att_3',
    studentId: 'usr_alex_01',
    questionId: 'q_func_1',
    conceptId: 'functions',
    conceptName: 'Functions',
    selectedOptionIndex: 1,
    correctOptionIndex: 1,
    isCorrect: true,
    difficulty: 'Easy',
    timeTakenSeconds: 41,
    hintsUsed: 1,
    timestamp: '12m ago',
  },
  {
    id: 'att_4',
    studentId: 'usr_alex_01',
    questionId: 'q_func_3',
    conceptId: 'functions',
    conceptName: 'Functions',
    selectedOptionIndex: 0,
    correctOptionIndex: 1,
    isCorrect: false,
    difficulty: 'Hard',
    timeTakenSeconds: 64,
    hintsUsed: 2,
    timestamp: '8m ago',
  },
  {
    id: 'att_5',
    studentId: 'usr_alex_01',
    questionId: 'q_ptr_1',
    conceptId: 'pointers',
    conceptName: 'Pointers',
    selectedOptionIndex: 0,
    correctOptionIndex: 1,
    isCorrect: false,
    difficulty: 'Easy',
    timeTakenSeconds: 55,
    hintsUsed: 2,
    timestamp: '5m ago',
  },
];

const PUBLIC_ROUTES: AppRoute[] = [
  'landing',
  'login',
  'signup',
  'verify-email',
  'forgot-password',
  'reset-password',
];

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jwtToken, setJwtToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
    } catch {
      return false;
    }
  });

  const [route, setRouteState] = useState<AppRoute>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryRoute = params.get('route') as AppRoute | null;
      if (
        queryRoute &&
        [
          'login',
          'signup',
          'verify-email',
          'forgot-password',
          'reset-password',
          'landing',
          'dashboard',
        ].includes(queryRoute)
      ) {
        return queryRoute;
      }
      const hasSession = Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
      return hasSession ? 'dashboard' : 'login';
    } catch {
      return 'login';
    }
  });

  const [authEmailContext, setAuthEmailContext] = useState<string>('alex.chen@cityuniversity.edu');
  const [authTokenParam, setAuthTokenParam] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    } catch {
      return '';
    }
  });

  const [student, setStudent] = useState<StudentProfile>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_USER_KEY);
      if (saved) {
        return { ...INITIAL_STUDENT, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return INITIAL_STUDENT;
  });

  const [subjects, setSubjects] = useState<EngineeringSubject[]>(() =>
    subjectManagementService.getAllSubjects()
  );
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    try {
      return sessionStorage.getItem('vidyaorbit_active_subject_id_v1') || 'subj_cs101';
    } catch {
      return 'subj_cs101';
    }
  });
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);

  // Per-subject state maps so each subject maintains its own isolated mastery, attempts, and chat
  const [subjectBaselinesMap, setSubjectBaselinesMap] = useState<
    Record<string, Record<ConceptId, number>>
  >({});
  const [subjectPreviousMap, setSubjectPreviousMap] = useState<
    Record<string, Record<ConceptId, number>>
  >({});
  const [subjectAttemptCountsMap, setSubjectAttemptCountsMap] = useState<
    Record<string, Record<ConceptId, number>>
  >({});
  const [subjectAttemptsMap, setSubjectAttemptsMap] = useState<Record<string, AttemptRecord[]>>({});
  const [subjectActiveConceptMap, setSubjectActiveConceptMap] = useState<Record<string, ConceptId>>(
    {}
  );
  const [subjectChatsMap, setSubjectChatsMap] = useState<Record<string, ChatMessage[]>>({
    subj_cs101: INITIAL_CHAT,
  });

  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<Difficulty>('Medium');
  const [recentQuizWindow, setRecentQuizWindow] = useState<boolean[]>([true, true]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Route setter with route protection for authenticated views
  const setRoute = (nextRoute: AppRoute) => {
    if (!PUBLIC_ROUTES.includes(nextRoute) && !isAuthenticated) {
      setRouteState('login');
      return;
    }
    setRouteState(nextRoute);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  // Verify existing session token against backend on mount
  useEffect(() => {
    if (!jwtToken || jwtToken.startsWith('demo_')) return;
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          sessionStorage.removeItem(SESSION_TOKEN_KEY);
          sessionStorage.removeItem(SESSION_USER_KEY);
          setJwtToken(null);
          setIsAuthenticated(false);
          if (!PUBLIC_ROUTES.includes(route)) {
            setRouteState('login');
          }
          return;
        }
        const data = await res.json();
        if (data?.user) {
          setStudent((prev) => ({
            ...prev,
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || prev.role,
          }));
        }
      })
      .catch(() => {
        // Keep session active if offline/network hiccup
      });
  }, []);

  const persistSession = (token: string, userPatch: Partial<StudentProfile>) => {
    setJwtToken(token);
    setIsAuthenticated(true);
    setStudent((prev) => {
      const updated = { ...prev, ...userPatch };
      try {
        sessionStorage.setItem(SESSION_TOKEN_KEY, token);
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const updateStudent = (patch: Partial<StudentProfile>) => {
    setStudent((prev) => {
      const updated = { ...prev, ...patch };
      try {
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // --- Production Backend Auth API Calls ---

  const registerStudent = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthActionResponse> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Could not create your account. Please try again.',
          email: data.email,
        };
      }
      setAuthEmailContext(payload.email.trim().toLowerCase());
      if (data.previewVerificationToken) {
        setAuthTokenParam(data.previewVerificationToken);
      }
      return {
        ok: true,
        message: data.message || 'Account created. Please check your email to verify your account.',
        email: data.email,
        deliveryMode: data.deliveryMode,
        previewToken: data.previewVerificationToken,
        previewUrl: data.previewVerificationUrl,
      };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach the authentication server. Please check your connection and try again.',
      };
    }
  };

  const loginStudent = async (payload: {
    email: string;
    password: string;
  }): Promise<AuthActionResponse> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setAuthEmailContext(data.email || payload.email.trim().toLowerCase());
        }
        return {
          ok: false,
          error: data.error || 'Incorrect email or password.',
          code: data.code,
          email: data.email,
        };
      }

      persistSession(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'VidyaOrbit Learner',
        streakDays: data.user.streakDays ?? 1,
      });
      setRouteState('dashboard');
      return {
        ok: true,
        message: data.message || 'Signed in successfully.',
      };
    } catch {
      return {
        ok: false,
        error: 'Login service is temporarily unavailable. Please try again.',
      };
    }
  };

  const verifyStudentEmail = async (
    otpCode: string,
    emailOverride?: string
  ): Promise<AuthActionResponse> => {
    try {
      const targetEmail = (emailOverride || authEmailContext || '').trim().toLowerCase();
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp: otpCode.trim(),
          token: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.email) {
          setAuthEmailContext(data.email);
        }
        return {
          ok: false,
          error: data.error || 'Incorrect verification code. Please try again.',
          code: data.code,
          email: data.email,
        };
      }
      if (data.email) {
        setAuthEmailContext(data.email);
      }
      if (data.token && data.user) {
        persistSession(data.token, {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'VidyaOrbit Learner',
          streakDays: data.user.streakDays ?? 1,
        });
      }
      // Clean URL query params if present
      try {
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        // ignore
      }
      return {
        ok: true,
        message: data.message || 'Email verified successfully.',
        alreadyVerified: data.alreadyVerified,
        email: data.email,
      };
    } catch {
      return {
        ok: false,
        error: 'Unable to verify email right now. Please try again.',
      };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<AuthActionResponse> => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Unable to send verification email. Please try again.',
          retryAfterSeconds: data.retryAfterSeconds,
        };
      }
      return {
        ok: true,
        message: data.message || 'A new 6-digit verification code has been sent to your email.',
        alreadyVerified: data.alreadyVerified,
        deliveryMode: data.deliveryMode,
        retryAfterSeconds: data.retryAfterSeconds ?? 30,
        expiresInSeconds: data.expiresInSeconds ?? 300,
      };
    } catch {
      return {
        ok: false,
        error: 'Unable to send verification email. Please try again.',
      };
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthActionResponse> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Could not send reset email right now. Please try again.',
        };
      }
      setAuthEmailContext(email.trim().toLowerCase());
      if (data.previewResetToken) {
        setAuthTokenParam(data.previewResetToken);
      }
      return {
        ok: true,
        message:
          data.message ||
          'If an account exists for this email, a password reset link has been sent.',
        deliveryMode: data.deliveryMode,
        previewToken: data.previewResetToken,
        previewUrl: data.previewResetUrl,
      };
    } catch {
      return {
        ok: false,
        error: 'Unable to process password reset right now. Please try again.',
      };
    }
  };

  const confirmPasswordReset = async (payload: {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<AuthActionResponse> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          otp: payload.token,
          email: authEmailContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Incorrect or expired reset code. Please request a new code.',
          code: data.code,
        };
      }
      try {
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        // ignore
      }
      return {
        ok: true,
        message: data.message || 'Your password has been reset successfully.',
      };
    } catch {
      return {
        ok: false,
        error: 'Password reset service is temporarily unavailable. Please try again.',
      };
    }
  };

  const loginWithCredentials = async (
    email: string,
    name?: string,
    redirectRoute: AppRoute = 'dashboard'
  ) => {
    persistSession('demo_session_token', {
      email: email || INITIAL_STUDENT.email,
      name: name || INITIAL_STUDENT.name,
    });
    setRouteState(redirectRoute);
  };

  const startDemoMode = (targetRoute: AppRoute = 'dashboard') => {
    persistSession('demo_session_token', {
      id: INITIAL_STUDENT.id,
      name: INITIAL_STUDENT.name,
      email: INITIAL_STUDENT.email,
      role: INITIAL_STUDENT.role,
    });
    setRouteState(targetRoute);
  };

  const logout = async () => {
    try {
      if (jwtToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
      }
    } catch {
      // ignore network errors during logout
    }
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setJwtToken(null);
    setRouteState('login');
  };

  const activeSubject = useMemo(() => {
    return (
      subjects.find((s) => s.id === activeSubjectId) ||
      subjects.find((s) => s.code === 'CS101') ||
      subjects[0]
    );
  }, [subjects, activeSubjectId]);

  const currentCurriculum = useMemo(() => {
    return resolveSubjectCurriculum(activeSubject);
  }, [activeSubject]);

  const baselineScores = useMemo(() => {
    return {
      ...currentCurriculum.baselineScores,
      ...(subjectBaselinesMap[activeSubject.id] || {}),
    };
  }, [currentCurriculum, subjectBaselinesMap, activeSubject.id]);

  const previousScores = useMemo(() => {
    return {
      ...currentCurriculum.previousScores,
      ...(subjectPreviousMap[activeSubject.id] || {}),
    };
  }, [currentCurriculum, subjectPreviousMap, activeSubject.id]);

  const attemptCountsBase = useMemo(() => {
    return {
      ...currentCurriculum.attemptCounts,
      ...(subjectAttemptCountsMap[activeSubject.id] || {}),
    };
  }, [currentCurriculum, subjectAttemptCountsMap, activeSubject.id]);

  const attempts = useMemo(() => {
    return subjectAttemptsMap[activeSubject.id] ?? currentCurriculum.initialAttempts;
  }, [subjectAttemptsMap, activeSubject.id, currentCurriculum]);

  const subjectQuestions = useMemo(() => {
    return getQuestionsForSubject(activeSubject.id);
  }, [activeSubject.id]);

  const selectEngineeringSubject = (subjectId: string) => {
    const found =
      subjects.find((s) => s.id === subjectId) || subjectManagementService.getSubjectById(subjectId);
    if (found) {
      setActiveSubjectId(found.id);
      try {
        sessionStorage.setItem('vidyaorbit_active_subject_id_v1', found.id);
      } catch {
        // ignore
      }
      const bundle = resolveSubjectCurriculum(found);
      setStudent((prev) => ({
        ...prev,
        subject: `${found.name} (${found.code})`,
        selectedTopics: bundle.concepts.map((c) => c.id),
      }));
    }
  };

  const addEngineeringSubject = (input: CreateSubjectInput): EngineeringSubject => {
    const created = subjectManagementService.addSubject(input);
    const all = subjectManagementService.getAllSubjects();
    setSubjects(all);
    setActiveSubjectId(created.id);
    try {
      sessionStorage.setItem('vidyaorbit_active_subject_id_v1', created.id);
    } catch {
      // ignore
    }
    const bundle = resolveSubjectCurriculum(created);
    setStudent((prev) => ({
      ...prev,
      subject: `${created.name} (${created.code})`,
      selectedTopics: bundle.concepts.map((c) => c.id),
    }));
    return created;
  };

  const addSyllabusUnitToSubject = (subjectId: string, unit: SyllabusUnit) => {
    subjectManagementService.addSyllabusUnit(subjectId, unit);
    setSubjects(subjectManagementService.getAllSubjects());
  };

  const deleteEngineeringSubject = (subjectId: string) => {
    subjectManagementService.removeSubject(subjectId);
    const updated = subjectManagementService.getAllSubjects();
    setSubjects(updated);
    if (activeSubjectId === subjectId && updated.length > 0) {
      setActiveSubjectId(updated[0].id);
      setStudent((prev) => ({
        ...prev,
        subject: `${updated[0].name} (${updated[0].code})`,
      }));
    }
  };

  const resetEngineeringSubjects = () => {
    const resetList = subjectManagementService.resetCatalog();
    setSubjects(resetList);
    setActiveSubjectId('subj_cs101');
    setStudent((prev) => ({
      ...prev,
      subject: 'C Programming (CS101)',
    }));
  };

  const updateThresholds = (patch: Partial<ThresholdConfig>) => {
    setThresholds((prev) => ({ ...prev, ...patch }));
  };

  // Compute deterministic concept states for the active subject
  const conceptStates = useMemo(() => {
    return evaluateKnowledgeGraph(
      currentCurriculum.concepts,
      baselineScores,
      previousScores,
      attemptCountsBase,
      attempts,
      thresholds
    );
  }, [
    currentCurriculum.concepts,
    baselineScores,
    previousScores,
    attemptCountsBase,
    attempts,
    thresholds,
  ]);

  // Overall mastery percentage (weighted average across active subject concepts)
  const overallMastery = useMemo(() => {
    if (conceptStates.length === 0) return 68;
    const sum = conceptStates.reduce((acc, c) => acc + c.mastery, 0);
    return Math.round(sum / conceptStates.length);
  }, [conceptStates]);

  // Personalized Learning Path for the active subject
  const learningPath = useMemo(() => {
    return generatePersonalizedLearningPath(conceptStates, student.level, thresholds);
  }, [conceptStates, student.level, thresholds]);

  // Primary recommended next concept (first non-mastered, non-locked concept in the active subject)
  const recommendedNextStep = useMemo(() => {
    const candidate = conceptStates.find(
      (c) => c.rawClassification !== 'Mastered' && !c.isRestrictedByPrerequisite
    );
    return candidate || conceptStates[0];
  }, [conceptStates]);

  const activeConceptId = useMemo(() => {
    const saved = subjectActiveConceptMap[activeSubject.id];
    if (saved && conceptStates.some((c) => c.id === saved)) {
      return saved;
    }
    return recommendedNextStep?.id || conceptStates[0]?.id || 'variables';
  }, [subjectActiveConceptMap, activeSubject.id, conceptStates, recommendedNextStep]);

  const setActiveConceptId = (id: ConceptId, subjectIdOverride?: string) => {
    const targetSubjectId = subjectIdOverride || activeSubject.id;
    setSubjectActiveConceptMap((prev) => ({
      ...prev,
      [targetSubjectId]: id,
    }));
  };

  const getLessonForConcept = (conceptId: ConceptId): ConceptLessonData => {
    const conceptDef =
      currentCurriculum.concepts.find((c) => c.id === conceptId) ||
      currentCurriculum.concepts[0];
    return resolveConceptLesson(activeSubject, conceptDef);
  };

  const chatMessages = useMemo<ChatMessage[]>(() => {
    const existing = subjectChatsMap[activeSubject.id];
    if (existing && existing.length > 0) {
      return existing;
    }
    const focus = recommendedNextStep || conceptStates[0];
    const lockedNode = conceptStates.find((c) => c.isRestrictedByPrerequisite);
    const qSample =
      subjectQuestions.find((q) => q.conceptId === focus?.id) || subjectQuestions[0];

    const welcomeMsg: ChatMessage = {
      id: `msg_init_${activeSubject.id}_1`,
      sender: 'ai',
      text: `Hello ${student.name}! You are currently studying **${activeSubject.name} (${activeSubject.code})**. Your **${focus?.shortName}** mastery improved from **${focus?.previousMastery}% → ${focus?.mastery}%**${
        lockedNode
          ? `, putting you just **${Math.max(0, thresholds.developingMin - (focus?.mastery || 0))}% away** from unlocking **${lockedNode.shortName} (currently ${lockedNode.mastery}%)**`
          : ''
      }. Focus area: *${focus?.deficitLabel}*.`,
      timestamp: 'Just now',
      actionTag: `${activeSubject.code} Gap Analysis`,
      ...(qSample
        ? {
            rapidCheck: {
              question: qSample.question,
              options: qSample.options.slice(0, 3).map((o, i) => `[${String.fromCharCode(65 + i)}] ${o}`),
              correctIndex: Math.min(2, qSample.correctAnswerIndex),
            },
          }
        : {}),
    };
    return [welcomeMsg];
  }, [
    subjectChatsMap,
    activeSubject,
    recommendedNextStep,
    conceptStates,
    subjectQuestions,
    student.name,
    thresholds.developingMin,
  ]);

  const setChatMessagesForActive = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setSubjectChatsMap((prev) => {
      const currentList = prev[activeSubject.id] || chatMessages;
      return {
        ...prev,
        [activeSubject.id]: updater(currentList),
      };
    });
  };

  const recordAttempt = (attemptInput: Omit<AttemptRecord, 'id' | 'studentId' | 'timestamp'>) => {
    const newAttempt: AttemptRecord = {
      ...attemptInput,
      id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      studentId: student.id,
      subjectId: activeSubject.id,
      timestamp: 'Just now',
    };

    const currentConcept = conceptStates.find((c) => c.id === attemptInput.conceptId);
    if (currentConcept) {
      setSubjectPreviousMap((prev) => ({
        ...prev,
        [activeSubject.id]: {
          ...(prev[activeSubject.id] || currentCurriculum.previousScores),
          [attemptInput.conceptId]: currentConcept.mastery,
        },
      }));
    }

    setSubjectAttemptsMap((prev) => {
      const existing = prev[activeSubject.id] ?? currentCurriculum.initialAttempts;
      return {
        ...prev,
        [activeSubject.id]: [...existing, newAttempt],
      };
    });
  };

  const boostConceptMastery = (conceptId: ConceptId, newScore: number) => {
    const current = conceptStates.find((c) => c.id === conceptId);
    if (current) {
      setSubjectPreviousMap((prev) => ({
        ...prev,
        [activeSubject.id]: {
          ...(prev[activeSubject.id] || currentCurriculum.previousScores),
          [conceptId]: current.mastery,
        },
      }));
    }
    setSubjectBaselinesMap((prev) => ({
      ...prev,
      [activeSubject.id]: {
        ...(prev[activeSubject.id] || currentCurriculum.baselineScores),
        [conceptId]: Math.max(0, Math.min(100, newScore)),
      },
    }));
    setSubjectAttemptCountsMap((prev) => ({
      ...prev,
      [activeSubject.id]: {
        ...(prev[activeSubject.id] || currentCurriculum.attemptCounts),
        [conceptId]: Math.max(
          (prev[activeSubject.id]?.[conceptId] ?? currentCurriculum.attemptCounts[conceptId]) || 2,
          thresholds.minAttemptsForMastery
        ),
      },
    }));
  };

  const applyDemoPreset = (preset: 'default_gap' | 'functions_unlocked' | 'high_mastery') => {
    const concepts = currentCurriculum.concepts;
    if (preset === 'default_gap') {
      setSubjectBaselinesMap((prev) => ({
        ...prev,
        [activeSubject.id]: { ...currentCurriculum.baselineScores },
      }));
      setSubjectPreviousMap((prev) => ({
        ...prev,
        [activeSubject.id]: { ...currentCurriculum.previousScores },
      }));
      setSubjectAttemptCountsMap((prev) => ({
        ...prev,
        [activeSubject.id]: { ...currentCurriculum.attemptCounts },
      }));
      setSubjectAttemptsMap((prev) => ({
        ...prev,
        [activeSubject.id]: [...currentCurriculum.initialAttempts],
      }));
    } else if (preset === 'functions_unlocked') {
      const nextBase: Record<ConceptId, number> = {};
      const nextPrev: Record<ConceptId, number> = {};
      const nextCounts: Record<ConceptId, number> = {};
      concepts.forEach((c, idx) => {
        const orig = currentCurriculum.baselineScores[c.id] ?? 60;
        nextPrev[c.id] = orig;
        nextBase[c.id] = idx < concepts.length - 2 ? Math.max(74, orig) : Math.max(52, orig + 14);
        nextCounts[c.id] = Math.max(4, currentCurriculum.attemptCounts[c.id] ?? 3);
      });
      setSubjectPreviousMap((prev) => ({ ...prev, [activeSubject.id]: nextPrev }));
      setSubjectBaselinesMap((prev) => ({ ...prev, [activeSubject.id]: nextBase }));
      setSubjectAttemptCountsMap((prev) => ({ ...prev, [activeSubject.id]: nextCounts }));
      setSubjectAttemptsMap((prev) => ({ ...prev, [activeSubject.id]: [] }));
    } else if (preset === 'high_mastery') {
      const nextBase: Record<ConceptId, number> = {};
      const nextPrev: Record<ConceptId, number> = {};
      const nextCounts: Record<ConceptId, number> = {};
      concepts.forEach((c, idx) => {
        const orig = currentCurriculum.baselineScores[c.id] ?? 65;
        nextPrev[c.id] = Math.max(68, orig);
        nextBase[c.id] = idx < concepts.length - 1 ? Math.max(85, orig + 12) : 74;
        nextCounts[c.id] = 6;
      });
      setSubjectPreviousMap((prev) => ({ ...prev, [activeSubject.id]: nextPrev }));
      setSubjectBaselinesMap((prev) => ({ ...prev, [activeSubject.id]: nextBase }));
      setSubjectAttemptCountsMap((prev) => ({ ...prev, [activeSubject.id]: nextCounts }));
      setSubjectAttemptsMap((prev) => ({ ...prev, [activeSubject.id]: [] }));
    }
  };

  const pushQuizWindowResult = (isCorrect: boolean) => {
    setRecentQuizWindow((prev) => [...prev.slice(-4), isCorrect]);
  };

  const resetQuizWindow = () => {
    setRecentQuizWindow([]);
  };

  const sendTutorMessage = async (
    prompt: string,
    actionType?: string,
    conceptOverride?: ConceptId
  ) => {
    if (!prompt.trim()) return;
    const targetConceptId = conceptOverride || activeConceptId;
    const targetConcept =
      conceptStates.find((c) => c.id === targetConceptId) || recommendedNextStep;

    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'student',
      text: prompt,
      timestamp: 'Just now',
    };

    setChatMessagesForActive((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      const weakConcepts = conceptStates
        .filter((c) => c.rawClassification === 'Weak' || c.rawClassification === 'Knowledge Gap')
        .map((c) => `${c.shortName} (${c.mastery}%)`);

      const prereqNames = targetConcept.prerequisites.map(
        (pid) => conceptStates.find((c) => c.id === pid)?.shortName || pid
      );

      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          actionType,
          studentContext: {
            name: student.name,
            level: student.level,
            subject: `${activeSubject.name} (${activeSubject.code})`,
            concept: targetConcept.shortName,
            mastery: targetConcept.mastery,
            status: targetConcept.status,
            weaknesses: weakConcepts,
            prerequisites: prereqNames,
            recentMistake: targetConcept.deficitLabel,
            explanationStyle: student.explanationStyle,
          },
        }),
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: data.reply || 'Let us walk through this concept together.',
        timestamp: 'Just now',
        actionTag: actionType ? actionType.replace('_', ' ').toUpperCase() : 'PEDAGOGICAL RESPONSE',
      };
      setChatMessagesForActive((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: `Focusing on **${targetConcept.shortName}** in **${activeSubject.name}** (${targetConcept.mastery}% mastery): Remember to watch out for *${targetConcept.deficitLabel}* step by step. Would you like a worked example or a progressive hint?`,
        timestamp: 'Just now',
      };
      setChatMessagesForActive((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const answerRapidCheck = (msgId: string, optionIdx: number) => {
    setChatMessagesForActive((prev) =>
      prev.map((m) =>
        m.id === msgId && m.rapidCheck
          ? { ...m, rapidCheck: { ...m.rapidCheck, selectedIndex: optionIdx } }
          : m
      )
    );
  };

  const clearChatContext = () => {
    setChatMessagesForActive(() => [
      {
        id: 'msg_reset_' + Date.now(),
        sender: 'ai',
        text: `Context refreshed for **${student.name}** in **${activeSubject.name} (${activeSubject.code})** (${student.level} level). Current focus: **${recommendedNextStep.shortName} (${recommendedNextStep.mastery}% mastery)**. How can I help you master this concept?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <LearningContext.Provider
      value={{
        route,
        setRoute,
        isAuthenticated,
        jwtToken,
        student,
        updateStudent,
        authEmailContext,
        setAuthEmailContext,
        authTokenParam,
        setAuthTokenParam,
        registerStudent,
        loginStudent,
        verifyStudentEmail,
        resendVerificationEmail,
        requestPasswordReset,
        confirmPasswordReset,
        loginWithCredentials,
        startDemoMode,
        logout,
        subjects,
        activeSubject,
        activeSubjectId,
        selectEngineeringSubject,
        addEngineeringSubject,
        addSyllabusUnitToSubject,
        deleteEngineeringSubject,
        resetEngineeringSubjects,
        thresholds,
        updateThresholds,
        baselineScores,
        previousScores,
        attemptCountsBase,
        attempts,
        subjectQuestions,
        getLessonForConcept,
        recordAttempt,
        boostConceptMastery,
        applyDemoPreset,
        conceptStates,
        overallMastery,
        learningPath,
        recommendedNextStep,
        activeConceptId,
        setActiveConceptId,
        adaptiveDifficulty,
        setAdaptiveDifficulty,
        recentQuizWindow,
        pushQuizWindowResult,
        resetQuizWindow,
        chatMessages,
        isAiTyping,
        sendTutorMessage,
        answerRapidCheck,
        clearChatContext,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export function useLearning(): LearningContextValue {
  const ctx = useContext(LearningContext);
  if (!ctx) {
    throw new Error('useLearning must be used inside LearningProvider');
  }
  return ctx;
}
