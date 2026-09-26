import React, { useState } from 'react';
import {
  BookMarked,
  Plus,
  Search,
  Check,
  Sparkles,
  Clock,
  Layers,
  GraduationCap,
  ArrowRight,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import {
  CreateSubjectInput,
  EngineeringSubject,
  SyllabusUnit,
} from '../services/SubjectManagement';
import { Difficulty } from '../types/learning';

export const SubjectManagementPage: React.FC = () => {
  const {
    subjects,
    activeSubject,
    selectEngineeringSubject,
    addEngineeringSubject,
    addSyllabusUnitToSubject,
    deleteEngineeringSubject,
    resetEngineeringSubjects,
    setRoute,
    setActiveConceptId,
  } = useLearning();

  const [selectedYear, setSelectedYear] = useState<number>(0); // 0 = All Years
  const [selectedSemester, setSelectedSemester] = useState<number>(0); // 0 = All Semesters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedSubjectId, setInspectedSubjectId] = useState<string>(activeSubject.id);

  // Add Subject Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [newYear, setNewYear] = useState<1 | 2 | 3 | 4>(2);
  const [newSemester, setNewSemester] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(3);
  const [newDept, setNewDept] = useState<string>('Computer Science & Engineering');
  const [newCredits, setNewCredits] = useState<number>(4);
  const [newDesc, setNewDesc] = useState<string>('');
  const [newUnitTitle, setNewUnitTitle] = useState<string>('Unit I: Core Foundations');
  const [newUnitTopicsRaw, setNewUnitTopicsRaw] = useState<string>(
    'Introduction & Fundamental Concepts\nProblem Formulation & Analysis\nImplementation & Edge Cases'
  );

  // Add Syllabus Unit inline state
  const [showAddUnitForm, setShowAddUnitForm] = useState<boolean>(false);
  const [unitTitleInput, setUnitTitleInput] = useState<string>('');
  const [unitSummaryInput, setUnitSummaryInput] = useState<string>('');
  const [unitHoursInput, setUnitHoursInput] = useState<number>(8);
  const [unitTopicsInput, setUnitTopicsInput] = useState<string>('');

  const filteredSubjects = subjects.filter((s) => {
    if (selectedYear > 0 && s.year !== selectedYear) return false;
    if (selectedSemester > 0 && s.semester !== selectedSemester) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q);
      const matchDept = s.department.toLowerCase().includes(q);
      const matchSyllabus = s.syllabus.some(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.topics.some((t) => t.title.toLowerCase().includes(q))
      );
      if (!matchName && !matchCode && !matchDept && !matchSyllabus) return false;
    }
    return true;
  });

  const inspectedSubject: EngineeringSubject =
    subjects.find((s) => s.id === inspectedSubjectId) ||
    filteredSubjects[0] ||
    activeSubject;

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    const parsedTopics = newUnitTopicsRaw
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title, idx) => ({
        id: `t_${Date.now()}_${idx}`,
        title,
        difficulty: (idx === 0 ? 'Easy' : idx === 1 ? 'Medium' : 'Hard') as Difficulty,
        prerequisites: idx > 0 ? ['Previous Topic'] : [],
        estimatedMinutes: 30,
      }));

    const input: CreateSubjectInput = {
      name: newName,
      code: newCode,
      year: newYear,
      semester: newSemester,
      department: newDept,
      credits: newCredits,
      description: newDesc,
      syllabus: [
        {
          unitNumber: 1,
          title: newUnitTitle || 'Unit I: Core Foundations',
          hours: 10,
          summary: `Core syllabus module for ${newName} (${newCode.toUpperCase()}).`,
          topics: parsedTopics,
          learningOutcomes: [
            `Understand foundational principles of ${newName}`,
            `Apply ${newCode.toUpperCase()} concepts to engineering problems`,
          ],
        },
      ],
    };

    const created = addEngineeringSubject(input);
    setInspectedSubjectId(created.id);
    setShowAddModal(false);
    setNewName('');
    setNewCode('');
    setNewDesc('');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitTitleInput.trim()) return;

    const nextUnitNum = inspectedSubject.syllabus.length + 1;
    const topicsList = unitTopicsInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title, idx) => ({
        id: `${inspectedSubject.code.toLowerCase()}_u${nextUnitNum}_t${idx + 1}`,
        title,
        difficulty: (idx === 0 ? 'Easy' : 'Medium') as Difficulty,
        prerequisites: [],
        estimatedMinutes: 30,
      }));

    const newUnit: SyllabusUnit = {
      unitNumber: nextUnitNum,
      title: unitTitleInput.trim(),
      hours: unitHoursInput,
      summary:
        unitSummaryInput.trim() ||
        `Unit ${nextUnitNum} syllabus topics for ${inspectedSubject.name}.`,
      topics:
        topicsList.length > 0
          ? topicsList
          : [
              {
                id: `${inspectedSubject.code.toLowerCase()}_u${nextUnitNum}_t1`,
                title: `${unitTitleInput.trim()} — Core Concepts`,
                difficulty: 'Medium',
                prerequisites: [],
                estimatedMinutes: 30,
              },
            ],
      learningOutcomes: [`Master concepts in ${unitTitleInput.trim()}`],
    };

    addSyllabusUnitToSubject(inspectedSubject.id, newUnit);
    setUnitTitleInput('');
    setUnitSummaryInput('');
    setUnitTopicsInput('');
    setShowAddUnitForm(false);
  };

  const totalUnitsCount = inspectedSubject.syllabus.length;
  const totalTopicsCount = inspectedSubject.syllabus.reduce(
    (acc, u) => acc + u.topics.length,
    0
  );
  const totalHoursCount = inspectedSubject.syllabus.reduce((acc, u) => acc + u.hours, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="p-6 md:p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF7E8] border border-[#D4AF37]/40 text-xs font-bold text-[#B59024]">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>SubjectManagement Service · Extensible Engineering Curriculum</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Engineering Subjects &amp; Syllabus Catalog
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Browse engineering courses by Year and Semester, inspect unit-by-unit syllabus data, or
            extend the catalog with new courses and syllabus units.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={resetEngineeringSubjects}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Engineering Subject</span>
          </button>
        </div>
      </section>

      {/* Filter Bar (Year, Semester, Search) */}
      <section className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 pr-1">Year:</span>
          {[
            { label: 'All Years', val: 0 },
            { label: '1st Year', val: 1 },
            { label: '2nd Year', val: 2 },
            { label: '3rd Year', val: 3 },
            { label: '4th Year', val: 4 },
          ].map((yr) => (
            <button
              key={yr.val}
              type="button"
              onClick={() => setSelectedYear(yr.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === yr.val
                  ? 'bg-[#D4AF37] text-slate-950 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {yr.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#D4AF37]"
            >
              <option value={0}>All Semesters (1–8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-[#D4AF37] focus-within:bg-white">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by code, subject, or topic..."
              className="bg-transparent border-0 outline-none text-xs text-slate-900 placeholder:text-slate-400 w-48"
            />
          </div>
        </div>
      </section>

      {/* Main 2-Column Layout: Left = Subject Cards List, Right = Detailed Syllabus Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Engineering Subjects List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-bold text-slate-700">
              Showing {filteredSubjects.length} of {subjects.length} Subjects
            </span>
            <span>Sorted by Year &amp; Semester</span>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="text-sm font-bold text-slate-800">
                No subjects match the current filter
              </div>
              <p className="text-xs text-slate-500">
                Try clearing your Year/Semester filter or add a new engineering subject.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear(0);
                  setSelectedSemester(0);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold"
              >
                Show All Subjects
              </button>
            </div>
          ) : (
            filteredSubjects.map((subj) => {
              const isSelected = subj.id === inspectedSubject.id;
              const isActiveCourse = subj.id === activeSubject.id;
              const topicCount = subj.syllabus.reduce((sum, u) => sum + u.topics.length, 0);

              return (
                <div
                  key={subj.id}
                  onClick={() => setInspectedSubjectId(subj.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-[#FBF7E8]/80 border-[#D4AF37] shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[#D4AF37] font-mono text-xs font-bold">
                          {subj.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Year {subj.year} · Sem {subj.semester}
                        </span>
                        {isActiveCourse && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                            Active Subject
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{subj.name}</h3>
                    </div>

                    <span className="text-xs font-mono text-slate-500 shrink-0">
                      {subj.credits} Credits
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {subj.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {subj.syllabus.length} Syllabus Units · {topicCount} Topics
                    </span>
                    <span className="font-bold text-[#B59024]">Inspect Syllabus →</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Syllabus Data & Course Structure Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
            {/* Subject Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-[#D4AF37] font-mono text-xs font-bold">
                    {inspectedSubject.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/40 text-[#B59024] text-xs font-bold">
                    Year {inspectedSubject.year} · Semester {inspectedSubject.semester}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {inspectedSubject.department}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  {inspectedSubject.name}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {inspectedSubject.description}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                {inspectedSubject.id === activeSubject.id ? (
                  <button
                    type="button"
                    onClick={() => setRoute('dashboard')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Currently Active · Go to Dashboard</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => selectEngineeringSubject(inspectedSubject.id)}
                    className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d] transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Set as Active Subject</span>
                  </button>
                )}

                {inspectedSubject.id !== 'subj_cs101' && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteEngineeringSubject(inspectedSubject.id);
                      setInspectedSubjectId('subj_cs101');
                    }}
                    className="text-[11px] text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Subject</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metadata Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Subject Code</div>
                <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                  {inspectedSubject.code}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Year / Semester</div>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  Y{inspectedSubject.year} · Sem {inspectedSubject.semester}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Syllabus Units</div>
                <div className="text-base font-extrabold font-mono text-[#B59024] mt-0.5">
                  {totalUnitsCount} Units ({totalTopicsCount} Topics)
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Contact Hours</div>
                <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                  {totalHoursCount} hrs ({inspectedSubject.credits} Cr)
                </div>
              </div>
            </div>

            {/* Syllabus Units Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B59024]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Structured Syllabus Data ({totalUnitsCount} Units)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUnitForm((v) => !v)}
                  className="px-3 py-1.5 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/50 text-xs font-bold text-[#B59024] hover:bg-[#D4AF37]/20 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Syllabus Unit</span>
                </button>
              </div>

              {/* Inline Add Syllabus Unit Form */}
              {showAddUnitForm && (
                <form
                  onSubmit={handleAddUnit}
                  className="p-4 rounded-xl bg-[#FBF7E8]/60 border border-[#D4AF37] space-y-3"
                >
                  <div className="text-xs font-bold text-slate-900">
                    Add New Syllabus Unit to {inspectedSubject.name} ({inspectedSubject.code})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Unit Title
                      </label>
                      <input
                        type="text"
                        required
                        value={unitTitleInput}
                        onChange={(e) => setUnitTitleInput(e.target.value)}
                        placeholder={`e.g. Unit ${totalUnitsCount + 1}: Advanced Applications`}
                        className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Lecture Hours
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={24}
                        value={unitHoursInput}
                        onChange={(e) => setUnitHoursInput(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Unit Summary
                    </label>
                    <input
                      type="text"
                      value={unitSummaryInput}
                      onChange={(e) => setUnitSummaryInput(e.target.value)}
                      placeholder="Brief overview of what this syllabus unit covers..."
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Syllabus Topics (one topic per line)
                    </label>
                    <textarea
                      rows={3}
                      value={unitTopicsInput}
                      onChange={(e) => setUnitTopicsInput(e.target.value)}
                      placeholder={'Topic 1: Core Concepts\nTopic 2: Implementation & Analysis'}
                      className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUnitForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-slate-950 text-xs font-bold"
                    >
                      Save Unit
                    </button>
                  </div>
                </form>
              )}

              {inspectedSubject.syllabus.map((unit) => (
                <div
                  key={unit.unitNumber}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="text-xs font-bold text-[#B59024]">
                        Unit 0{unit.unitNumber}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{unit.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{unit.summary}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-xs text-slate-700 shrink-0">
                      {unit.hours} Lecture Hrs
                    </span>
                  </div>

                  {/* Topics inside the Unit */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Syllabus Topics:</div>
                    <div className="grid grid-cols-1 gap-2">
                      {unit.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <BookMarked className="w-3.5 h-3.5 text-[#B59024] shrink-0" />
                              <span className="text-xs font-bold text-slate-900">
                                {topic.title}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-semibold text-slate-600">
                                {topic.difficulty}
                              </span>
                            </div>
                            {topic.prerequisites.length > 0 && (
                              <div className="text-[11px] text-slate-500 pl-5">
                                Prerequisites: {topic.prerequisites.join(', ')}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <span className="text-[11px] font-mono text-slate-400 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {topic.estimatedMinutes}m
                            </span>

                            {topic.mappedConceptId && (
                              <button
                                type="button"
                                onClick={() => {
                                  selectEngineeringSubject(inspectedSubject.id);
                                  setActiveConceptId(topic.mappedConceptId!);
                                  setRoute('learning-content');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#FBF7E8] border border-[#D4AF37]/50 text-[11px] font-bold text-[#B59024] hover:bg-[#D4AF37]/25 flex items-center gap-1"
                              >
                                <span>Open Lesson</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  {unit.learningOutcomes.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Unit Outcomes:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {unit.learningOutcomes.map((outcome) => (
                          <li key={outcome} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal to Register a New Engineering Subject */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#B59024]">
                  Extend SubjectManagement Registry
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Add New Engineering Subject
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Compiler Design"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. CS305"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Engineering Year *
                  </label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Semester *
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) =>
                      setNewSemester(Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)
                    }
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Subject Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Overview of concepts covered in this engineering course..."
                  className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="text-xs font-bold text-[#B59024]">Initial Syllabus Data</div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Unit I Title
                  </label>
                  <input
                    type="text"
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Initial Syllabus Topics (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={newUnitTopicsRaw}
                    onChange={(e) => setNewUnitTopicsRaw(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold hover:bg-[#c59f2d]"
                >
                  Save Engineering Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
