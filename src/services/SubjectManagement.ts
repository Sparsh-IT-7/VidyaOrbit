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
 * Every subject is connected to the deterministic mastery, diagnostic, and learning engine.
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
    id: 'subj_py101',
    name: 'Python Programming',
    code: 'PY101',
    year: 1,
    semester: 1,
    department: 'Computer Science & AI Engineering',
    credits: 4,
    description:
      'High-level Python programming covering dynamic typing, control flow, functions, list comprehensions, dictionaries, and object-oriented programming basics.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Python Variables, Data Types & Control Flow',
        hours: 9,
        summary: 'Dynamic object references, mutability vs immutability, conditional branching, and iteration.',
        topics: [
          {
            id: 'py101_t1',
            title: 'Variables & Object References',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 20,
            mappedConceptId: 'py_variables',
          },
          {
            id: 'py101_t2',
            title: 'Data Types & Mutability',
            difficulty: 'Easy',
            prerequisites: ['Variables & Object References'],
            estimatedMinutes: 20,
            mappedConceptId: 'py_datatypes',
          },
          {
            id: 'py101_t3',
            title: 'Conditions & Truthiness (if-elif-else)',
            difficulty: 'Easy',
            prerequisites: ['Data Types & Mutability'],
            estimatedMinutes: 25,
            mappedConceptId: 'py_conditions',
          },
          {
            id: 'py101_t4',
            title: 'Loops, range() & Iterables',
            difficulty: 'Medium',
            prerequisites: ['Conditions & Truthiness (if-elif-else)'],
            estimatedMinutes: 25,
            mappedConceptId: 'py_loops',
          },
        ],
        learningOutcomes: [
          'Distinguish mutable and immutable Python types',
          'Write idiomatic loops and conditional statements',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Functions, Lists, Dictionaries & OOP Basics',
        hours: 12,
        summary: 'First-class functions, list slicing/comprehensions, hash-map dictionaries, and Python classes.',
        topics: [
          {
            id: 'py101_t5',
            title: 'Functions, Default Args & Scope',
            difficulty: 'Medium',
            prerequisites: ['Loops, range() & Iterables'],
            estimatedMinutes: 30,
            mappedConceptId: 'py_functions',
          },
          {
            id: 'py101_t6',
            title: 'Lists, Slicing & Comprehensions',
            difficulty: 'Medium',
            prerequisites: ['Loops, range() & Iterables'],
            estimatedMinutes: 30,
            mappedConceptId: 'py_lists',
          },
          {
            id: 'py101_t7',
            title: 'Dictionaries & Hashable Keys',
            difficulty: 'Medium',
            prerequisites: ['Lists, Slicing & Comprehensions'],
            estimatedMinutes: 35,
            mappedConceptId: 'py_dictionaries',
          },
          {
            id: 'py101_t8',
            title: 'OOP Basics (Classes, __init__ & self)',
            difficulty: 'Hard',
            prerequisites: ['Functions, Default Args & Scope', 'Dictionaries & Hashable Keys'],
            estimatedMinutes: 40,
            mappedConceptId: 'py_oop',
          },
        ],
        learningOutcomes: [
          'Avoid mutable default argument pitfalls in Python functions',
          'Manipulate nested lists, dictionaries, and class instances',
        ],
      },
    ],
  },
  {
    id: 'subj_ma101',
    name: 'Engineering Mathematics',
    code: 'MA101',
    year: 1,
    semester: 1,
    department: 'Applied Mathematics & Engineering Sciences',
    credits: 4,
    description:
      'Linear algebra, eigenvalues and eigenvectors, differential and multivariable calculus, multiple integrals, vector calculus, and Laplace transforms.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Matrices, Eigenvalues & Differential Calculus',
        hours: 10,
        summary: 'Matrix rank, Gaussian elimination, characteristic equations, Taylor series, and partial derivatives.',
        topics: [
          {
            id: 'ma101_t1',
            title: 'Matrices, Rank & Linear Systems',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'math_matrices',
          },
          {
            id: 'ma101_t2',
            title: 'Eigenvalues & Eigenvectors',
            difficulty: 'Medium',
            prerequisites: ['Matrices, Rank & Linear Systems'],
            estimatedMinutes: 30,
            mappedConceptId: 'math_eigen',
          },
          {
            id: 'ma101_t3',
            title: 'Differential Calculus & Mean Value Theorems',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'math_diff_calc',
          },
          {
            id: 'ma101_t4',
            title: 'Partial Derivatives & Jacobians',
            difficulty: 'Medium',
            prerequisites: ['Differential Calculus & Mean Value Theorems'],
            estimatedMinutes: 30,
            mappedConceptId: 'math_partial',
          },
        ],
        learningOutcomes: [
          'Solve systems of linear equations and compute eigenvalues',
          'Apply partial differentiation and Jacobian determinants',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Multiple Integrals, Vector Calculus & Laplace Transforms',
        hours: 12,
        summary: 'Double and triple integrals, gradient/divergence/curl, and Laplace differential equation solvers.',
        topics: [
          {
            id: 'ma101_t5',
            title: 'Multiple Integrals & Change of Order',
            difficulty: 'Medium',
            prerequisites: ['Partial Derivatives & Jacobians'],
            estimatedMinutes: 35,
            mappedConceptId: 'math_integrals',
          },
          {
            id: 'ma101_t6',
            title: 'Vector Calculus (Grad, Div, Curl & Stokes)',
            difficulty: 'Hard',
            prerequisites: ['Partial Derivatives & Jacobians', 'Multiple Integrals & Change of Order'],
            estimatedMinutes: 40,
            mappedConceptId: 'math_vector',
          },
          {
            id: 'ma101_t7',
            title: 'Laplace Transforms & Inverse Transforms',
            difficulty: 'Hard',
            prerequisites: ['Multiple Integrals & Change of Order'],
            estimatedMinutes: 40,
            mappedConceptId: 'math_laplace',
          },
        ],
        learningOutcomes: [
          'Evaluate double and triple integrals in Cartesian and polar coordinates',
          'Solve initial value differential equations via Laplace transforms',
        ],
      },
    ],
  },
  {
    id: 'subj_ph101',
    name: 'Engineering Physics',
    code: 'PH101',
    year: 1,
    semester: 1,
    department: 'Applied Physics & Materials Science',
    credits: 3,
    description:
      'Wave optics, interference and diffraction, quantum mechanics, Schrödinger wave equation, lasers, optical fibers, and semiconductor physics.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Wave Optics, Lasers & Fiber Optics',
        hours: 9,
        summary: 'Interference in thin films, Fraunhofer diffraction, population inversion in lasers, and numerical aperture.',
        topics: [
          {
            id: 'ph101_t1',
            title: 'Wave Optics, Interference & Diffraction',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'phy_optics',
          },
          {
            id: 'ph101_t2',
            title: 'Lasers & Spontaneous/Stimulated Emission',
            difficulty: 'Medium',
            prerequisites: ['Wave Optics, Interference & Diffraction'],
            estimatedMinutes: 30,
            mappedConceptId: 'phy_lasers',
          },
          {
            id: 'ph101_t3',
            title: 'Optical Fibers & Numerical Aperture',
            difficulty: 'Medium',
            prerequisites: ['Wave Optics, Interference & Diffraction'],
            estimatedMinutes: 25,
            mappedConceptId: 'phy_fiber',
          },
        ],
        learningOutcomes: [
          'Calculate fringe width and diffraction grating resolving power',
          'Determine acceptance angle and numerical aperture of optical fibers',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Quantum Mechanics, Semiconductors & Electromagnetism',
        hours: 10,
        summary: 'De Broglie matter waves, 1D potential box, Fermi level in semiconductors, and Maxwell equations.',
        topics: [
          {
            id: 'ph101_t4',
            title: 'Quantum Mechanics & Schrödinger Equation',
            difficulty: 'Hard',
            prerequisites: ['Wave Optics, Interference & Diffraction'],
            estimatedMinutes: 40,
            mappedConceptId: 'phy_quantum',
          },
          {
            id: 'ph101_t5',
            title: 'Semiconductor Physics & Hall Effect',
            difficulty: 'Medium',
            prerequisites: ['Quantum Mechanics & Schrödinger Equation'],
            estimatedMinutes: 35,
            mappedConceptId: 'phy_semiconductors',
          },
          {
            id: 'ph101_t6',
            title: 'Maxwell Equations & EM Waves',
            difficulty: 'Hard',
            prerequisites: ['Quantum Mechanics & Schrödinger Equation'],
            estimatedMinutes: 35,
            mappedConceptId: 'phy_em',
          },
        ],
        learningOutcomes: [
          'Solve particle-in-a-1D-box energy eigenvalues',
          'Analyze carrier concentration and Fermi energy in p-n junctions',
        ],
      },
    ],
  },
  {
    id: 'subj_ch101',
    name: 'Engineering Chemistry',
    code: 'CH101',
    year: 1,
    semester: 2,
    department: 'Applied Chemistry & Chemical Engineering',
    credits: 3,
    description:
      'Electrochemistry, Nernst equation, battery technology, corrosion prevention, water treatment hardness analysis, polymers, and instrumental spectroscopy.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Electrochemistry, Corrosion & Water Technology',
        hours: 9,
        summary: 'Galvanic cells, Nernst equation, electrochemical corrosion, EDTA titration, and reverse osmosis.',
        topics: [
          {
            id: 'ch101_t1',
            title: 'Electrochemistry & Nernst Equation',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'chem_electro',
          },
          {
            id: 'ch101_t2',
            title: 'Corrosion Mechanisms & Cathodic Protection',
            difficulty: 'Medium',
            prerequisites: ['Electrochemistry & Nernst Equation'],
            estimatedMinutes: 30,
            mappedConceptId: 'chem_corrosion',
          },
          {
            id: 'ch101_t3',
            title: 'Water Hardness & EDTA Complexometry',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'chem_water',
          },
        ],
        learningOutcomes: [
          'Compute single electrode potentials using the Nernst equation',
          'Calculate temporary and permanent hardness in ppm CaCO3 equivalents',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Polymers, Spectroscopy & Green Chemistry',
        hours: 9,
        summary: 'Addition vs condensation polymerization, UV-Vis/IR spectroscopy, and green synthesis.',
        topics: [
          {
            id: 'ch101_t4',
            title: 'Polymers, Elastomers & Conducting Plastics',
            difficulty: 'Medium',
            prerequisites: ['Water Hardness & EDTA Complexometry'],
            estimatedMinutes: 30,
            mappedConceptId: 'chem_polymers',
          },
          {
            id: 'ch101_t5',
            title: 'Spectroscopy (Beer-Lambert Law, UV-Vis & IR)',
            difficulty: 'Hard',
            prerequisites: ['Electrochemistry & Nernst Equation'],
            estimatedMinutes: 35,
            mappedConceptId: 'chem_spectroscopy',
          },
          {
            id: 'ch101_t6',
            title: 'Green Chemistry & Nanomaterials',
            difficulty: 'Medium',
            prerequisites: ['Polymers, Elastomers & Conducting Plastics'],
            estimatedMinutes: 30,
            mappedConceptId: 'chem_green',
          },
        ],
        learningOutcomes: [
          'Apply Beer-Lambert law to quantitative spectrophotometric analysis',
          'Evaluate atom economy in green synthesis pathways',
        ],
      },
    ],
  },
  {
    id: 'subj_ec102',
    name: 'Digital Logic',
    code: 'EC102',
    year: 1,
    semester: 2,
    department: 'Electronics & Computer Engineering',
    credits: 4,
    description:
      'Number systems, Boolean algebra, Karnaugh maps, combinational circuits, multiplexers, sequential flip-flops, and synchronous counters.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Number Systems & Boolean Algebra',
        hours: 8,
        summary: 'Binary, octal, hexadecimal representations, 2’s complement arithmetic, and K-Map minimization.',
        topics: [
          {
            id: 'ec102_t1',
            title: 'Number Systems & 2’s Complement Arithmetic',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'dl_numbers',
          },
          {
            id: 'ec102_t2',
            title: 'Boolean Algebra & Logic Gates',
            difficulty: 'Easy',
            prerequisites: ['Number Systems & 2’s Complement Arithmetic'],
            estimatedMinutes: 25,
            mappedConceptId: 'dl_boolean',
          },
          {
            id: 'ec102_t3',
            title: 'Karnaugh Map (K-Map) Minimization',
            difficulty: 'Medium',
            prerequisites: ['Boolean Algebra & Logic Gates'],
            estimatedMinutes: 35,
            mappedConceptId: 'dl_kmap',
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
            id: 'ec102_t4',
            title: 'Combinational Circuits (Adders, MUX, Decoders)',
            difficulty: 'Medium',
            prerequisites: ['Karnaugh Map (K-Map) Minimization'],
            estimatedMinutes: 30,
            mappedConceptId: 'dl_combinational',
          },
          {
            id: 'ec102_t5',
            title: 'Sequential Flip-Flops (SR, JK, D, T)',
            difficulty: 'Hard',
            prerequisites: ['Combinational Circuits (Adders, MUX, Decoders)'],
            estimatedMinutes: 40,
            mappedConceptId: 'dl_flipflops',
          },
          {
            id: 'ec102_t6',
            title: 'Registers, Counters & Finite State Machines',
            difficulty: 'Hard',
            prerequisites: ['Sequential Flip-Flops (SR, JK, D, T)'],
            estimatedMinutes: 40,
            mappedConceptId: 'dl_counters',
          },
        ],
        learningOutcomes: [
          'Design combinational datapath components using multiplexers',
          'Analyze sequential state tables and synchronous counters',
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
      'Arrays, linked lists, stacks, queues, binary search trees, graphs, searching, sorting, and asymptotic time-complexity analysis.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Arrays, Linked Lists, Stacks & Queues',
        hours: 12,
        summary: 'Contiguous vs pointer-linked structures, LIFO stacks, and FIFO circular queues.',
        topics: [
          {
            id: 'cs201_t1',
            title: 'Arrays & Asymptotic Complexity',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'dsa_arrays',
          },
          {
            id: 'cs201_t2',
            title: 'Singly & Doubly Linked Lists',
            difficulty: 'Medium',
            prerequisites: ['Arrays & Asymptotic Complexity'],
            estimatedMinutes: 35,
            mappedConceptId: 'dsa_linked_lists',
          },
          {
            id: 'cs201_t3',
            title: 'Stacks & Expression Evaluation',
            difficulty: 'Medium',
            prerequisites: ['Arrays & Asymptotic Complexity', 'Singly & Doubly Linked Lists'],
            estimatedMinutes: 30,
            mappedConceptId: 'dsa_stacks',
          },
          {
            id: 'cs201_t4',
            title: 'Queues & Circular Buffers',
            difficulty: 'Medium',
            prerequisites: ['Arrays & Asymptotic Complexity', 'Singly & Doubly Linked Lists'],
            estimatedMinutes: 30,
            mappedConceptId: 'dsa_queues',
          },
        ],
        learningOutcomes: [
          'Analyze time and space complexity of linear data structure operations',
          'Implement pointer-based linked lists, stacks, and circular queues',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Trees, Graphs, Searching & Sorting',
        hours: 14,
        summary: 'Binary search trees, AVL rotations, BFS/DFS graph traversals, binary search, and quicksort/mergesort.',
        topics: [
          {
            id: 'cs201_t5',
            title: 'Binary Search & Divide-and-Conquer Searching',
            difficulty: 'Easy',
            prerequisites: ['Arrays & Asymptotic Complexity'],
            estimatedMinutes: 25,
            mappedConceptId: 'dsa_searching',
          },
          {
            id: 'cs201_t6',
            title: 'Sorting Algorithms (Merge Sort, Quick Sort, Heap Sort)',
            difficulty: 'Medium',
            prerequisites: ['Binary Search & Divide-and-Conquer Searching'],
            estimatedMinutes: 35,
            mappedConceptId: 'dsa_sorting',
          },
          {
            id: 'cs201_t7',
            title: 'Trees, BST & Recursive Traversals',
            difficulty: 'Hard',
            prerequisites: ['Stacks & Expression Evaluation', 'Singly & Doubly Linked Lists'],
            estimatedMinutes: 45,
            mappedConceptId: 'dsa_trees',
          },
          {
            id: 'cs201_t8',
            title: 'Graphs, BFS/DFS & Shortest Paths',
            difficulty: 'Hard',
            prerequisites: ['Queues & Circular Buffers', 'Trees, BST & Recursive Traversals'],
            estimatedMinutes: 45,
            mappedConceptId: 'dsa_graphs',
          },
        ],
        learningOutcomes: [
          'Perform inorder, preorder, and postorder tree traversals',
          'Implement BFS, DFS, and Dijkstra shortest-path algorithms on graphs',
        ],
      },
    ],
  },
  {
    id: 'subj_cs202',
    name: 'Object-Oriented Programming',
    code: 'CS202',
    year: 2,
    semester: 3,
    department: 'Computer Science & Engineering',
    credits: 4,
    description:
      'Classes and objects, encapsulation, constructors, inheritance hierarchies, runtime polymorphism, abstract interfaces, and exception handling.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Classes, Encapsulation & Constructors',
        hours: 10,
        summary: 'Object state and behavior, access modifiers, constructors, destructors, and method overloading.',
        topics: [
          {
            id: 'cs202_t1',
            title: 'Classes, Objects & Instance State',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'oop_classes',
          },
          {
            id: 'cs202_t2',
            title: 'Encapsulation & Access Modifiers',
            difficulty: 'Easy',
            prerequisites: ['Classes, Objects & Instance State'],
            estimatedMinutes: 25,
            mappedConceptId: 'oop_encapsulation',
          },
          {
            id: 'cs202_t3',
            title: 'Constructors, Copy Semantics & Lifecycle',
            difficulty: 'Medium',
            prerequisites: ['Classes, Objects & Instance State'],
            estimatedMinutes: 30,
            mappedConceptId: 'oop_constructors',
          },
        ],
        learningOutcomes: [
          'Design encapsulated classes with clean public interfaces',
          'Distinguish shallow copy from deep copy in constructors',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Inheritance, Polymorphism & Exceptions',
        hours: 12,
        summary: 'Base and derived classes, dynamic dispatch virtual tables, interfaces, and exception safety.',
        topics: [
          {
            id: 'cs202_t4',
            title: 'Inheritance & Class Hierarchies',
            difficulty: 'Medium',
            prerequisites: ['Encapsulation & Access Modifiers', 'Constructors, Copy Semantics & Lifecycle'],
            estimatedMinutes: 35,
            mappedConceptId: 'oop_inheritance',
          },
          {
            id: 'cs202_t5',
            title: 'Polymorphism, Virtual Dispatch & Interfaces',
            difficulty: 'Hard',
            prerequisites: ['Inheritance & Class Hierarchies'],
            estimatedMinutes: 40,
            mappedConceptId: 'oop_polymorphism',
          },
          {
            id: 'cs202_t6',
            title: 'Exception Handling & Generic Templates',
            difficulty: 'Hard',
            prerequisites: ['Polymorphism, Virtual Dispatch & Interfaces'],
            estimatedMinutes: 35,
            mappedConceptId: 'oop_exceptions',
          },
        ],
        learningOutcomes: [
          'Implement runtime polymorphism via method overriding and dynamic dispatch',
          'Write exception-safe resource management code',
        ],
      },
    ],
  },
  {
    id: 'subj_cs203',
    name: 'Computer Organization',
    code: 'CS203',
    year: 2,
    semester: 4,
    department: 'Computer Science & Engineering',
    credits: 4,
    description:
      'Instruction set architecture (ISA), ALU design, IEEE-754 floating-point, instruction pipelining hazards, cache memory mapping, and I/O interrupts.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: ISA, Addressing Modes & ALU Datapath',
        hours: 10,
        summary: 'Register transfer language, addressing modes, Booth multiplication, and IEEE-754 representation.',
        topics: [
          {
            id: 'cs203_t1',
            title: 'ISA, Registers & Addressing Modes',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'co_isa',
          },
          {
            id: 'cs203_t2',
            title: 'ALU Design & IEEE-754 Floating Point',
            difficulty: 'Medium',
            prerequisites: ['ISA, Registers & Addressing Modes'],
            estimatedMinutes: 30,
            mappedConceptId: 'co_alu',
          },
          {
            id: 'cs203_t3',
            title: 'Instruction Pipelining & Hazard Forwarding',
            difficulty: 'Hard',
            prerequisites: ['ALU Design & IEEE-754 Floating Point'],
            estimatedMinutes: 40,
            mappedConceptId: 'co_pipelining',
          },
        ],
        learningOutcomes: [
          'Decode machine instructions and compute effective memory addresses',
          'Detect and resolve RAW data hazards and branch hazards in 5-stage pipelines',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Memory Hierarchy, Cache Mapping & I/O',
        hours: 10,
        summary: 'Direct/set-associative cache mapping, average memory access time (AMAT), and DMA.',
        topics: [
          {
            id: 'cs203_t4',
            title: 'Cache Memory Mapping (Direct, Associative)',
            difficulty: 'Hard',
            prerequisites: ['ISA, Registers & Addressing Modes'],
            estimatedMinutes: 40,
            mappedConceptId: 'co_cache',
          },
          {
            id: 'cs203_t5',
            title: 'Virtual Memory & TLB Address Translation',
            difficulty: 'Hard',
            prerequisites: ['Cache Memory Mapping (Direct, Associative)'],
            estimatedMinutes: 35,
            mappedConceptId: 'co_virtual_mem',
          },
          {
            id: 'cs203_t6',
            title: 'I/O Organization, Interrupts & DMA',
            difficulty: 'Medium',
            prerequisites: ['ISA, Registers & Addressing Modes'],
            estimatedMinutes: 30,
            mappedConceptId: 'co_io',
          },
        ],
        learningOutcomes: [
          'Partition physical addresses into Tag, Index, and Block Offset bits',
          'Compute Average Memory Access Time (AMAT) across multi-level caches',
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
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Processes, System Calls & CPU Scheduling',
        hours: 10,
        summary: 'Process Control Block (PCB), fork()/exec(), context switching, FCFS, SJF, and Round Robin scheduling.',
        topics: [
          {
            id: 'cs204_t1',
            title: 'Processes, Threads & System Calls',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 30,
            mappedConceptId: 'os_processes',
          },
          {
            id: 'cs204_t2',
            title: 'CPU Scheduling Algorithms (FCFS, SJF, RR)',
            difficulty: 'Medium',
            prerequisites: ['Processes, Threads & System Calls'],
            estimatedMinutes: 35,
            mappedConceptId: 'os_scheduling',
          },
          {
            id: 'cs204_t3',
            title: 'Process Synchronization, Mutex & Semaphores',
            difficulty: 'Hard',
            prerequisites: ['Processes, Threads & System Calls'],
            estimatedMinutes: 40,
            mappedConceptId: 'os_sync',
          },
        ],
        learningOutcomes: [
          'Compute waiting and turnaround times across scheduling policies',
          'Prevent race conditions using semaphores and mutex locks',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Deadlocks, Virtual Memory Paging & File Systems',
        hours: 12,
        summary: 'Banker’s algorithm, page tables, TLB, page replacement (LRU/Optimal), and disk scheduling.',
        topics: [
          {
            id: 'cs204_t4',
            title: 'Deadlocks & Banker’s Avoidance Algorithm',
            difficulty: 'Hard',
            prerequisites: ['Process Synchronization, Mutex & Semaphores'],
            estimatedMinutes: 40,
            mappedConceptId: 'os_deadlocks',
          },
          {
            id: 'cs204_t5',
            title: 'Virtual Memory Paging & LRU Replacement',
            difficulty: 'Hard',
            prerequisites: ['CPU Scheduling Algorithms (FCFS, SJF, RR)'],
            estimatedMinutes: 40,
            mappedConceptId: 'os_paging',
          },
          {
            id: 'cs204_t6',
            title: 'File Systems, Inodes & Disk Scheduling',
            difficulty: 'Medium',
            prerequisites: ['Virtual Memory Paging & LRU Replacement'],
            estimatedMinutes: 30,
            mappedConceptId: 'os_filesystems',
          },
        ],
        learningOutcomes: [
          'Determine safe execution sequences using Banker’s algorithm',
          'Translate virtual addresses to physical frames and analyze page fault rates',
        ],
      },
    ],
  },
  {
    id: 'subj_cs301',
    name: 'DBMS',
    code: 'CS301',
    year: 3,
    semester: 5,
    department: 'Computer Science & Engineering',
    credits: 4,
    description:
      'Entity-Relationship (ER) model, relational model, primary/foreign keys, SQL queries & joins, functional dependencies, normalization (1NF–BCNF), and ACID transactions.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: ER Model, Relational Model, Keys & SQL',
        hours: 10,
        summary: 'ER diagrams, relational schema mapping, candidate/foreign keys, joins, and aggregations.',
        topics: [
          {
            id: 'cs301_t1',
            title: 'ER Model & Cardinality Mapping',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'dbms_er_model',
          },
          {
            id: 'cs301_t2',
            title: 'Relational Model & Relational Algebra',
            difficulty: 'Easy',
            prerequisites: ['ER Model & Cardinality Mapping'],
            estimatedMinutes: 25,
            mappedConceptId: 'dbms_relational',
          },
          {
            id: 'cs301_t3',
            title: 'Keys (Super, Candidate, Primary & Foreign Keys)',
            difficulty: 'Medium',
            prerequisites: ['Relational Model & Relational Algebra'],
            estimatedMinutes: 30,
            mappedConceptId: 'dbms_keys',
          },
          {
            id: 'cs301_t4',
            title: 'SQL Queries, Joins & Aggregations',
            difficulty: 'Medium',
            prerequisites: ['Keys (Super, Candidate, Primary & Foreign Keys)'],
            estimatedMinutes: 35,
            mappedConceptId: 'dbms_sql',
          },
        ],
        learningOutcomes: [
          'Design relational schemas and integrity constraints from ER models',
          'Write complex analytical SQL queries with INNER/LEFT joins and GROUP BY',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Normalization & ACID Transactions',
        hours: 10,
        summary: 'Functional dependencies, 1NF/2NF/3NF/BCNF decomposition, concurrency control, and two-phase locking.',
        topics: [
          {
            id: 'cs301_t5',
            title: 'Functional Dependencies & Normalization (1NF–BCNF)',
            difficulty: 'Hard',
            prerequisites: ['Keys (Super, Candidate, Primary & Foreign Keys)'],
            estimatedMinutes: 40,
            mappedConceptId: 'dbms_normalization',
          },
          {
            id: 'cs301_t6',
            title: 'Transactions, ACID & Concurrency Control',
            difficulty: 'Hard',
            prerequisites: ['SQL Queries, Joins & Aggregations', 'Functional Dependencies & Normalization (1NF–BCNF)'],
            estimatedMinutes: 40,
            mappedConceptId: 'dbms_transactions',
          },
        ],
        learningOutcomes: [
          'Eliminate redundancy and update anomalies using 3NF and BCNF',
          'Ensure conflict serializability in concurrent database transactions',
        ],
      },
    ],
  },
  {
    id: 'subj_cs302',
    name: 'Computer Networks',
    code: 'CS302',
    year: 3,
    semester: 5,
    department: 'Computer Science & Engineering',
    credits: 3,
    description:
      'OSI & TCP/IP protocol stack, data link framing, IPv4/CIDR subnetting, routing algorithms (Dijkstra, Distance Vector), TCP congestion control, and DNS/HTTP.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Layered Architecture, Framing & IP Subnetting',
        hours: 10,
        summary: 'OSI vs TCP/IP layers, CRC error detection, CSMA/CD, and CIDR subnet masks.',
        topics: [
          {
            id: 'cs302_t1',
            title: 'OSI & TCP/IP 7-Layer Protocol Stack',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 25,
            mappedConceptId: 'cn_osi',
          },
          {
            id: 'cs302_t2',
            title: 'Data Link Layer, Framing & Error Detection (CRC)',
            difficulty: 'Medium',
            prerequisites: ['OSI & TCP/IP 7-Layer Protocol Stack'],
            estimatedMinutes: 30,
            mappedConceptId: 'cn_datalink',
          },
          {
            id: 'cs302_t3',
            title: 'IPv4 Addressing & CIDR Subnetting',
            difficulty: 'Medium',
            prerequisites: ['Data Link Layer, Framing & Error Detection (CRC)'],
            estimatedMinutes: 35,
            mappedConceptId: 'cn_ip_subnet',
          },
        ],
        learningOutcomes: [
          'Calculate network, broadcast, and usable host ranges using CIDR',
          'Trace packet encapsulation across link, network, and transport layers',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Routing, TCP Transport & Application Protocols',
        hours: 10,
        summary: 'Link-state vs distance-vector routing, 3-way handshake, TCP congestion window, and DNS/HTTP.',
        topics: [
          {
            id: 'cs302_t4',
            title: 'Routing Algorithms (Dijkstra & Distance Vector)',
            difficulty: 'Hard',
            prerequisites: ['IPv4 Addressing & CIDR Subnetting'],
            estimatedMinutes: 40,
            mappedConceptId: 'cn_routing',
          },
          {
            id: 'cs302_t5',
            title: 'TCP vs UDP, Flow & Congestion Control',
            difficulty: 'Hard',
            prerequisites: ['IPv4 Addressing & CIDR Subnetting'],
            estimatedMinutes: 40,
            mappedConceptId: 'cn_tcp',
          },
          {
            id: 'cs302_t6',
            title: 'Application Layer (DNS, HTTP/HTTPS & Sockets)',
            difficulty: 'Easy',
            prerequisites: ['TCP vs UDP, Flow & Congestion Control'],
            estimatedMinutes: 25,
            mappedConceptId: 'cn_app',
          },
        ],
        learningOutcomes: [
          'Trace TCP 3-way handshake and congestion avoidance phases',
          'Analyze DNS resolution and HTTP request/response lifecycles',
        ],
      },
    ],
  },
  {
    id: 'subj_cs303',
    name: 'Web Technologies',
    code: 'CS303',
    year: 3,
    semester: 6,
    department: 'Computer Science & Information Technology',
    credits: 3,
    description:
      'Semantic HTML5 and DOM tree, modern CSS3 Flexbox/Grid layouts, JavaScript closures and event loop, asynchronous Fetch/REST APIs, frontend component state, and web security.',
    isAdaptiveEngineReady: true,
    syllabus: [
      {
        unitNumber: 1,
        title: 'Unit I: Semantic HTML5, CSS3 Layout & Core JavaScript',
        hours: 9,
        summary: 'DOM accessibility, CSS specificity, Flexbox/Grid, closures, and event delegation.',
        topics: [
          {
            id: 'cs303_t1',
            title: 'HTML5 Semantic DOM & Accessibility',
            difficulty: 'Easy',
            prerequisites: [],
            estimatedMinutes: 20,
            mappedConceptId: 'web_html_dom',
          },
          {
            id: 'cs303_t2',
            title: 'CSS3 Box Model, Flexbox & Grid',
            difficulty: 'Easy',
            prerequisites: ['HTML5 Semantic DOM & Accessibility'],
            estimatedMinutes: 25,
            mappedConceptId: 'web_css',
          },
          {
            id: 'cs303_t3',
            title: 'JavaScript Scope, Closures & Event Loop',
            difficulty: 'Medium',
            prerequisites: ['HTML5 Semantic DOM & Accessibility'],
            estimatedMinutes: 35,
            mappedConceptId: 'web_js_core',
          },
        ],
        learningOutcomes: [
          'Build responsive layouts using CSS Grid and Flexbox',
          'Predict execution order across the call stack, microtask queue, and macrotask queue',
        ],
      },
      {
        unitNumber: 2,
        title: 'Unit II: Async APIs, Component Architecture & Web Security',
        hours: 10,
        summary: 'Promises, async/await, RESTful HTTP methods, reactive state management, and XSS/CSRF prevention.',
        topics: [
          {
            id: 'cs303_t4',
            title: 'Async/Await, Promises & REST APIs',
            difficulty: 'Medium',
            prerequisites: ['JavaScript Scope, Closures & Event Loop'],
            estimatedMinutes: 35,
            mappedConceptId: 'web_async_api',
          },
          {
            id: 'cs303_t5',
            title: 'Component State, Props & Client Routing',
            difficulty: 'Hard',
            prerequisites: ['JavaScript Scope, Closures & Event Loop', 'Async/Await, Promises & REST APIs'],
            estimatedMinutes: 40,
            mappedConceptId: 'web_state',
          },
          {
            id: 'cs303_t6',
            title: 'Web Security (CORS, JWT, XSS & CSRF)',
            difficulty: 'Hard',
            prerequisites: ['Async/Await, Promises & REST APIs'],
            estimatedMinutes: 35,
            mappedConceptId: 'web_security',
          },
        ],
        learningOutcomes: [
          'Consume REST endpoints asynchronously with proper error handling',
          'Mitigate XSS, CSRF, and CORS vulnerabilities in full-stack web apps',
        ],
      },
    ],
  },
];

const STORAGE_KEY = 'vidyaorbit_engineering_subjects_v2';

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
      if (!Array.isArray(parsed) || parsed.length === 0) return [...fallback];
      // Ensure all default subjects are present and up to date while keeping custom user subjects
      const merged = [...fallback];
      for (const item of parsed) {
        if (item && item.id && !merged.some((m) => m.id === item.id)) {
          merged.push(item);
        }
      }
      return merged;
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
    const subjId = `subj_${cleanCode.toLowerCase()}_${Date.now()}`;
    const enrichedSyllabus: SyllabusUnit[] = (input.syllabus || []).map((unit, uIdx) => ({
      ...unit,
      topics: unit.topics.map((topic, tIdx) => ({
        ...topic,
        mappedConceptId:
          topic.mappedConceptId || `${cleanCode.toLowerCase()}_c_${uIdx + 1}_${tIdx + 1}`,
      })),
    }));

    const newSubject: EngineeringSubject = {
      id: subjId,
      name: input.name.trim(),
      code: cleanCode,
      year: input.year,
      semester: input.semester,
      department: input.department?.trim() || 'Computer Science & Engineering',
      credits: input.credits ?? 4,
      description:
        input.description?.trim() ||
        `Engineering syllabus and adaptive learning modules for ${input.name.trim()} (${cleanCode}).`,
      isAdaptiveEngineReady: true,
      syllabus: enrichedSyllabus,
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
    const enrichedUnit: SyllabusUnit = {
      ...unit,
      topics: unit.topics.map((topic, tIdx) => ({
        ...topic,
        mappedConceptId:
          topic.mappedConceptId ||
          `${target.code.toLowerCase()}_u${unit.unitNumber}_c${tIdx + 1}`,
      })),
    };
    const updatedSyllabus = [...target.syllabus, enrichedUnit].sort(
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
