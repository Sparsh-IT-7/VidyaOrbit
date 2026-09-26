import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Route,
  Network,
  BookOpen,
  BrainCircuit,
  BarChart3,
  Bot,
  UserCheck,
  Settings,
  Search,
  Bell,
  Flame,
  Sparkles,
  Compass,
  ClipboardCheck,
  Menu,
  X,
  LogOut,
  SlidersHorizontal,
  GraduationCap,
  User,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { AppRoute, ConceptId } from '../types/learning';

export const CUSTOM_LOGO_STORAGE_KEY = 'vidyaorbit_official_logo_src_v1';
export const DEFAULT_LOGO_SRC = '/vidyaorbit-logo.svg';

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'header' }> = ({ size = 'header' }) => {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    try {
      return localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY) || DEFAULT_LOGO_SRC;
    } catch {
      return DEFAULT_LOGO_SRC;
    }
  });

  useEffect(() => {
    const syncLogo = () => {
      try {
        const stored = localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY);
        setLogoSrc(stored || DEFAULT_LOGO_SRC);
      } catch {
        setLogoSrc(DEFAULT_LOGO_SRC);
      }
    };
    window.addEventListener('vidyaorbit-logo-change', syncLogo);
    window.addEventListener('storage', syncLogo);
    return () => {
      window.removeEventListener('vidyaorbit-logo-change', syncLogo);
      window.removeEventListener('storage', syncLogo);
    };
  }, []);

  // Responsive width rules from specification:
  // Mobile: ~100–130px wide (w-[118px])
  // Tablet: ~120–150px wide (md:w-[138px])
  // Desktop: ~140–180px wide (lg:w-[162px])
  const widthClasses =
    size === 'sm'
      ? 'w-[108px] md:w-[126px] lg:w-[144px]'
      : 'w-[118px] md:w-[138px] lg:w-[162px]';

  return (
    <img
      src={logoSrc}
      alt="VidyaOrbit"
      referrerPolicy="no-referrer"
      onError={() => {
        if (logoSrc !== DEFAULT_LOGO_SRC) {
          setLogoSrc(DEFAULT_LOGO_SRC);
        }
      }}
      className={`${widthClasses} h-auto max-h-11 object-contain select-none block shrink-0`}
    />
  );
};

export const UserAvatar: React.FC<{ className?: string; name?: string }> = ({
  className = 'w-8 h-8 rounded-full',
  name = 'Student',
}) => {
  const isLarge = className.includes('w-20') || className.includes('w-16');
  return (
    <div
      title={name}
      aria-label={name}
      className={`${className} bg-[#FBF7E8] border border-[#D4AF37] text-slate-900 flex items-center justify-center shrink-0 select-none`}
    >
      <User
        className={
          isLarge
            ? 'w-9 h-9 text-[#B59024] stroke-[2.2]'
            : 'w-4 h-4 text-[#B59024] stroke-[2.5]'
        }
      />
    </div>
  );
};

interface PrimaryHeaderNavItem {
  id: string;
  label: string;
  route: AppRoute;
  scrollToId?: string;
}

const PRIMARY_HEADER_NAV: PrimaryHeaderNavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', route: 'dashboard' },
  { id: 'nav-subjects', label: 'Subjects', route: 'subjects' },
  { id: 'nav-diagnostic', label: 'Diagnostic Test', route: 'diagnostic' },
  { id: 'nav-performance', label: 'Performance', route: 'diagnostic-result' },
  { id: 'nav-ai-tutor', label: 'AI Tutor', route: 'ai-assistant' },
  {
    id: 'nav-syllabus',
    label: 'Syllabus',
    route: 'subjects',
    scrollToId: 'syllabus-inspector',
  },
];

interface NavItem {
  id: AppRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
  group: 'core' | 'assessment' | 'account';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'core' },
  { id: 'subjects', label: 'Subjects & Syllabus', icon: GraduationCap, group: 'core' },
  { id: 'learning-path', label: 'Learning Path', icon: Route, group: 'core' },
  { id: 'knowledge-map', label: 'Knowledge Map', icon: Network, group: 'core' },
  { id: 'learning-content', label: 'Lessons', icon: BookOpen, group: 'core' },
  { id: 'adaptive-quiz', label: 'Adaptive Quiz', icon: BrainCircuit, group: 'assessment' },
  { id: 'diagnostic', label: 'Diagnostic Test', icon: ClipboardCheck, group: 'assessment' },
  { id: 'diagnostic-result', label: 'Performance Analysis', icon: Sparkles, group: 'assessment' },
  { id: 'progress', label: 'My Progress', icon: BarChart3, group: 'assessment' },
  { id: 'ai-assistant', label: 'AI Tutor', icon: Bot, group: 'assessment' },
  { id: 'profile', label: 'Student Profile', icon: UserCheck, group: 'account' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'account' },
];

interface SearchTopicResult {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  kind: 'concept' | 'syllabus';
  conceptId?: ConceptId;
  subjectId?: string;
}

/**
 * Reusable Common/Global Website Header
 * Layout:
 * [ VidyaOrbit Logo ]   Dashboard  Subjects  Diagnostic Test  Performance  AI Tutor  Syllabus   [ Profile ]
 */
export const GlobalHeader: React.FC<{
  mode?: 'app' | 'public' | 'auth' | 'onboarding';
  onboardingStepText?: string;
}> = ({ mode = 'app', onboardingStepText }) => {
  const {
    route,
    setRoute,
    isAuthenticated,
    student,
    conceptStates,
    subjects,
    selectEngineeringSubject,
    setActiveConceptId,
    applyDemoPreset,
    startDemoMode,
    logout,
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [syllabusFocusActive, setSyllabusFocusActive] = useState(false);

  // Build unified searchable topic list across interactive lessons and all engineering syllabus topics
  const searchableTopics = useMemo<SearchTopicResult[]>(() => {
    const results: SearchTopicResult[] = [];

    conceptStates.forEach((c) => {
      results.push({
        id: `concept_${c.id}`,
        title: c.name,
        subtitle: `Interactive Lesson & Adaptive Quiz · ${c.status}`,
        badge: `${c.mastery}% Mastery`,
        kind: 'concept',
        conceptId: c.id,
      });
    });

    subjects.forEach((subj) => {
      subj.syllabus.forEach((unit) => {
        unit.topics.forEach((topic) => {
          results.push({
            id: `syllabus_${subj.id}_${topic.id}`,
            title: topic.title,
            subtitle: `${subj.name} (${subj.code}) · Unit ${unit.unitNumber}: ${unit.title}`,
            badge: topic.difficulty,
            kind: 'syllabus',
            conceptId: topic.mappedConceptId,
            subjectId: subj.id,
          });
        });
      });
    });

    return results;
  }, [conceptStates, subjects]);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return searchableTopics.slice(0, 9);
    }
    return searchableTopics
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [searchableTopics, searchQuery]);

  const handleSelectTopicResult = (item: SearchTopicResult) => {
    if (item.conceptId) {
      setActiveConceptId(item.conceptId);
      if (item.subjectId) {
        selectEngineeringSubject(item.subjectId);
      }
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setRoute('learning-content');
      return;
    }

    if (item.subjectId) {
      selectEngineeringSubject(item.subjectId);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setRoute('subjects');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredTopics.length > 0) {
      e.preventDefault();
      handleSelectTopicResult(filteredTopics[0]);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const handlePrimaryNavClick = (item: PrimaryHeaderNavItem) => {
    setMobileMenuOpen(false);

    if (item.scrollToId) {
      setSyllabusFocusActive(true);
    } else {
      setSyllabusFocusActive(false);
    }

    if (!isAuthenticated) {
      startDemoMode(item.route);
    } else {
      setRoute(item.route);
    }

    if (item.scrollToId) {
      setTimeout(() => {
        const el = document.getElementById(item.scrollToId!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isNavItemActive = (item: PrimaryHeaderNavItem): boolean => {
    if (mode === 'public' || mode === 'auth' || mode === 'onboarding') {
      return false;
    }
    if (item.id === 'nav-syllabus') {
      return route === 'subjects' && syllabusFocusActive;
    }
    if (item.id === 'nav-subjects') {
      return route === 'subjects' && !syllabusFocusActive;
    }
    if (item.id === 'nav-performance') {
      return route === 'diagnostic-result' || route === 'progress';
    }
    return route === item.route;
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left: Official VidyaOrbit Logo + Main Navigation Links */}
        <div className="flex items-center gap-5 xl:gap-7 min-w-0">
          <button
            type="button"
            onClick={() => {
              setSyllabusFocusActive(false);
              setRoute(isAuthenticated && mode === 'app' ? 'dashboard' : 'landing');
            }}
            aria-label="VidyaOrbit Home"
            className="shrink-0 flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md"
          >
            <BrandLogo />
          </button>

          {/* Main Horizontal Navigation Bar (Desktop) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-1.5"
          >
            {PRIMARY_HEADER_NAV.map((item) => {
              const active = isNavItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePrimaryNavClick(item)}
                  className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Demo Controls & Profile / Auth Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {mode === 'app' && (
            <>
              {/* Topic Search Bar */}
              <div className="hidden md:block relative w-48 xl:w-64">
                <div className="flex items-center gap-2 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus-within:border-[#D4AF37] focus-within:bg-white rounded-xl text-slate-700 transition-colors">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search topics (Functions, SQL...)"
                    className="bg-transparent border-0 outline-none w-full text-slate-900 placeholder:text-slate-400 text-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery('');
                      }}
                      aria-label="Clear search"
                      className="p-0.5 rounded text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {searchOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
                    <div className="px-2.5 py-1 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>
                        {searchQuery.trim()
                          ? `Matching Topics (${filteredTopics.length})`
                          : 'Search Topics Across Syllabus'}
                      </span>
                      <span>Enter ↵</span>
                    </div>

                    {filteredTopics.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No topics found matching &ldquo;{searchQuery}&rdquo;.
                      </div>
                    ) : (
                      filteredTopics.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={() => handleSelectTopicResult(item)}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-[#FBF7E8] text-left transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {item.subtitle}
                            </div>
                          </div>
                          <span className="shrink-0 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#B59024] tabular-nums">
                            <span>{item.badge}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Demo State Switcher */}
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setDemoMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FBF7E8] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#B59024]" />
                  <span className="hidden xl:inline">Demo States</span>
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 space-y-2">
                    <div className="text-xs font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                      Switch Student Progress State
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        applyDemoPreset('default_gap');
                        setDemoMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FBF7E8] transition-colors"
                    >
                      <div className="text-xs font-bold text-[#B59024]">
                        1. Default Diagnostic (68%)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Functions Weak (52%) · Pointers Locked (31%)
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applyDemoPreset('functions_unlocked');
                        setDemoMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FBF7E8] transition-colors"
                    >
                      <div className="text-xs font-bold text-slate-900">
                        2. Functions Revised (72%)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Functions Developing (72%) · Unlocks Pointers!
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applyDemoPreset('high_mastery');
                        setDemoMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#FBF7E8] transition-colors"
                    >
                      <div className="text-xs font-bold text-slate-900">
                        3. High Mastery (85%)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        7/9 Topics Mastered · Pointers Developing (78%)
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/30 text-xs font-bold text-[#B59024] tabular-nums whitespace-nowrap">
                <Flame className="w-3.5 h-3.5 fill-[#D4AF37] text-[#B59024]" />
                <span>{student.streakDays}d</span>
              </div>

              <button
                type="button"
                onClick={() => setRoute('diagnostic-result')}
                title="View Performance Analysis"
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37]" />
              </button>

              {/* [ Profile ] Button */}
              <button
                type="button"
                onClick={() => {
                  setSyllabusFocusActive(false);
                  setRoute('profile');
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-colors ${
                  route === 'profile'
                    ? 'bg-[#FBF7E8] border-[#D4AF37]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <UserAvatar name={student.name} className="w-7 h-7 rounded-full" />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
                    {student.name}
                  </span>
                  <span className="text-[10px] text-[#B59024] font-semibold leading-tight whitespace-nowrap">
                    Profile
                  </span>
                </div>
              </button>
            </>
          )}

          {mode === 'public' && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRoute('login')}
                className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Student Login
              </button>
              <button
                type="button"
                onClick={() => setRoute('signup')}
                className="px-3.5 py-2 rounded-lg bg-[#D4AF37] text-slate-950 text-xs sm:text-sm font-bold hover:bg-[#c59f2d] transition-colors whitespace-nowrap"
              >
                Start Learning
              </button>
            </div>
          )}

          {mode === 'auth' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRoute('landing')}
                className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                Platform Overview
              </button>
              <button
                type="button"
                onClick={() => startDemoMode('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/40 text-xs font-bold text-[#B59024] hover:bg-[#D4AF37]/20 transition-colors whitespace-nowrap"
              >
                Live Demo →
              </button>
            </div>
          )}

          {mode === 'onboarding' && (
            <div className="flex items-center gap-3">
              {onboardingStepText && (
                <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                  {onboardingStepText}
                </span>
              )}
              <button
                type="button"
                onClick={() => setRoute('profile')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800"
              >
                <UserAvatar name={student.name} className="w-6 h-6 rounded-full" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button (Ensures logo on left never overlaps menu button on right) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white border-r border-slate-200 h-full p-5 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRoute(isAuthenticated ? 'dashboard' : 'landing');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left focus:outline-none"
                >
                  <BrandLogo size="sm" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Topic Search */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 focus-within:border-[#D4AF37] rounded-xl">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search any topic..."
                    className="bg-transparent border-0 outline-none w-full text-slate-900 placeholder:text-slate-400 text-xs"
                  />
                </div>
                {searchQuery.trim() && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 max-h-44 overflow-y-auto space-y-1">
                    {filteredTopics.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTopicResult(item)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FBF7E8] text-xs font-semibold text-slate-800 truncate block"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Header Navigation Links in Mobile Menu */}
              <div className="space-y-1">
                <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Main Navigation
                </div>
                {PRIMARY_HEADER_NAV.map((item) => {
                  const active = isNavItemActive(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePrimaryNavClick(item)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left ${
                        active
                          ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]/50'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B59024]" />
                    </button>
                  );
                })}
              </div>

              {/* Additional Study Modules */}
              {isAuthenticated && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    All Learning Modules
                  </div>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = route === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setRoute(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-left ${
                          isActive
                            ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]/50'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-[#B59024]' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRoute('landing');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Home Page
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-xs font-bold text-slate-950"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setRoute('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-xs font-bold text-slate-950"
                >
                  Student Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { route, setRoute, logout } = useLearning();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Global Sticky Top Header with Official VidyaOrbit Logo */}
      <GlobalHeader mode="app" />

      <div className="flex-1 flex min-w-0">
        {/* Desktop Left Sidebar positioned cleanly beneath the fixed h-16 GlobalHeader */}
        <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-white border-r border-slate-200 z-30 flex-col justify-between py-4 px-3.5">
          <div className="flex flex-col gap-5 overflow-y-auto pr-1">
            <nav className="flex flex-col gap-1">
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Learning Journey
              </div>
              {NAV_ITEMS.filter((i) => i.group === 'core').map((item) => {
                const Icon = item.icon;
                const isActive = route === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRoute(item.id)}
                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]/50 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#B59024]' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="px-3 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Practice &amp; AI Help
              </div>
              {NAV_ITEMS.filter((i) => i.group === 'assessment').map((item) => {
                const Icon = item.icon;
                const isActive = route === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRoute(item.id)}
                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]/50 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#B59024]' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="px-3 pt-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Account
              </div>
              {NAV_ITEMS.filter((i) => i.group === 'account').map((item) => {
                const Icon = item.icon;
                const isActive = route === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRoute(item.id)}
                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]/50 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#B59024]' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Quick Links */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRoute('onboarding')}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap"
              >
                <Compass className="w-3.5 h-3.5 text-[#B59024]" />
                <span>Onboarding</span>
              </button>
              <button
                type="button"
                onClick={logout}
                title="Log Out / View Auth"
                className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Page Viewport */}
        <main className="flex-1 lg:pl-60 w-full px-4 md:px-8 py-6 max-w-[1440px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
