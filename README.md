# VidyaOrbit

**An AI-Powered Personalized Learning, Curriculum Management, and Diagnostic Platform for Engineering Students.**

---

## 1. Overview

**VidyaOrbit** is a modern, adaptive engineering education platform that continuously analyzes student performance, detects concept-level knowledge gaps, enforces prerequisite dependencies, generates a personalized learning path, adapts assessment difficulty, and provides context-aware AI tutoring.

### The Problem It Solves

Traditional e-learning platforms and online courses treat every engineering student the same:
- They present a static, linear syllabus regardless of what the student already knows.
- Assessments only output a single overall percentage (e.g., `68%`) without pinpointing which specific foundational concepts caused the errors.
- Students attempt advanced topics (such as **Pointers** or **Dynamic Memory Allocation**) while still having unresolved gaps in prerequisite topics (such as **Functions** and **Stack Frames**).
- Standard AI chatbots give generic answers without knowing the student's current mastery profile, recent mistakes, or curriculum syllabus.

### Who It Is Designed For

- **Undergraduate Engineering Students (Years 1–4, Semesters 1–8)** studying core computer science and engineering subjects such as *Programming for Problem Solving (C)*, *Data Structures & Algorithms*, *Digital Logic*, *Operating Systems*, *Database Management Systems*, and *Engineering Mathematics*.
- **Self-Learners & Beginners** who want clear, step-by-step explanations, progressive hints, and interactive memory visualizations.
- **Educators, Hackathon Judges & Reviewers** evaluating how a deterministic pedagogical engine can work alongside a generative AI tutoring layer.

### How Students Use the Platform

Every student's dashboard immediately answers five core learning questions:
1. **What do I know?** (Concept-by-concept mastery breakdown)
2. **What am I weak at?** (Detected knowledge gaps and mistake patterns)
3. **What should I learn next?** (Next recommended lesson or practice module)
4. **Why is it recommended?** (Transparent prerequisite and mastery reasoning)
5. **Am I improving?** (Before-and-after mastery progression across attempts)

---

## 2. Key Features

- **Student Login & Session Security**: Dedicated student login and account creation flow with HMAC-SHA256 JWT session tokens, salted `scrypt` password hashing, timing-safe password verification, and protected student routes.
- **SMTP Email Verification**: Account registration generates a single-use, short-lived verification token and dispatches an HTML verification email via a backend SMTP service (`nodemailer`) with automatic local outbox fallback for instant preview testing.
- **Password Reset & Recovery**: Secure forgot-password and reset-password workflow using time-limited, single-use tokens and anti-enumeration responses.
- **Diagnostic Tests**: Interactive multi-topic skill assessments with question timers, mark-for-review flags, code snippets, and persistent attempt recording.
- **Performance Analysis**: Granular post-assessment breakdown classifying every concept into **Mastered** (`≥75%`), **Developing** (`60–74%`), **Weak** (`40–59%`), or **Knowledge Gap** (`<40%`), alongside prerequisite lock detection.
- **Mistake Identification**: Automatically identifies incorrect answers from diagnostic and practice attempts, categorizing the underlying conceptual deficit (e.g., *Pass-by-value vs. return assignment*, *Address-of (`&`) vs. dereference (`*`)*).
- **Correct Answer & Step-by-Step Solution**: Displays the student's selected answer alongside the verified correct answer, conceptual explanation, and a structured step-by-step walkthrough.
- **AI Tutor (Text, Voice Transcription & Live Voice)**: Context-aware pedagogical assistant powered by Google Gemini (`gemini-3-flash-preview`, `gemini-3.5-transcribe`, and `gemini-3.8-live`) that provides beginner-friendly explanations, C code examples, progressive hints, and mistake walkthroughs without overriding deterministic grading.
- **Engineering Subjects Catalog**: Pre-configured multi-year engineering courses (`CS101`, `CS201`, `EC202`, `CS301`, `CS304`, `MA101`) with full unit and topic breakdowns.
- **Subject Management**: Extensible `SubjectManagement` service allowing students and educators to filter courses by Year (`1–4`), Semester (`1–8`), Department, or keyword, and register new engineering subjects.
- **Syllabus Management**: Structured unit-by-unit syllabus inspector supporting lecture hours, learning outcomes, topic difficulty, prerequisite tags, and direct links to interactive lessons.
- **Student Progress Tracking**: Longitudinal mastery charts, topic-by-topic before/after comparisons, hint usage analytics, and full attempt history logs.

---

## 3. Student Workflow

```text
Login
   ↓
Dashboard
   ↓
Select Subject
   ↓
Diagnostic Test
   ↓
Performance Analysis
   ↓
Identify Mistakes
   ↓
AI Tutor
   ↓
Improve Weak Areas
```

---

## 4. Technology Stack

VidyaOrbit is built with a full-stack TypeScript architecture where **deterministic rules** handle all grading, mastery calculations, and prerequisite checks, while **Google Gemini models** power the pedagogical explanation and voice layers:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript 7, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React | Responsive white-and-gold (`#D4AF37`) educational interface, interactive modals, and topic search |
| **Build Tooling** | Vite 8, `tsx`, `esbuild` | Fast TypeScript compilation and full-stack development middleware |
| **Backend** | Node.js, Express 4, `ws` (WebSockets) | REST APIs for authentication, AI tutoring, audio transcription, and WebSocket proxy for live voice |
| **Database / Storage** | Backend JSON File Store (`.vidyaorbit-auth-store.json`) + Browser `localStorage` & `sessionStorage` | Persistent storage for student credentials, verification/reset tokens, custom engineering subjects, and active JWT sessions |
| **Authentication** | Node `crypto` (`scryptSync`, `timingSafeEqual`, HMAC-SHA256 JWT) | Salted password hashing, single-use SHA-256 verification/reset tokens, and route protection middleware |
| **AI / ML Services** | Google GenAI SDK (`@google/genai`) | `gemini-3-flash-preview` (AI Tutor), `gemini-3.5-transcribe` (Speech-to-Text), `gemini-3.8-live` (Real-time Live Voice Tutor) |
| **Email / SMTP Service** | `nodemailer` | Backend-only SMTP email dispatch for account verification and password reset links |
| **Deployment Platform** | Node.js / Google Cloud Run (Port `3000`) | Unified Express + Vite production server |

---

## 5. Project Structure

```text
VidyaOrbit/
├── .env.example                        # Environment variable template (no secrets)
├── .gitignore                          # Git ignore rules
├── index.html                          # HTML entry point & metadata
├── metadata.json                       # Applet metadata & capability declarations
├── package.json                        # Project scripts and dependencies
├── README.md                           # Project documentation
├── server.ts                           # Express + WebSocket + Vite full-stack server (Port 3000)
├── tsconfig.json                       # TypeScript compiler configuration
├── vite.config.ts                      # Vite bundler and Tailwind CSS v4 configuration
└── src/
    ├── App.tsx                         # Top-level route viewport and authentication guard
    ├── index.css                       # Global styles, #D4AF37 theme variables, and card hover rules
    ├── main.tsx                        # React DOM root mounting
    ├── components/
    │   ├── AppShell.tsx                # Sidebar navigation, topic search bar, and header controls
    │   ├── InteractiveModals.tsx       # C Memory Step-Through Sandbox & Cohort Analytics modals
    │   └── VoiceAndAudioControls.tsx   # Microphone transcription & Live Voice Coach components
    ├── context/
    │   └── LearningContext.tsx         # Central state for auth, subjects, attempts, and AI tutor
    ├── data/
    │   └── curriculumData.ts           # C Programming concept graph, lessons, and question bank
    ├── engine/
    │   └── deterministicEngine.ts      # Deterministic mastery, prerequisite, and difficulty formulas
    ├── pages/
    │   ├── AssistantAndAnalyticsPages.tsx # AI Tutor, Progress Dashboard, Student Profile, Settings
    │   ├── DashboardPage.tsx           # 5-Question Student Dashboard, Roadmap, and Quick Practice
    │   ├── DiagnosticPages.tsx         # Diagnostic Assessment & Diagnostic Result / Mistake Report
    │   ├── KnowledgeAndPathPages.tsx   # Interactive Knowledge Map & Personalized Learning Path
    │   ├── LandingAndAuthPages.tsx     # Landing, Login, Signup, Verify Email, Forgot/Reset Password, Onboarding
    │   ├── LearningAndQuizPages.tsx    # Adaptive Lesson Content & Adaptive Quiz with 3-Stage Hints
    │   └── SubjectManagementPage.tsx   # Engineering Subject Catalog & Syllabus Unit Inspector
    ├── server/
    │   └── smtpAuthController.ts       # Backend SMTP email & JWT student authentication controller
    ├── services/
    │   └── SubjectManagement.ts        # Extensible EngineeringSubject & SyllabusUnit service
    └── types/
        └── learning.ts                 # Shared TypeScript interfaces and route types
```

---

## 6. Installation & Setup

Follow these steps to run **VidyaOrbit** locally on your machine:

### Prerequisites

- **Node.js** (v20 or newer recommended)
- **npm** (v9 or newer)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd VidyaOrbit
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Gemini API key and optional SMTP server credentials (see Section 7 below).

### Step 4: Start the Full-Stack Development Server

VidyaOrbit runs both the Express backend APIs (`/api/*`), WebSocket server (`/ws/live-voice`), and Vite React frontend on **Port 3000**:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Step 5: Production Build & Start (Optional)

To verify TypeScript types, bundle the frontend assets, and start the production server:

```bash
npm run lint
npm run build
npm start
```

---

## 7. Environment Variables

All sensitive credentials remain strictly on the backend server. Never place API keys or SMTP passwords in frontend code.

Configure the following variables in `.env`:

```env
# Google Gemini API Key for AI Tutor, Audio Transcription, and Live Voice Coaching
GEMINI_API_KEY=

# Public base URL of the application (used in verification and password reset links)
APP_URL=http://localhost:3000

# Backend SMTP Email Configuration (Nodemailer)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM="VidyaOrbit <no-reply@vidyaorbit.edu>"

# Secret key used to sign HMAC-SHA256 student JWT session tokens
JWT_SECRET=
```

> **Note on Local Development Without an External SMTP Server:**  
> If `SMTP_HOST`, `SMTP_USERNAME`, and `SMTP_PASSWORD` are left blank during local development or hackathon demos, VidyaOrbit automatically uses a safe **Local Outbox Fallback** so you can still test registration, email verification links, and password reset links directly in the UI without crashing.

---

## 8. Authentication

VidyaOrbit implements a complete backend-driven student authentication lifecycle in `src/server/smtpAuthController.ts`:

1. **Student Registration (`POST /api/auth/register`)**:
   - Validates full name, email format, password length (`≥8` characters), and password confirmation.
   - Hashes the password using `crypto.scryptSync` with a unique 16-byte random salt.
   - Creates the student account with `emailVerified: false`.
   - Generates a cryptographically random 32-byte token, stores only its SHA-256 hash (`tokenHash`) with a 30-minute expiration, and sends a verification email via SMTP.
2. **Email Verification (`POST /api/auth/verify-email` & `POST /api/auth/resend-verification`)**:
   - Validates the token against stored SHA-256 hashes, checks expiration and single-use status, and marks the student account as `emailVerified: true`.
   - Handles expired, invalid, or already-used tokens gracefully and allows students to request a fresh verification link.
3. **Student Login (`POST /api/auth/login`)**:
   - Verifies email and password using timing-safe comparison (`crypto.timingSafeEqual`).
   - Blocks unverified accounts with `"Please verify your email before logging in."` and provides a one-click **Resend Verification Email** action.
   - Issues a signed HMAC-SHA256 JWT session token valid for 24 hours.
4. **Forgot Password (`POST /api/auth/forgot-password`)**:
   - Generates a 15-minute single-use password reset token and dispatches a reset link via SMTP.
   - Returns a consistent response (`"If an account exists for this email, a password reset link has been sent."`) to prevent email enumeration.
5. **Password Reset (`POST /api/auth/reset-password`)**:
   - Validates the reset token, hashes the new password with a fresh salt, invalidates the token immediately, and returns the student to login.
6. **Session & Route Protection (`GET /api/auth/me` & `POST /api/auth/logout`)**:
   - Protected frontend routes require an active authenticated session; logging out revokes the JWT token on the server and clears client session storage.
   - A pre-verified demo student account (`alex.chen@cityuniversity.edu` / `Password123!`) is also available for immediate evaluation.

---

## 9. Diagnostic Test

The **Diagnostic Assessment** (`/diagnostic`) evaluates a student's baseline understanding across core engineering concepts rather than relying on self-reported confidence:

- **Subject & Topic Selection**: Connects to the active subject selected during Onboarding or from the Subject Catalog.
- **Question Progression & Controls**: Displays question number, total questions, progress bar, current topic badge, difficulty tier (`Easy`, `Medium`, `Hard`), C code snippet, multiple-choice options, **Previous / Next** navigation, and a **Mark for Review** flag.
- **Answer & Time Recording**: Tracks the student's chosen option and time spent (in seconds) per question.
- **Test Progress Preservation**: Recorded attempts are stored in the learning context so navigating between views preserves all progress and updated mastery scores.
- **Deterministic Score Calculation**: Each concept's mastery percentage is computed using the deterministic formula in `src/engine/deterministicEngine.ts`:
  - Accuracy Weight: `50%`
  - Difficulty Weight: `20%` (`Easy = 1.0`, `Medium = 1.3`, `Hard = 1.6`)
  - Hint Independence Weight: `15%`
  - Time Efficiency Weight: `15%`
- **Topic & Mistake Detection**: Immediately updates concept classifications and logs incorrect responses for detailed mistake review.

---

## 10. Performance Analysis

VidyaOrbit goes beyond displaying a single test score. On the **Diagnostic Report** (`/diagnostic-result`) and **Progress Dashboard** (`/progress`), the platform provides:

- **Concept Mastery Classifications**:
  - **Mastered (`75–100%`)**: Strong command of the topic.
  - **Developing (`60–74%`)**: Good foundation; ready for intermediate/hard practice.
  - **Weak (`40–59%`)**: Needs targeted revision before advancing.
  - **Knowledge Gap (`0–39%`)**: Critical gap requiring foundational lesson review.
- **Prerequisite Lock Analysis**: Clearly explains when an advanced topic (such as **Pointers at 31%**) is locked because a required prerequisite (**Functions at 52%**) is below the `60%` threshold.
- **Mistake Identification & Step-by-Step Solution Breakdown**:
  - **Question & Topic**: Identifies the exact concept and code problem where an error occurred.
  - **Student's Answer vs. Correct Answer**: Highlights what the student selected alongside the verified correct option.
  - **Mistake Type / Deficit Label**: Categorizes the conceptual misunderstanding (e.g., *Pass-by-value stack copy*, *Pointer dereferencing*, *Loop boundary condition*).
  - **Detailed Explanation & Step-by-Step Solution**: Walks through the logic step by step so the student understands *why* the correct answer works.

---

## 11. AI Tutor

The **VidyaOrbit AI Tutor** (`/ai-assistant`, plus embedded helpers on the Dashboard and Lesson pages) acts as a supportive pedagogical guide:

- **Strict Separation of Responsibilities**: The AI Tutor never invents grades or overrides prerequisite rules. Instead, it receives the student's deterministic profile (current concept, mastery percentage, level, prerequisite gaps, and recent mistake type) as structured context.
- **Concept & Simple Explanations**: Adapts explanations to the student's chosen level (**Beginner**, **Intermediate**, or **Advanced**) and preferred style (*Step-by-step with code*, *Visual & Analogy-driven*, or *Concise & Formal*).
- **Worked Code Examples**: Generates clean, commented C programs demonstrating the exact concept being studied.
- **Progressive Hints**: Offers conceptual clues that guide the student toward the solution without giving away quiz answers prematurely.
- **Mistake Analysis**: Explains why a specific wrong answer happens in memory (complemented by the interactive **Visual C Memory Step-Through Sandbox**).
- **Practice Questions & Rapid Checks**: Provides interactive 30-second multiple-choice checks inside the chat stream and supports both microphone voice transcription (`gemini-3.5-transcribe`) and live two-way voice tutoring (`gemini-3.8-live`).

---

## 12. Subject & Syllabus System

Engineering curricula are managed through the extensible `SubjectManagement` service (`src/services/SubjectManagement.ts`) and **Subjects & Syllabus** page (`/subjects`).

### Hierarchical Organization

```text
Subject (Name, Code, Department, Credits)
 └── Year (1–4) & Semester (1–8)
      └── Syllabus Unit (Unit Number, Title, Lecture Hours, Learning Outcomes)
           └── Topic (Title, Difficulty, Estimated Minutes, Prerequisites)
                └── Subtopic / Mapped Interactive Concept Lesson
```

- **Pre-Seeded Engineering Subjects**:
  1. `CS101` — Programming for Problem Solving (C) *(Year 1, Semester 1)*
  2. `MA101` — Engineering Mathematics I (Calculus & Linear Algebra) *(Year 1, Semester 1)*
  3. `CS201` — Data Structures & Algorithms *(Year 2, Semester 3)*
  4. `EC202` — Digital Logic & Computer Design *(Year 2, Semester 3)*
  5. `CS301` — Operating Systems *(Year 3, Semester 5)*
  6. `CS304` — Database Management Systems *(Year 3, Semester 5)*
- **Extensibility**: Users can register new engineering subjects or append new syllabus units and topics at runtime with automatic `localStorage` persistence.

---

## 13. Performance & Reliability

VidyaOrbit is engineered for stability during live classroom use and hackathon demonstrations:

- **Persistent State**: Student authentication records persist on the backend (`.vidyaorbit-auth-store.json`), custom subjects and syllabus units persist in `localStorage`, and active student sessions persist in `sessionStorage`.
- **Graceful Error Handling**: All backend endpoints validate inputs and return beginner-friendly error messages (`"Incorrect email or password."`, `"This verification link has expired. Request a new one."`).
- **SMTP & AI Fallback Resilience**: If an external SMTP server or AI API key is unreachable, the platform never crashes—falling back to the local email verification outbox and deterministic context-aware pedagogical responses.
- **Loading States & Duplicate-Request Prevention**: Authentication, verification, password reset, and AI Tutor buttons display clear loading spinners and disable duplicate submissions while requests are in flight.
- **Rate Limiting**: Authentication endpoints enforce per-IP request rate limiting (`20 requests / minute`) to protect against brute-force attempts.
- **Zero-Layout-Shift UI Interactions**: All interactive cards use GPU-accelerated CSS transforms (`transform` and `box-shadow`) scoped to pointer devices (`@media (hover: hover) and (pointer: fine)`) with `prefers-reduced-motion` support so internal text and neighboring cards never shift.

---

## 14. Future Scope

Planned future extensions that build on the current VidyaOrbit architecture:

- **Multi-Institution Cloud SQL / PostgreSQL Backend**: Migrate file-based persistence to a multi-tenant relational database for university-wide deployments.
- **Containerized Code Execution Sandbox**: Allow students to compile and run arbitrary C/C++ and Python programs against automated unit test suites directly inside the browser.
- **Interactive Interactive Quizzes for All Upper-Year Subjects**: Expand the question bank and interactive lessons beyond `CS101` to cover every topic in `CS201`, `CS301`, and `CS304`.
- **Exportable PDF Academic Progress Reports**: Enable students and faculty advisors to download signed semester diagnostic reports.
- **LMS Integration (Canvas / Moodle)**: Sync diagnostic mastery scores with university gradebooks via LTI.

---

## 15. Contribution

Contributions, bug reports, and curriculum additions are welcome!

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/new-engineering-module
   ```
2. Make your changes following the existing TypeScript types (`src/types/learning.ts`) and the VidyaOrbit white-and-gold (`#D4AF37`) design system.
3. Verify that the project compiles cleanly with zero TypeScript errors:
   ```bash
   npm run lint
   npm run build
   ```
4. Submit a Pull Request with a clear summary of your changes.

---

## 16. License

This project is licensed under the **Apache License 2.0** (`SPDX-License-Identifier: Apache-2.0`), as specified in the source file headers.
