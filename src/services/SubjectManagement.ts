import { ConceptId, Difficulty } from '../types/learning';

export interface SyllabusTopic {
  id: string;
  title: string;
  difficulty: Difficulty;
  prerequisites: string[];
  estimatedMinutes: number;
  mappedConceptId?: ConceptId;
}

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  hours: number;
  summary: string;
  topics: SyllabusTopic[];
  learningOutcomes: string[];
}

export interface EngineeringSubject {
  id: string;
  name: string;
  code: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  department: string;
  credits: number;
  description: string;
  isAdaptiveEngineReady?: boolean;
  syllabus: SyllabusUnit[];
  createdAt?: string;
}

export interface CreateSubjectInput {
  name: string;
  code: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  department?: string;
  credits?: number;
  description?: string;
  syllabus: SyllabusUnit[];
}

export interface SubjectFilterCriteria {
  year?: number;
  semester?: number;
  department?: string;
  searchQuery?: string;
}

/**
 * Default seed catalog of Engineering Subjects across Years 1–3 (Semesters 1–6).
 * Structured so future courses, departments, and syllabus units can be registered seamlessly.
 */
export const INITIAL_ENGINEERING_SUBJECTS: EngineeringSubject[] = [
  {
    id: 'subj_cs101',
    name: 'C Programming',
    code: 'CS101',
    year: 1,
    semester: 1,
    department: 'Computer Science & Engineering (Common 1st Year)',
    credits: 4,
    description:
      'Foundational systems programming course covering variables, data types, operators, control flow, modular functions, arrays, pointers, and user-defined structures.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: C Fundamentals, Variables, Data Types & Operators',
        hours: 9,
        summary:
          'Memory representation, primitive data types, arithmetic/logical/bitwise operators, and type conversions.',
        topics: [
          {
            id: 'cs101_t1',
            title: 'Variables & Memory Allocation',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 20,
            mappedConceptId: 'variables',
          },
          {
            id: 'cs101_t2',
            title: 'Primitive Data Types & sizeof()',
            difficulty: 'Easy',
            prerequisites: ['Variables & Memory Allocation'],
            estimatedMinutes: 25,
            mappedConceptId: 'datatypes',
          },
          {
            id: 'cs101_t3',
            title: 'Arithmetic, Relational & Logical Operators',
            difficulty: 'Easy',
            prerequisites: ['Primitive Data Types & sizeof()'],
            estimatedMinutes: 25,
            mappedConceptId: 'operators',
          },
        ],
        learningOutcomes: [
          'Declare and initialize typed variables in stack memory',
          'Evaluate operator precedence and integer division expressions',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Decision Control & Iterative Loops',
        hours: 9,
        summary:
          'Branching with if-else and switch-case, and iteration using for, while, and do-while loops.',
        topics: [
          {
            id: 'cs101_t4',
            title: 'Conditional Statements (if-else, switch)',
            difficulty: 'Easy',
            prerequisites: ['Arithmetic, Relational & Logical Operators'],
            estimatedMinutes: 25,
            mappedConceptId: 'conditions',
          },
          {
            id: 'cs101_t5',
            title: 'Iterative Loops & Invariants (for, while, do-while)',
            difficulty: 'Medium',
            prerequisites: ['Conditional Statements (if-else, switch)'],
            estimatedMinutes: 30,
            mappedConceptId: 'loops',
          },
        ],
        learningOutcomes: [
          'Write nested conditional logic without assignment-vs-equality bugs',
          'Trace loop counters and termination conditions accurately',
        ],
      },
      {
        unitNumber: 3,
        title: 'Unit III: Modular Functions, Scope & Recursion',
        hours: 10,
        summary:
          'Function prototypes, call-by-value stack frames, return values, and recursive problem solving.',
        topics: [
          {
            id: 'cs101_t6',
            title: 'Functions, Call Stack & Pass-by-Value',
            difficulty: 'Medium',
            prerequisites: ['Iterative Loops & Invariants (for, while, do-while)'],
            estimatedMinutes: 35,
            mappedConceptId: 'functions',
          },
        ],
        learningOutcomes: [
          'Design modular C functions with clean parameter and return contracts',
          'Trace recursive calls and base cases on the call stack',
        ],
      },
      {
        unitNumber: 4,
        title: 'Unit IV: Arrays & Contiguous Memory Indexing',
        hours: 8,
        summary:
          'One-dimensional and two-dimensional arrays, zero-based indexing, and passing arrays to functions.',
        topics: [
          {
            id: 'cs101_t7',
            title: '1D & 2D Arrays and Bounds Checking',
            difficulty: 'Medium',
            prerequisites: ['Iterative Loops & Invariants (for, while, do-while)'],
            estimatedMinutes: 30,
            mappedConceptId: 'arrays',
          },
        ],
        learningOutcomes: [
          'Traverse and manipulate contiguous array elements safely',
          'Avoid off-by-one buffer overflow errors',
        ],
      },
      {
        unitNumber: 5,
        title: 'Unit V: Pointers, Memory Addressing & Structures',
        hours: 12,
        summary:
          'Address-of (&) and dereference (*) operators, call-by-reference, pointer arithmetic, and composite struct records.',
        topics: [
          {
            id: 'cs101_t8',
            title: 'Pointers, Dereferencing & Pass-by-Address',
            difficulty: 'Hard',
            prerequisites: [
              'Functions, Call Stack & Pass-by-Value',
              '1D & 2D Arrays and Bounds Checking',
            ],
            estimatedMinutes: 45,
            mappedConceptId: 'pointers',
          },
          {
            id: 'cs101_t9',
            title: 'Structures (struct), typedef & Arrow Operator (->)',
            difficulty: 'Hard',
            prerequisites: ['Pointers, Dereferencing & Pass-by-Address'],
            estimatedMinutes: 40,
            mappedConceptId: 'structures',
          },
        ],
        learningOutcomes: [
          'Manipulate variables across stack frames using pointer addresses',
          'Model composite records using C structures and structure pointers',
        ],
      },
    ],
  },
  {
    id: 'subj_ec102',
    name: 'Digital Logic & Computer Design',
    code: 'EC102',
    year: 1,
    semester: 2,
    department: 'Electronics & Computer Engineering',
    credits: 4,
    description:
      'Number systems, Boolean algebra, Karnaugh maps, combinational circuits, sequential flip-flops, and register transfer logic.',
    isAdaptiveEngineReady: false,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Number Systems & Boolean Algebra',
        hours: 8,
        summary: 'Binary, octal, hexadecimal representations, 2’s complement arithmetic, and logic gates.',
        topics: [
          {
            id: 'ec102_t1',
            title: 'Binary Arithmetic & 2’s Complement Representation',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
          },
          {
            id: 'ec102_t2',
            title: 'Boolean Theorems & Karnaugh Map (K-Map) Minimization',
            difficulty: 'Medium',
            prerequisites: ['Binary Arithmetic & 2’s Complement Representation'],
            estimatedMinutes: 35,
          },
        ],
        learningOutcomes: [
          'Minimize 4-variable Boolean expressions using K-Maps',
          'Implement universal NAND and NOR gate networks',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Combinational & Sequential Logic Circuits',
        hours: 10,
        summary: 'Adders, multiplexers, decoders, latches, flip-flops (SR, JK, D, T), and synchronous counters.',
        topics: [
          {
            id: 'ec102_t3',
            title: 'Multiplexers, Encoders & Ripple Carry Adders',
            difficulty: 'Medium',
            prerequisites: ['Boolean Theorems & Karnaugh Map (K-Map) Minimization'],
            estimatedMinutes: 30,
          },
          {
            id: 'ec102_t4',
            title: 'Edge-Triggered Flip-Flops & State Machines',
            difficulty: 'Hard',
            prerequisites: ['Multiplexers, Encoders & Ripple Carry Adders'],
            estimatedMinutes: 40,
          },
        ],
        learningOutcomes: [
          'Design combinational datapath components',
          'Analyze sequential state tables and timing diagrams',
        ],
      },
    ],
  },
  {
    id: 'subj_cs201',
    name: 'Data Structures & Algorithms',
    code: 'CS201',
    year: 2,
    semester: 3,
    department: 'Computer Science & Engineering',
    credits: 4,
    description:
      'Asymptotic complexity, linked lists, stacks, queues, binary trees, heaps, hash tables, and graph traversal algorithms in C.',
    isAdaptiveEngineReady: false,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Time Complexity, Arrays & Linked Lists',
        hours: 10,
        summary: 'Big-O analysis, singly/doubly linked lists, and dynamic memory allocation (malloc/free).',
        topics: [
          {
            id: 'cs201_t1',
            title: 'Asymptotic Notation (Big-O, Omega, Theta)',
            difficulty: 'Easy',
            prerequisites: ['Iterative Loops & Invariants (for, while, do-while)'],
            estimatedMinutes: 25,
            mappedConceptId: 'loops',
          },
          {
            id: 'cs201_t2',
            title: 'Singly & Doubly Linked Lists with Pointers',
            difficulty: 'Medium',
            prerequisites: ['Pointers, Dereferencing & Pass-by-Address', 'Structures (struct), typedef & Arrow Operator (->)'],
            estimatedMinutes: 40,
            mappedConceptId: 'pointers',
          },
        ],
        learningOutcomes: [
          'Analyze time and space complexity of iterative and recursive routines',
          'Implement pointer-based linked list insertion and deletion without memory leaks',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Stacks, Queues & Binary Search Trees',
        hours: 12,
        summary: 'LIFO/FIFO ADTs, expression evaluation, tree traversals, and AVL rotations.',
        topics: [
          {
            id: 'cs201_t3',
            title: 'Stack & Queue Implementations (Array & Linked)',
            difficulty: 'Medium',
            prerequisites: ['Singly & Doubly Linked Lists with Pointers'],
            estimatedMinutes: 35,
            mappedConceptId: 'arrays',
          },
          {
            id: 'cs201_t4',
            title: 'Binary Search Trees (BST) & Recursive Traversals',
            difficulty: 'Hard',
            prerequisites: ['Functions, Call Stack & Pass-by-Value', 'Singly & Doubly Linked Lists with Pointers'],
            estimatedMinutes: 45,
            mappedConceptId: 'structures',
          },
        ],
        learningOutcomes: [
          'Convert infix expressions to postfix using stacks',
          'Perform inorder, preorder, and postorder tree traversals',
        ],
      },
    ],
  },
  {
    id: 'subj_cs204',
    name: 'Operating Systems',
    code: 'CS204',
    year: 2,
    semester: 4,
    department: 'Computer Science & Engineering',
    credits: 4,
    description:
      'Process management, CPU scheduling, threads, mutex synchronization, deadlock avoidance, virtual memory paging, and file systems.',
    isAdaptiveEngineReady: false,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Processes, System Calls & CPU Scheduling',
        hours: 10,
        summary: 'Process Control Block (PCB), fork()/exec(), context switching, FCFS, SJF, and Round Robin scheduling.',
        topics: [
          {
            id: 'cs204_t1',
            title: 'Process States, fork() & System Calls',
            difficulty: 'Medium',
            prerequisites: ['Functions, Call Stack & Pass-by-Value'],
            estimatedMinutes: 30,
          },
          {
            id: 'cs204_t2',
            title: 'Preemptive CPU Scheduling & Turnaround Time',
            difficulty: 'Medium',
            prerequisites: ['Process States, fork() & System Calls'],
            estimatedMinutes: 35,
          },
        ],
        learningOutcomes: [
          'Compute waiting and turnaround times across scheduling policies',
          'Understand user mode vs kernel mode transitions',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Concurrency, Deadlocks & Virtual Memory',
        hours: 12,
        summary: 'Semaphores, critical section problem, Banker’s algorithm, page tables, and TLB.',
        topics: [
          {
            id: 'cs204_t3',
            title: 'Mutex Locks, Semaphores & Producer-Consumer',
            difficulty: 'Hard',
            prerequisites: ['Process States, fork() & System Calls'],
            estimatedMinutes: 40,
          },
          {
            id: 'cs204_t4',
            title: 'Paging, Page Faults & LRU Replacement',
            difficulty: 'Hard',
            prerequisites: ['Pointers, Dereferencing & Pass-by-Address'],
            estimatedMinutes: 40,
          },
        ],
        learningOutcomes: [
          'Prevent race conditions using synchronization primitives',
          'Translate virtual addresses to physical frames using page tables',
        ],
      },
    ],
  },
  {
    id: 'subj_cs301',
    name: 'Database Management Systems',
    code: 'CS301',
    year: 3,
    semester: 5,
    department: 'Computer Science & Engineering',
    credits: 3,
    description:
      'Entity-Relationship modeling, relational algebra, SQL queries, functional dependencies, normalization (1NF–BCNF), and ACID transactions.',
    isAdaptiveEngineReady: false,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Relational Model & SQL Querying',
        hours: 9,
        summary: 'ER diagrams, relational schema mapping, joins, aggregations, and subqueries.',
        topics: [
          {
            id: 'cs301_t1',
            title: 'ER Modeling & Relational Schema Keys',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
          },
          {
            id: 'cs301_t2',
            title: 'SQL Joins, GROUP BY & Nested Subqueries',
            difficulty: 'Medium',
            prerequisites: ['ER Modeling & Relational Schema Keys'],
            estimatedMinutes: 35,
          },
        ],
        learningOutcomes: [
          'Design normalized relational schemas from ER specifications',
          'Write complex analytical SQL queries',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Normalization, Indexing & Transactions',
        hours: 10,
        summary: ' Armstrong axioms, 3NF/BCNF decomposition, B+ Tree indexing, and two-phase locking.',
        topics: [
          {
            id: 'cs301_t3',
            title: 'Functional Dependencies & BCNF Normalization',
            difficulty: 'Hard',
            prerequisites: ['ER Modeling & Relational Schema Keys'],
            estimatedMinutes: 40,
          },
        ],
        learningOutcomes: [
          'Eliminate redundancy and update anomalies using BCNF',
          'Ensure serializability in concurrent database transactions',
        ],
      },
    ],
  },
  {
    id: 'subj_cs302',
    name: 'Computer Networks',
    code: 'CS302',
    year: 3,
    semester: 6,
    department: 'Computer Science & Engineering',
    credits: 3,
    description:
      'OSI & TCP/IP protocol stack, data link framing, IPv4 subnetting, routing algorithms (Dijkstra, BGP), TCP congestion control, and DNS/HTTP.',
    isAdaptiveEngineReady: false,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Layered Architecture, Framing & IP Subnetting',
        hours: 10,
        summary: 'OSI vs TCP/IP layers, CRC error detection, CSMA/CD, and CIDR subnet masks.',
        topics: [
          {
            id: 'cs302_t1',
            title: 'OSI 7-Layer Model & Packet Encapsulation',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
          },
          {
            id: 'cs302_t2',
            title: 'IPv4 Addressing, CIDR & Subnet Mask Calculation',
            difficulty: 'Medium',
            prerequisites: ['OSI 7-Layer Model & Packet Encapsulation'],
            estimatedMinutes: 35,
          },
        ],
        learningOutcomes: [
          'Calculate network, broadcast, and host address ranges using CIDR',
          'Trace packet headers across link, network, and transport layers',
        ],
      },
    ],
  },
];

const STORAGE_KEY = 'vidyaorbit_engineering_subjects_v1';

/**
 * Extensible SubjectManagement Service
 * Manages CRUD operations, filtering by Year/Semester, syllabus unit expansion,
 * and topic-level prerequisite lookup for engineering courses.
 */
export class SubjectManagementService {
  private subjects: EngineeringSubject[];

  constructor(initialData: EngineeringSubject[] = INITIAL_ENGINEERING_SUBJECTS) {
    this.subjects = this.loadFromStorage(initialData);
  }

  private loadFromStorage(fallback: EngineeringSubject[]): EngineeringSubject[] {
    if (typeof window === 'undefined') {
      return [...fallback];
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...fallback];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...fallback];
    } catch {
      return [...fallback];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.subjects));
    } catch {
      // ignore storage quota errors
    }
  }

  /**
   * Returns all registered engineering subjects sorted by Year and Semester.
   */
  public getAllSubjects(): EngineeringSubject[] {
    return [...this.subjects].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.semester - b.semester
    );
  }

  /**
   * Look up a subject by its unique ID.
   */
  public getSubjectById(id: string): EngineeringSubject | undefined {
    return this.subjects.find((s) => s.id === id);
  }

  /**
   * Look up a subject by its course code (case-insensitive, e.g. "CS101").
   */
  public getSubjectByCode(code: string): EngineeringSubject | undefined {
    const normalized = code.trim().toUpperCase();
    return this.subjects.find((s) => s.code.toUpperCase() === normalized);
  }

  /**
   * Filter subjects by academic year, semester, department, or search query.
   */
  public filterSubjects(criteria: SubjectFilterCriteria): EngineeringSubject[] {
    return this.getAllSubjects().filter((subject) => {
      if (criteria.year !== undefined && criteria.year > 0 && subject.year !== criteria.year) {
        return false;
      }
      if (
        criteria.semester !== undefined &&
        criteria.semester > 0 &&
        subject.semester !== criteria.semester
      ) {
        return false;
      }
      if (
        criteria.department &&
        !subject.department.toLowerCase().includes(criteria.department.toLowerCase())
      ) {
        return false;
      }
      if (criteria.searchQuery && criteria.searchQuery.trim() !== '') {
        const q = criteria.searchQuery.toLowerCase();
        const matchesName = subject.name.toLowerCase().includes(q);
        const matchesCode = subject.code.toLowerCase().includes(q);
        const matchesTopic = subject.syllabus.some((u) =>
          u.topics.some((t) => t.title.toLowerCase().includes(q))
        );
        if (!matchesName && !matchesCode && !matchesTopic) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Register a new engineering subject into the catalog.
   * Easily extendable for future courses and semesters.
   */
  public addSubject(input: CreateSubjectInput): EngineeringSubject {
    const cleanCode = input.code.trim().toUpperCase();
    const newSubject: EngineeringSubject = {
      id: `subj_${cleanCode.toLowerCase()}_${Date.now()}`,
      name: input.name.trim(),
      code: cleanCode,
      year: input.year,
      semester: input.semester,
      department: input.department?.trim() || 'Computer Science & Engineering',
      credits: input.credits ?? 4,
      description:
        input.description?.trim() ||
        `Engineering syllabus and adaptive learning modules for ${input.name.trim()} (${cleanCode}).`,
      isAdaptiveEngineReady: false,
      syllabus: input.syllabus.length > 0 ? input.syllabus : [],
      createdAt: new Date().toISOString(),
    };

    this.subjects = [...this.subjects, newSubject];
    this.saveToStorage();
    return newSubject;
  }

  /**
   * Append or update a syllabus unit inside an existing subject.
   */
  public addSyllabusUnit(subjectId: string, unit: SyllabusUnit): EngineeringSubject | undefined {
    const idx = this.subjects.findIndex((s) => s.id === subjectId);
    if (idx === -1) return undefined;

    const target = this.subjects[idx];
    const updatedSyllabus = [...target.syllabus, unit].sort(
      (a, b) => a.unitNumber - b.unitNumber
    );
    const updatedSubject: EngineeringSubject = {
      ...target,
      syllabus: updatedSyllabus,
    };

    this.subjects = [
      ...this.subjects.slice(0, idx),
      updatedSubject,
      ...this.subjects.slice(idx + 1),
    ];
    this.saveToStorage();
    return updatedSubject;
  }

  /**
   * Remove a custom subject by ID.
   */
  public removeSubject(subjectId: string): boolean {
    const before = this.subjects.length;
    this.subjects = this.subjects.filter((s) => s.id !== subjectId);
    this.saveToStorage();
    return this.subjects.length < before;
  }

  /**
   * Reset catalog back to the default seed subjects.
   */
  public resetCatalog(): EngineeringSubject[] {
    this.subjects = [...INITIAL_ENGINEERING_SUBJECTS];
    this.saveToStorage();
    return this.getAllSubjects();
  }
}

export const subjectManagementService = new SubjectManagementService();
