import { EngineeringSubject } from '../services/SubjectManagement';
import {
  AttemptRecord,
  ConceptId,
  ConceptLessonData,
  ConceptNodeDefinition,
  QuestionMetadata,
} from '../types/learning';
import { CONCEPT_LESSONS } from './curriculumData';
import {
  SUBJECT_CURRICULUM_BUNDLES,
  SubjectCurriculumBundle,
} from './subjectConcepts';
import { MULTI_SUBJECT_QUESTION_BANK } from './subjectQuestions';

interface RichTopicSnippet {
  syntax: string;
  exampleTitle: string;
  code: string;
  output: string;
  badCode: string;
  fixedCode: string;
}

const TOPIC_RICH_CONTENT: Record<string, RichTopicSnippet> = {
  // Python
  py_variables: {
    syntax: `# Dynamic variable binding in Python\nx = 42\nname = "VidyaOrbit"\nitems = [1, 2, 3]\nalias = items          # Points to same list\ncopy_items = items[:]  # Shallow copy`,
    exampleTitle: 'Reference Binding vs Shallow Copy in Python',
    code: `scores = [85, 90]\nbackup = scores[:]      # Independent shallow copy\nalias = scores          # Shared object reference\nalias.append(95)\nprint("scores:", scores)\nprint("backup:", backup)`,
    output: `scores: [85, 90, 95]\nbackup: [85, 90]`,
    badCode: `backup = scores\nbackup.append(95)  # Mutates original scores list!`,
    fixedCode: `backup = scores.copy()\nbackup.append(95)  # Leaves original scores untouched`,
  },
  py_datatypes: {
    syntax: `# Immutable: int, float, str, tuple, frozenset\ncoords = (10.5, 20.0)\n# Mutable: list, dict, set\ntags = {"python", "dsa"}`,
    exampleTitle: 'Mutable vs Immutable Types & Tuple Unpacking',
    code: `point = (12, 34)\nx, y = point\nword = "orbit"\ncapitalized = word.upper()\nprint(f"x={x}, y={y}, word={capitalized}")`,
    output: `x=12, y=34, word=ORBIT`,
    badCode: `word = "orbit"\nword[0] = "O"  # TypeError: 'str' object does not support item assignment`,
    fixedCode: `word = "orbit"\nword = "O" + word[1:]`,
  },
  py_conditions: {
    syntax: `if score >= 80:\n    status = "Mastered"\nelif score >= 60:\n    status = "Developing"\nelse:\n    status = "Needs Practice"`,
    exampleTitle: 'Truthiness & Value vs Identity Comparison',
    code: `items = [10, 20]\nif items:\n    print("Count:", len(items))\nx = None\nif x is None:\n    print("x is None")`,
    output: `Count: 2\nx is None`,
    badCode: `if x == None:  # Avoid == for None checks`,
    fixedCode: `if x is None:  # Use identity operator 'is' for None`,
  },
  py_loops: {
    syntax: `for idx, val in enumerate(items):\n    print(idx, val)\n\nfor k in range(start, stop, step):\n    ...`,
    exampleTitle: 'Iterating with enumerate() and range()',
    code: `total = 0\nfor num in range(1, 6, 2):\n    total += num\nprint("Odd sum 1..5 =", total)`,
    output: `Odd sum 1..5 = 9`,
    badCode: `for x in nums:\n    if x < 0:\n        nums.remove(x)  # Skips elements while mutating!`,
    fixedCode: `nums = [x for x in nums if x >= 0]`,
  },
  py_functions: {
    syntax: `def compute_average(values, round_digits=2):\n    if not values:\n        return 0.0\n    return round(sum(values) / len(values), round_digits)`,
    exampleTitle: 'Safe Default Arguments in Python Functions',
    code: `def add_tag(tag, tags=None):\n    if tags is None:\n        tags = []\n    tags.append(tag)\n    return tags\n\nprint(add_tag("AI"))\nprint(add_tag("ML"))`,
    output: `['AI']\n['ML']`,
    badCode: `def add_tag(tag, tags=[]):\n    tags.append(tag)  # Shared across all calls!\n    return tags`,
    fixedCode: `def add_tag(tag, tags=None):\n    tags = [] if tags is None else tags\n    tags.append(tag)\n    return tags`,
  },
  py_lists: {
    syntax: `# List slicing & comprehension\nsub = arr[start:stop:step]\nevens = [x * 2 for x in arr if x % 2 == 0]`,
    exampleTitle: 'List Comprehensions & Slice Reversal',
    code: `nums = [1, 2, 3, 4, 5]\nsquares = [n * n for n in nums if n % 2 == 1]\nprint("Odd squares:", squares)\nprint("Reversed:", nums[::-1])`,
    output: `Odd squares: [1, 9, 25]\nReversed: [5, 4, 3, 2, 1]`,
    badCode: `grid = [[0] * 3] * 3\ngrid[0][0] = 9  # Mutates all 3 rows!`,
    fixedCode: `grid = [[0] * 3 for _ in range(3)]\ngrid[0][0] = 9  # Mutates only row 0`,
  },
  py_dictionaries: {
    syntax: `counts = {}\nfor ch in text:\n    counts[ch] = counts.get(ch, 0) + 1`,
    exampleTitle: 'Frequency Counting with dict.get()',
    code: `grades = {"Arjun": 88, "Meera": 94}\nprint("Meera:", grades.get("Meera", 0))\nprint("Guest:", grades.get("Guest", 0))`,
    output: `Meera: 94\nGuest: 0`,
    badCode: `val = grades["Guest"]  # Raises KeyError if missing`,
    fixedCode: `val = grades.get("Guest", 0)  # Safe fallback`,
  },
  py_oop: {
    syntax: `class Student:\n    def __init__(self, name: str, mastery: int):\n        self.name = name\n        self.mastery = mastery`,
    exampleTitle: 'Instance Attributes Inside __init__',
    code: `class Counter:\n    def __init__(self):\n        self.count = 0\n    def inc(self):\n        self.count += 1\n\nc1, c2 = Counter(), Counter()\nc1.inc()\nprint(c1.count, c2.count)`,
    output: `1 0`,
    badCode: `class Bag:\n    items = []  # Class attribute shared by all instances!`,
    fixedCode: `class Bag:\n    def __init__(self):\n        self.items = []  # Per-instance attribute`,
  },

  // DSA
  dsa_arrays: {
    syntax: `// Two-Pointer Array Traversal: O(N) time, O(1) space\nint left = 0, right = n - 1;\nwhile (left < right) {\n    swap(&arr[left++], &arr[right--]);\n}`,
    exampleTitle: 'Prefix Sum & O(1) Range Sum Query',
    code: `// Prefix sum array construction\nint arr[4] = {2, 5, 3, 7};\nint pref[4] = {2, 7, 10, 17};\n// Sum from index L=1 to R=3:\nint rangeSum = pref[3] - pref[0]; // 17 - 2 = 15`,
    output: `Range Sum [1..3] = 15 (O(1) query time)`,
    badCode: `for (int i = 0; i <= n; i++) sum += arr[i]; // Out-of-bounds at i == n`,
    fixedCode: `for (int i = 0; i < n; i++) sum += arr[i];  // Safe 0..n-1 bounds`,
  },
  dsa_linked_lists: {
    syntax: `struct Node {\n    int data;\n    struct Node* next;\n};\n// Insert newNode after curr:\nnewNode->next = curr->next;\ncurr->next = newNode;`,
    exampleTitle: 'In-Place Singly Linked List Reversal',
    code: `Node *prev = NULL, *curr = head;\nwhile (curr != NULL) {\n    Node *nextTemp = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = nextTemp;\n}\nhead = prev;`,
    output: `List 10 -> 20 -> 30 reversed to 30 -> 20 -> 10`,
    badCode: `curr->next = newNode;\nnewNode->next = curr->next; // Self-loop! Lost rest of list`,
    fixedCode: `newNode->next = curr->next;\ncurr->next = newNode;`,
  },
  dsa_stacks: {
    syntax: `// LIFO Stack Operations: O(1)\npush(x): stack[++top] = x;\npop():   return stack[top--];\npeek():  return stack[top];`,
    exampleTitle: 'Postfix Expression Evaluation with a Stack',
    code: `// Expression: 5 3 + 2 *\npush(5); push(3);\nint b = pop(), a = pop();\npush(a + b); // pushes 8\npush(2);\nint y = pop(), x = pop();\npush(x * y); // pushes 16`,
    output: `Top of stack = 16`,
    badCode: `return stack[top--]; // Without checking if (top == -1) underflow`,
    fixedCode: `if (top < 0) return STACK_EMPTY;\nreturn stack[top--];`,
  },
  dsa_queues: {
    syntax: `// Circular Queue Modulo Indexing\nrear = (rear + 1) % capacity;\nfront = (front + 1) % capacity;`,
    exampleTitle: 'Circular Queue Enqueue & Dequeue',
    code: `int cap = 4, front = 0, rear = 2, size = 3;\n// Enqueue at next wrapped slot:\nrear = (rear + 1) % cap; // (2 + 1) % 4 = 3\nsize++;`,
    output: `rear index = 3, size = 4 (Queue Full)`,
    badCode: `rear = rear + 1; // Wastes freed front slots and overflows capacity`,
    fixedCode: `rear = (rear + 1) % capacity; // Wraps around circularly`,
  },
  dsa_searching: {
    syntax: `int low = 0, high = n - 1;\nwhile (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == key) return mid;\n    else if (arr[mid] < key) low = mid + 1;\n    else high = mid - 1;\n}`,
    exampleTitle: 'Overflow-Safe Binary Search in O(log N)',
    code: `int arr[] = {4, 9, 15, 22, 38, 45};\n// Search key = 22:\n// Pass 1: low=0, high=5 -> mid=2 (arr[2]=15 < 22) -> low=3\n// Pass 2: low=3, high=5 -> mid=4 (arr[4]=38 > 22) -> high=3\n// Pass 3: low=3, high=3 -> mid=3 (arr[3]=22 == 22) -> Found at 3`,
    output: `Key 22 found at index 3 in 3 comparisons`,
    badCode: `int mid = (low + high) / 2; // Can overflow 32-bit int for large low+high`,
    fixedCode: `int mid = low + (high - low) / 2; // Overflow-safe midpoint`,
  },
  dsa_sorting: {
    syntax: `// Merge Sort Recurrence: T(N) = 2T(N/2) + O(N) => O(N log N)\nmergeSort(arr, l, mid);\nmergeSort(arr, mid + 1, r);\nmerge(arr, l, mid, r);`,
    exampleTitle: 'Stable Merge Step in Merge Sort',
    code: `while (i < n1 && j < n2) {\n    if (L[i] <= R[j]) arr[k++] = L[i++]; // <= preserves stability\n    else arr[k++] = R[j++];\n}`,
    output: `Sorted array in guaranteed O(N log N) time`,
    badCode: `if (L[i] < R[j]) // Using strict < breaks sort stability for equal keys`,
    fixedCode: `if (L[i] <= R[j]) // <= keeps left-half equal elements first`,
  },
  dsa_trees: {
    syntax: `void inorder(Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    visit(root->key);\n    inorder(root->right);\n}`,
    exampleTitle: 'BST Inorder Traversal & Validation',
    code: `bool isValidBST(Node* node, long minVal, long maxVal) {\n    if (!node) return true;\n    if (node->key <= minVal || node->key >= maxVal) return false;\n    return isValidBST(node->left, minVal, node->key) &&\n           isValidBST(node->right, node->key, maxVal);\n}`,
    output: `Valid BST verified with global (min, max) range bounds`,
    badCode: `if (node->left && node->left->key < node->key) // Only checks immediate child!`,
    fixedCode: `isValidBST(node->left, minVal, node->key) // Enforces subtree range invariant`,
  },
  dsa_graphs: {
    syntax: `// Breadth-First Search (BFS) — O(V + E)\nqueue.push(start);\nvisited[start] = true;\nwhile (!queue.empty()) {\n    int u = queue.pop();\n    for (int v : adj[u])\n        if (!visited[v]) { visited[v] = true; queue.push(v); }\n}`,
    exampleTitle: 'BFS Level-Order Shortest Path in Unweighted Graph',
    code: `dist[src] = 0; visited[src] = true; q.push(src);\nwhile (!q.empty()) {\n    int u = q.front(); q.pop();\n    for (int v : adj[u]) {\n        if (!visited[v]) {\n            visited[v] = true;\n            dist[v] = dist[u] + 1;\n            q.push(v);\n        }\n    }\n}`,
    output: `Shortest edge distances computed from source in O(V + E)`,
    badCode: `// Marking visited only after popping from queue pushes duplicate vertices!`,
    fixedCode: `visited[v] = true; q.push(v); // Mark visited immediately when enqueueing`,
  },

  // DBMS
  dbms_er_model: {
    syntax: `-- M:N Relationship Mapping (Student <-> Course)\nCREATE TABLE Enrollment (\n    student_id INT REFERENCES Student(id),\n    course_id  INT REFERENCES Course(id),\n    enrolled_on DATE,\n    PRIMARY KEY (student_id, course_id)\n);`,
    exampleTitle: 'Mapping M:N ER Relationships to a Junction Table',
    code: `SELECT s.name, c.title\nFROM Student s\nJOIN Enrollment e ON s.id = e.student_id\nJOIN Course c ON c.id = e.course_id;`,
    output: `Returns each (Student, Course) pair via the Enrollment junction table`,
    badCode: `-- Storing comma-separated course_ids = "101,102,105" violates 1NF!`,
    fixedCode: `-- Use a junction table with composite primary key (student_id, course_id)`,
  },
  dbms_relational: {
    syntax: `σ_{condition}(R)       -- Selection (filters rows)\nπ_{A1, A2}(R)          -- Projection (selects unique columns)\nR ⋈_{R.id = S.id} S   -- Natural / Theta Join`,
    exampleTitle: 'Relational Algebra Selection & Projection Composition',
    code: `-- Find names of CSE students with CGPA > 8.5:\nπ_{name}( σ_{dept = 'CSE' ∧ cgpa > 8.5}(Student) )`,
    output: `Projects distinct student names satisfying both predicates`,
    badCode: `σ_{cgpa > 8.5}( π_{name}(Student) ) -- Error: cgpa was projected away!`,
    fixedCode: `π_{name}( σ_{cgpa > 8.5}(Student) ) -- Filter rows first, then project columns`,
  },
  dbms_keys: {
    syntax: `Attribute Closure (X+):\nStart with result = X;\nRepeat until unchanged:\n  If U -> V is in F and U ⊆ result, then result = result ∪ V.\nX is a Super Key iff X+ contains all attributes of R.`,
    exampleTitle: 'Finding Minimal Candidate Keys via Attribute Closure',
    code: `Relation R(A, B, C, D) with FDs: { A -> B, B -> C, C -> D }\nClosure of {A}+ = {A, B, C, D} = R\nSince {A} has size 1, {A} is the unique minimal Candidate Key.`,
    output: `Candidate Key = {A}; Primary Key = A`,
    badCode: `Calling {A, B} a Candidate Key when {A}+ already determines B`,
    fixedCode: `{A, B} is a Super Key; {A} is the minimal Candidate Key`,
  },
  dbms_sql: {
    syntax: `SELECT dept_id, COUNT(*) AS emp_count, AVG(salary) AS avg_sal\nFROM Employees\nWHERE active = 1\nGROUP BY dept_id\nHAVING COUNT(*) >= 5\nORDER BY avg_sal DESC;`,
    exampleTitle: 'SQL Aggregation with GROUP BY and HAVING',
    code: `SELECT dept_id, COUNT(*) AS headcount\nFROM employees\nGROUP BY dept_id\nHAVING COUNT(*) > 5;`,
    output: `dept_id: CSE | headcount: 12\ndept_id: ECE | headcount: 8`,
    badCode: `SELECT dept_id, COUNT(*) FROM employees WHERE COUNT(*) > 5 GROUP BY dept_id;`,
    fixedCode: `SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id HAVING COUNT(*) > 5;`,
  },
  dbms_normalization: {
    syntax: `1NF: Atomic attribute values\n2NF: No partial dependency on a candidate key\n3NF: For every X -> A, either X is a superkey OR A is a prime attribute\nBCNF: For every non-trivial X -> A, X MUST be a superkey`,
    exampleTitle: 'Lossless BCNF Decomposition',
    code: `R(Student, Course, Instructor) with FDs:\n{ (Student, Course) -> Instructor, Instructor -> Course }\nInstructor -> Course violates BCNF because Instructor is not a superkey.\nDecompose into R1(Instructor, Course) and R2(Student, Instructor).`,
    output: `Lossless join decomposition into R1 and R2 in BCNF`,
    badCode: `Decomposing into (Student, Course) and (Course, Instructor) -> Loses FD!`,
    fixedCode: `Place the determinant 'Instructor' as key in R1(Instructor, Course)`,
  },
  dbms_transactions: {
    syntax: `BEGIN TRANSACTION;\nUPDATE Accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE Accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT; -- Or ROLLBACK on failure`,
    exampleTitle: 'Conflict Serializability & Two-Phase Locking (2PL)',
    code: `-- Schedule S: T1: R(X), T1: W(X), T2: R(X), T2: W(X)\n-- Precedence Graph Edge: T1 -> T2 (no cycle)\n-- Result: Conflict Serializable (equivalent to serial order T1, T2)`,
    output: `Precedence graph is acyclic => Schedule is Conflict Serializable`,
    badCode: `Releasing a lock before acquiring all needed locks (violates 2PL)`,
    fixedCode: `Strict 2PL: Hold all exclusive locks until COMMIT/ROLLBACK`,
  },
};

/**
 * Resolves the full curriculum bundle for ANY EngineeringSubject.
 * - For built-in subjects: uses SUBJECT_CURRICULUM_BUNDLES and merges any extra user-added syllabus topics.
 * - For custom user-created subjects: dynamically builds concepts from the subject's syllabus units/topics.
 * NEVER falls back to C Programming for another subject.
 */
export function resolveSubjectCurriculum(subject: EngineeringSubject): SubjectCurriculumBundle {
  const existingBundle = SUBJECT_CURRICULUM_BUNDLES[subject.id];

  // Collect all syllabus topics so any topic in SubjectManagement can open a lesson
  const syllabusTopics = subject.syllabus.flatMap((u) => u.topics);

  if (existingBundle) {
    // Check if the user added custom syllabus units/topics to this built-in subject
    const extraConcepts: ConceptNodeDefinition[] = [];
    const extraBaseline: Record<ConceptId, number> = {};
    const extraPrevious: Record<ConceptId, number> = {};
    const extraAttemptsCount: Record<ConceptId, number> = {};

    syllabusTopics.forEach((t, idx) => {
      const cid = t.mappedConceptId || t.id;
      const alreadyExists =
        existingBundle.concepts.some((c) => c.id === cid) ||
        extraConcepts.some((c) => c.id === cid);
      if (!alreadyExists) {
        extraConcepts.push({
          id: cid,
          subjectId: subject.id,
          name: t.title,
          shortName: t.title.split('(')[0].split('&')[0].trim().slice(0, 22),
          order: existingBundle.concepts.length + extraConcepts.length + 1,
          description: `Core syllabus topic in ${subject.name}: ${t.title}.`,
          prerequisites:
            existingBundle.concepts.length > 0
              ? [existingBundle.concepts[existingBundle.concepts.length - 1].id]
              : [],
          dependents: [],
          deficitLabel: `Conceptual application in ${t.title}`,
          estimatedMinutes: t.estimatedMinutes || 25,
        });
        extraBaseline[cid] = 60 - (idx % 3) * 8;
        extraPrevious[cid] = 54 - (idx % 3) * 8;
        extraAttemptsCount[cid] = 2;
      }
    });

    if (extraConcepts.length === 0) {
      return existingBundle;
    }

    return {
      ...existingBundle,
      concepts: [...existingBundle.concepts, ...extraConcepts],
      baselineScores: { ...existingBundle.baselineScores, ...extraBaseline },
      previousScores: { ...existingBundle.previousScores, ...extraPrevious },
      attemptCounts: { ...existingBundle.attemptCounts, ...extraAttemptsCount },
    };
  }

  // Dynamic curriculum generation for custom user-added engineering subjects
  const dynamicConcepts: ConceptNodeDefinition[] =
    syllabusTopics.length > 0
      ? syllabusTopics.map((t, idx) => {
          const cid = t.mappedConceptId || t.id;
          const prevId =
            idx > 0 ? syllabusTopics[idx - 1].mappedConceptId || syllabusTopics[idx - 1].id : null;
          const nextId =
            idx < syllabusTopics.length - 1
              ? syllabusTopics[idx + 1].mappedConceptId || syllabusTopics[idx + 1].id
              : null;
          return {
            id: cid,
            subjectId: subject.id,
            name: t.title,
            shortName: t.title.split('(')[0].split(':')[0].trim().slice(0, 24),
            order: idx + 1,
            description: `Syllabus topic in ${subject.name} (${subject.code}): ${t.title}.`,
            prerequisites: prevId ? [prevId] : [],
            dependents: nextId ? [nextId] : [],
            deficitLabel: `Boundary & conceptual checks in ${t.title}`,
            estimatedMinutes: t.estimatedMinutes || 25,
          };
        })
      : [
          {
            id: `${subject.id}_core_1`,
            subjectId: subject.id,
            name: `${subject.name} Fundamentals`,
            shortName: 'Fundamentals',
            order: 1,
            description: subject.description,
            prerequisites: [],
            dependents: [`${subject.id}_core_2`],
            deficitLabel: `Foundational principles of ${subject.name}`,
            estimatedMinutes: 25,
          },
          {
            id: `${subject.id}_core_2`,
            subjectId: subject.id,
            name: `${subject.name} Problem Analysis`,
            shortName: 'Problem Analysis',
            order: 2,
            description: `Analytical methods and structured problem solving in ${subject.name}.`,
            prerequisites: [`${subject.id}_core_1`],
            dependents: [`${subject.id}_core_3`],
            deficitLabel: `Multi-step formulation in ${subject.name}`,
            estimatedMinutes: 30,
          },
          {
            id: `${subject.id}_core_3`,
            subjectId: subject.id,
            name: `${subject.name} Advanced Applications`,
            shortName: 'Applications',
            order: 3,
            description: `Applied engineering design and edge cases in ${subject.name}.`,
            prerequisites: [`${subject.id}_core_2`],
            dependents: [],
            deficitLabel: `Edge-case verification in ${subject.name}`,
            estimatedMinutes: 35,
          },
        ];

  const baselineScores: Record<ConceptId, number> = {};
  const previousScores: Record<ConceptId, number> = {};
  const attemptCounts: Record<ConceptId, number> = {};

  const sampleBaselines = [86, 74, 54, 36, 65, 48];
  dynamicConcepts.forEach((c, idx) => {
    const base = sampleBaselines[idx % sampleBaselines.length];
    baselineScores[c.id] = base;
    previousScores[c.id] = Math.max(20, base - 6);
    attemptCounts[c.id] = 3;
  });

  return {
    subjectId: subject.id,
    concepts: dynamicConcepts,
    baselineScores,
    previousScores,
    attemptCounts,
    initialAttempts: [],
  };
}

/**
 * Returns ONLY the diagnostic/practice questions belonging to the given subjectId.
 * NEVER returns C Programming questions for another subject.
 */
export function getQuestionsForSubject(subjectId: string): QuestionMetadata[] {
  return MULTI_SUBJECT_QUESTION_BANK.filter((q) => q.subjectId === subjectId);
}

/**
 * Looks up a question by ID across the entire multi-subject bank.
 */
export function findQuestionById(questionId: string): QuestionMetadata | undefined {
  return MULTI_SUBJECT_QUESTION_BANK.find((q) => q.id === questionId);
}

/**
 * Builds rich, interactive 6-part lesson content for ANY concept in ANY subject.
 */
export function resolveConceptLesson(
  subject: EngineeringSubject,
  concept: ConceptNodeDefinition
): ConceptLessonData {
  if (subject.id === 'subj_cs101' && CONCEPT_LESSONS[concept.id]) {
    return CONCEPT_LESSONS[concept.id];
  }

  const subjectQuestions = getQuestionsForSubject(subject.id);
  const matchingQ =
    subjectQuestions.find((q) => q.conceptId === concept.id) || subjectQuestions[0];
  const rich = TOPIC_RICH_CONTENT[concept.id];

  const buildLevel = (levelLabel: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const whatIsIt =
      levelLabel === 'Beginner'
        ? `In ${subject.name} (${subject.code}), ${concept.name} is a core topic that covers: ${concept.description} At the Beginner level, focus on building a clear mental model of how ${concept.shortName} works and why each step matters.`
        : levelLabel === 'Intermediate'
        ? `In ${subject.name} (${subject.code}), ${concept.name} connects foundational theory to practical problem solving: ${concept.description} At the Intermediate level, pay close attention to "${concept.deficitLabel}".`
        : `In ${subject.name} (${subject.code}), ${concept.name} requires rigorous analysis of edge cases, complexity, and invariants: ${concept.description}`;

    const whyUsed = `${concept.shortName} is essential in ${subject.name} because it forms the foundation for ${
      concept.dependents.length > 0
        ? `unlocking dependent syllabus topics`
        : `advanced engineering applications`
    } and prevents common errors such as "${concept.deficitLabel}".`;

    const syntax =
      rich?.syntax ||
      matchingQ?.codeSnippet ||
      `// ${subject.name} (${subject.code}) — ${concept.name}\n// Key Principle: ${concept.description}\n// Primary Checkpoint: Avoid ${concept.deficitLabel}`;

    const codeExample = {
      title: rich?.exampleTitle || `${concept.shortName} — Step-by-Step Worked Example`,
      code:
        rich?.code ||
        matchingQ?.codeSnippet ||
        `// Worked Problem: ${concept.name}\n// Subject: ${subject.name} (${subject.code})\n1. Identify input constraints and given parameters for ${concept.shortName}\n2. Apply core formulation: ${concept.description}\n3. Verify that ${concept.deficitLabel} does not occur`,
      output:
        rich?.output ||
        (matchingQ
          ? `Verified Result: ${matchingQ.options[matchingQ.correctAnswerIndex]}`
          : `${concept.shortName} solution verified with 100% consistency.`),
      walkthrough: matchingQ
        ? [matchingQ.hints.hint1, matchingQ.hints.hint2, matchingQ.explanation]
        : [
            `Start by identifying the core definition of ${concept.shortName} in ${subject.name}.`,
            `Apply the step-by-step rule while checking prerequisites.`,
            `Verify your final result to avoid "${concept.deficitLabel}".`,
          ],
    };

    const commonMistakes = [
      {
        mistakeTitle: concept.deficitLabel,
        badCode:
          rich?.badCode ||
          (matchingQ
            ? `Common Pitfall: Choosing "${matchingQ.options[(matchingQ.correctAnswerIndex + 1) % matchingQ.options.length]}"`
            : `Ignoring boundary conditions in ${concept.shortName}`),
        fixedCode:
          rich?.fixedCode ||
          (matchingQ
            ? `Correct Solution: "${matchingQ.options[matchingQ.correctAnswerIndex]}"`
            : `Applying verified ${concept.shortName} rules step-by-step`),
        explanation:
          matchingQ?.explanation ||
          `Students studying ${subject.name} frequently encounter "${concept.deficitLabel}" when working on ${concept.shortName}. Always verify each step carefully.`,
      },
    ];

    const practicePrompt = matchingQ
      ? {
          question: matchingQ.question,
          code: matchingQ.codeSnippet,
          options: matchingQ.options,
          correctIndex: matchingQ.correctAnswerIndex,
          explanation: matchingQ.explanation,
        }
      : {
          question: `In ${subject.name}, what is the most important pitfall to guard against when working with ${concept.name}?`,
          options: [
            concept.deficitLabel,
            'Following step-by-step verification',
            'Checking prerequisite definitions first',
            'Writing clean modular formulations',
          ],
          correctIndex: 0,
          explanation: `"${concept.deficitLabel}" is the primary mistake pattern identified for ${concept.name} in ${subject.name}.`,
        };

    return {
      whatIsIt,
      whyUsed,
      syntax,
      codeExample,
      commonMistakes,
      practicePrompt,
    };
  };

  return {
    conceptId: concept.id,
    title: `${concept.name}`,
    subtitle: `${subject.name} (${subject.code}) · ${concept.description}`,
    levels: {
      Beginner: buildLevel('Beginner'),
      Intermediate: buildLevel('Intermediate'),
      Advanced: buildLevel('Advanced'),
    },
  };
}
