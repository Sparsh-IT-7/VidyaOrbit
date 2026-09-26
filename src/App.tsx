/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import { AppShell } from './components/AppShell';
import {
  LandingPage,
  AuthPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  OnboardingPage,
} from './pages/LandingAndAuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectManagementPage } from './pages/SubjectManagementPage';
import { DiagnosticAssessmentPage, DiagnosticResultPage } from './pages/DiagnosticPages';
import { KnowledgeMapPage, PersonalizedLearningPathPage } from './pages/KnowledgeAndPathPages';
import { LearningContentPage, AdaptiveQuizPage } from './pages/LearningAndQuizPages';
import {
  AiAssistantPage,
  ProgressDashboardPage,
  StudentProfilePage,
  SettingsPage,
} from './pages/AssistantAndAnalyticsPages';

const RouteViewport: React.FC = () => {
  const { route, isAuthenticated } = useLearning();

  if (route === 'landing') {
    return <LandingPage />;
  }
  if (route === 'login') {
    return <AuthPage mode="login" />;
  }
  if (route === 'signup') {
    return <AuthPage mode="signup" />;
  }
  if (route === 'verify-email') {
    return <VerifyEmailPage />;
  }
  if (route === 'forgot-password') {
    return <ForgotPasswordPage />;
  }
  if (route === 'reset-password') {
    return <ResetPasswordPage />;
  }

  // Protect authenticated student routes
  if (!isAuthenticated) {
    return <AuthPage mode="login" />;
  }

  if (route === 'onboarding') {
    return <OnboardingPage />;
  }

  return (
    <AppShell>
      {route === 'dashboard' && <DashboardPage />}
      {route === 'subjects' && <SubjectManagementPage />}
      {route === 'diagnostic' && <DiagnosticAssessmentPage />}
      {route === 'diagnostic-result' && <DiagnosticResultPage />}
      {route === 'knowledge-map' && <KnowledgeMapPage />}
      {route === 'learning-path' && <PersonalizedLearningPathPage />}
      {route === 'learning-content' && <LearningContentPage />}
      {route === 'adaptive-quiz' && <AdaptiveQuizPage />}
      {route === 'ai-assistant' && <AiAssistantPage />}
      {route === 'progress' && <ProgressDashboardPage />}
      {route === 'profile' && <StudentProfilePage />}
      {route === 'settings' && <SettingsPage />}
    </AppShell>
  );
};

export default function App() {
  return (
    <LearningProvider>
      <RouteViewport />
    </LearningProvider>
  );
}
