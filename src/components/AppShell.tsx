import React, { useState, useMemo } from 'react';
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
  Orbit,
  GraduationCap,
  User,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { AppRoute, ConceptId } from '../types/learning';

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
        } rounded-xl bg-[#D4AF37] flex items-center justify-center text-slate-950 shadow-xs`}
      >
        <Orbit className={size === 'sm' ? 'w-4 h-4 stroke-[2.5]' : 'w-5 h-5 stroke-[2.5]'} />
      </div>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">
        Vidya<span className="text-[#B59024]">Orbit</span>
      </span>
    </div>
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
      <User className={isLarge ? 'w-9 h-9 text-[#B59024] stroke-[2.2]' : 'w-4 h-4 text-[#B59024] stroke-[2.5]'} />
    </div>
  );
};

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
  { id: 'diagnostic-result', label: 'Diagnostic Report', icon: Sparkles, group: 'assessment' },
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

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    route,
    setRoute,
    student,
    conceptStates,
    subjects,
    selectEngineeringSubject,
    setActiveConceptId,
    applyDemoPreset,
    logout,
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  // Build unified searchable topic list across interactive lessons and all engineering syllabus topics
  const searchableTopics = useMemo<SearchTopicResult[]>(() => {
    const results: SearchTopicResult[] = [];

    // 1. Interactive Concept Modules
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

    // 2. All Syllabus Topics from SubjectManagement
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
      setRoute('learning-content');
      return;
    }

    if (item.subjectId) {
      selectEngineeringSubject(item.subjectId);
      setSearchQuery('');
      setSearchOpen(false);
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

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex-col justify-between py-5 px-4">
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setRoute('dashboard')}
              className="text-left focus:outline-none"
            >
              <BrandLogo />
            </button>
            <button
              type="button"
              onClick={() => setRoute('landing')}
              title="View Landing Page"
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 transition-colors whitespace-nowrap"
            >
              Home
            </button>
          </div>

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
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 text-[#B59024]" />
              <span>Onboarding</span>
            </button>
            <button
              type="button"
              onClick={logout}
              title="Log Out / View Auth"
              className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white border-r border-slate-200 h-full p-5 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <BrandLogo />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left ${
                        isActive
                          ? 'bg-[#FBF7E8] text-slate-900 border border-[#D4AF37]/50'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#B59024]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
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
              <button
                type="button"
                onClick={() => {
                  setRoute('onboarding');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-xs font-bold text-slate-950"
              >
                Onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 bg-white">
        {/* Top Header */}
        <header className="sticky top-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg relative">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Clean Topic Search Bar without hardcoded subject badge */}
            <div className="relative flex-1">
              <div className="flex items-center gap-2 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus-within:border-[#D4AF37] focus-within:bg-white rounded-xl text-slate-700 transition-colors">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
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
                  placeholder="Search any topic (e.g. Functions, Pointers, Trees, SQL, Deadlocks)..."
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
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {searchOpen && (
                <div className="absolute left-0 right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
                  <div className="px-2.5 py-1 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span>
                      {searchQuery.trim()
                        ? `Matching Topics (${filteredTopics.length})`
                        : 'Search Topics Across Lessons & Syllabus'}
                    </span>
                    <span>Press Enter to open</span>
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
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FBF7E8] text-left transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{item.subtitle}</div>
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
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Interactive State Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FBF7E8] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-semibold text-slate-800 transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B59024]" />
                <span className="hidden sm:inline">Demo States</span>
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

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/30 text-xs font-bold text-[#B59024] tabular-nums whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 fill-[#D4AF37] text-[#B59024]" />
              <span>{student.streakDays}-Day Streak</span>
            </div>

            <button
              type="button"
              onClick={() => setRoute('diagnostic-result')}
              title="View Diagnostic Report"
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37]" />
            </button>

            <button
              type="button"
              onClick={() => setRoute('profile')}
              className="flex items-center gap-2.5 pl-2 border-l border-slate-200 text-left hover:opacity-90 transition-opacity"
            >
              <UserAvatar name={student.name} />
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
                  {student.name}
                </span>
                <span className="text-[11px] text-[#B59024] font-semibold leading-tight whitespace-nowrap">
                  {student.level}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 w-full px-4 md:px-8 py-6 max-w-[1380px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
