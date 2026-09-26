export type ConceptId = string;

export type MasteryStatus =
  | 'Mastered'
  | 'Developing'
  | 'Weak'
  | 'Knowledge Gap'
  | 'Locked';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type StudentLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type AppRoute =
  | 'landing'
  | 'login'
  | 'signup'
  | 'verify-email'
  | 'forgot-password'
  | 'reset-password'
  | 'onboarding'
  | 'dashboard'
  | 'subjects'
  | 'diagnostic'
  | 'diagnostic-result'
  | 'knowledge-map'
  | 'learning-path'
  | 'learning-content'
  | 'adaptive-quiz'
  | 'ai-assistant'
  | 'progress'
  | 'profile'
  | 'settings';

export interface ThresholdConfig {
  masteredMin: number; // default 80
  developingMin: number; // default 60
  weakMin: number; // default 40
  minAttemptsForMastery: number; // default 2
}

export interface QuestionMetadata {
  id: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  topic: string;
  conceptId: ConceptId;
  conceptName: string;
  difficulty: Difficulty;
  question: string;
  codeSnippet?: string;
  codeFilename?: string;
  codeLanguage?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  mistakeType?: string;
  prerequisiteConceptId?: ConceptId;
  hints: {
    hint1: string; // Conceptual clue
    hint2: string; // Suggested approach
    hint3: string; // Partial reasoning
  };
}

export interface AttemptRecord {
  id: string;
  studentId: string;
  subjectId?: string;
  topicId?: string;
  questionId: string;
  conceptId: ConceptId;
  conceptName: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  topic?: string;
  questionText?: string;
  studentAnswer?: string;
  correctAnswer?: string;
  studentAnswerText?: string;
  correctAnswerText?: string;
  explanation?: string;
  mistakeType?: string;
  isCorrect: boolean;
  difficulty: Difficulty;
  timeTakenSeconds: number;
  hintsUsed: number;
  timestamp: string;
}

export interface ConceptNodeDefinition {
  id: ConceptId;
  subjectId?: string;
  name: string;
  shortName: string;
  order: number;
  description: string;
  prerequisites: ConceptId[];
  dependents: ConceptId[];
  deficitLabel: string;
  estimatedMinutes: number;
}

export interface ConceptMasteryState {
  id: ConceptId;
  subjectId?: string;
  name: string;
  shortName: string;
  order: number;
  description: string;
  mastery: number;
  previousMastery: number;
  attemptsCount: number;
  status: MasteryStatus;
  rawClassification: 'Mastered' | 'Developing' | 'Weak' | 'Knowledge Gap';
  prerequisites: ConceptId[];
  dependents: ConceptId[];
  isRestrictedByPrerequisite: boolean;
  blockingPrerequisiteId?: ConceptId;
  blockingPrerequisiteName?: string;
  blockingPrerequisiteMastery?: number;
  deficitLabel: string;
  reason: string;
  recommendedAction: string;
}

export interface LearningPathItem {
  id: string;
  conceptId: ConceptId;
  conceptName: string;
  title: string;
  activityType: 'Completed' | 'Revision' | 'Examples' | 'Practice' | 'Assessment' | 'Introduction';
  status: 'Completed' | 'Recommended' | 'Upcoming' | 'Locked';
  progress: number;
  mastery: number;
  reason: string;
  estimatedMinutes: number;
}

export interface LessonSectionContent {
  whatIsIt: string;
  whyUsed: string;
  syntax: string;
  codeExample: {
    title: string;
    code: string;
    output: string;
    walkthrough: string[];
  };
  commonMistakes: {
    mistakeTitle: string;
    badCode: string;
    fixedCode: string;
    explanation: string;
  }[];
  practicePrompt: {
    question: string;
    code?: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface ConceptLessonData {
  conceptId: ConceptId;
  title: string;
  subtitle: string;
  levels: Record<StudentLevel, LessonSectionContent>;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  subject: string;
  selectedTopics: ConceptId[];
  learningGoal: string;
  level: StudentLevel;
  explanationStyle: 'Step-by-step with code' | 'Visual & Analogy-driven' | 'Concise & Formal';
  preferredLanguage: string;
  dailyTargetMinutes: number;
  streakDays: number;
  diagnosticCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'student';
  text: string;
  timestamp: string;
  actionTag?: string;
  rapidCheck?: {
    question: string;
    options: string[];
    correctIndex: number;
    selectedIndex?: number;
  };
}
