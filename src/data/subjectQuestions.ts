import {
  ConceptLessonData,
  ConceptNodeDefinition,
  QuestionMetadata,
} from '../types/learning';
import { CONCEPT_LESSONS, QUESTION_BANK } from './curriculumData';

export const MULTI_SUBJECT_QUESTION_BANK: QuestionMetadata[] = [
  // 1. C PROGRAMMING (tagged with subj_cs101)
  ...QUESTION_BANK.map((q) => ({
    ...q,
    subjectId: 'subj_cs101',
    codeFilename: 'main.c',
    codeLanguage: 'C Program',
  })),

  // 2. PYTHON PROGRAMMING (subj_py101)
  {
    id: 'q_py_var_1',
    subjectId: 'subj_py101',
    topic: 'Variables & Reference Aliasing',
    conceptId: 'py_variables',
    conceptName: 'Variables',
    difficulty: 'Easy',
    question: 'What is printed by the following Python snippet when two variables reference the same list?',
    codeSnippet: `a = [10, 20]
b = a
b.append(30)
print(len(a))`,
    codeFilename: 'main.py',
    codeLanguage: 'Python 3',
    options: ['2', '3', '1', 'TypeError'],
    correctAnswerIndex: 1,
    explanation:
      'In Python, assignment (b = a) binds b to the exact same list object in memory rather than copying it. Appending 30 via b mutates the shared list, so len(a) is 3.',
    mistakeType: 'Reference aliasing vs value copying',
    hints: {
      hint1: 'Does b = a create a brand-new list copy or an alias to the same list?',
      hint2: 'Both a and b point to the same mutable list object in memory.',
      hint3: 'After b.append(30), the shared list is [10, 20, 30], which has length 3.',
    },
  },
  {
    id: 'q_py_dt_1',
    subjectId: 'subj_py101',
    topic: 'Data Types & Immutability',
    conceptId: 'py_datatypes',
    conceptName: 'Data Types',
    difficulty: 'Easy',
    question: 'Which of the following Python built-in data types is strictly immutable?',
    options: ['list', 'dict', 'tuple', 'set'],
    correctAnswerIndex: 2,
    explanation:
      'Tuples (tuple) are immutable sequences in Python—their element bindings cannot be reassigned after creation, unlike lists, dicts, and sets.',
    mistakeType: 'Tuple immutability & string slicing',
    hints: {
      hint1: 'Think about which sequence type can be used as a dictionary key.',
      hint2: 'Lists, sets, and dictionaries can be modified in place.',
      hint3: 'A tuple cannot have elements added, removed, or reassigned.',
    },
  },
  {
    id: 'q_py_cond_1',
    subjectId: 'subj_py101',
    topic: 'Truthiness & Short-Circuiting',
    conceptId: 'py_conditions',
    conceptName: 'Conditions',
    difficulty: 'Easy',
    question: 'What does the following Python conditional expression output?',
    codeSnippet: `items = []
result = "Non-empty" if items else "Empty list"
print(result)`,
    codeFilename: 'main.py',
    codeLanguage: 'Python 3',
    options: ['Non-empty', 'Empty list', '[]', 'SyntaxError'],
    correctAnswerIndex: 1,
    explanation:
      'In Python, empty containers such as [], {}, (), and "" evaluate to False (falsy) in a boolean context.',
    mistakeType: 'is vs == identity comparison',
    hints: {
      hint1: 'How does Python evaluate an empty list [] inside an if condition?',
      hint2: 'Empty sequences are falsy in Python.',
      hint3: 'Because bool([]) is False, the else branch "Empty list" is chosen.',
    },
  },
  {
    id: 'q_py_loop_1',
    subjectId: 'subj_py101',
    topic: 'range() Step & Iteration',
    conceptId: 'py_loops',
    conceptName: 'Loops',
    difficulty: 'Medium',
    question: 'What is the exact output of this Python loop?',
    codeSnippet: `total = 0
for k in range(1, 6, 2):
    total += k
print(total)`,
    codeFilename: 'main.py',
    codeLanguage: 'Python 3',
    options: ['6', '9', '15', '10'],
    correctAnswerIndex: 1,
    explanation:
      'range(1, 6, 2) starts at 1, stops before 6, and steps by 2, generating 1, 3, and 5. Their sum is 1 + 3 + 5 = 9.',
    mistakeType: 'Mutating a list while iterating over it',
    hints: {
      hint1: 'Check the three arguments to range(start, stop, step).',
      hint2: 'The stop value 6 is exclusive, and the step is 2.',
      hint3: 'The generated numbers are 1, 3, 5 -> sum is 9.',
    },
  },
  {
    id: 'q_py_func_1',
    subjectId: 'subj_py101',
    topic: 'Mutable Default Arguments',
    conceptId: 'py_functions',
    conceptName: 'Functions',
    difficulty: 'Medium',
    question: 'What is printed after calling add_item() twice using a default list parameter?',
    codeSnippet: `def add_item(val, bucket=[]):
    bucket.append(val)
    return bucket

add_item(1)
print(add_item(2))`,
    codeFilename: 'main.py',
    codeLanguage: 'Python 3',
    options: ['[2]', '[1, 2]', '[1]', 'Error'],
    correctAnswerIndex: 1,
    explanation:
      'Default parameter values in Python are evaluated only once when def is executed, not on each call. Both calls share the same default list, resulting in [1, 2].',
    mistakeType: 'Mutable default arguments Trap (def fn(a=[]))',
    hints: {
      hint1: 'When does Python create the default list bucket=[]?',
      hint2: 'Default arguments are created once at function definition time.',
      hint3: 'The second call reuses the list from the first call, appending 2 to [1].',
    },
  },
  {
    id: 'q_py_list_1',
    subjectId: 'subj_py101',
    topic: 'List Comprehensions & Slicing',
    conceptId: 'py_lists',
    conceptName: 'Lists',
    difficulty: 'Medium',
    question: 'What does the following Python list comprehension produce?',
    codeSnippet: `nums = [1, 2, 3, 4]
squares = [x * x for x in nums if x % 2 == 0]
print(squares)`,
    codeFilename: 'main.py',
    codeLanguage: 'Python 3',
    options: ['[1, 4, 9, 16]', '[4, 16]', '[2, 4]', '[1, 9]'],
    correctAnswerIndex: 1,
    explanation:
      'The filter if x % 2 == 0 selects only even numbers (2 and 4), and x * x squares them to [4, 16].',
    mistakeType: 'Shallow copy vs deepcopy on nested lists',
    hints: {
      hint1: 'First apply the condition if x % 2 == 0 to [1, 2, 3, 4].',
      hint2: 'Only 2 and 4 satisfy x % 2 == 0.',
      hint3: 'Squaring 2 and 4 gives [4, 16].',
    },
  },
  {
    id: 'q_py_dict_1',
    subjectId: 'subj_py101',
    topic: 'Dictionary Lookup & .get()',
    conceptId: 'py_dictionaries',
    conceptName: 'Dictionaries',
    difficulty: 'Medium',
    question: 'What is printed when accessing a missing key using dict.get()?',
    codeSnippet: `scores = {"Alice": 92, "Bob": 85}
print(scores.get("Charlie", 0))`,
    codeFilename: 'main.py',
    codeLanguage: 'Python 3',
    options: ['KeyError', 'None', '0', '85'],
    correctAnswerIndex: 2,
    explanation:
      'dict.get(key, default) safely looks up the key and returns the fallback default value (0) instead of raising a KeyError when the key is absent.',
    mistakeType: 'KeyError on missing keys & unhashable list keys',
    hints: {
      hint1: 'Compare scores["Charlie"] with scores.get("Charlie", 0).',
      hint2: 'The second argument to .get() specifies the fallback return value.',
      hint3: 'Since "Charlie" is not in scores, .get() returns 0.',
    },
  },
  {
    id: 'q_py_oop_1',
    subjectId: 'subj_py101',
    topic: 'Class vs Instance Attributes',
    conceptId: 'py_oop',
    conceptName: 'OOP Basics',
    difficulty: 'Hard',
    question: 'What is the role of the first parameter self inside a Python instance method?',
    options: [
      'It refers to the global module scope',
      'It binds the method call to the specific instance object being operated on',
      'It makes all attributes private automatically',
      'It is only used inside static methods',
    ],
    correctAnswerIndex: 1,
    explanation:
      'When obj.method() is called in Python, the instance obj is automatically passed as the first argument (conventionally named self) so the method can access instance attributes.',
    mistakeType: 'Class attribute shared across instances',
    hints: {
      hint1: 'How does Python translate obj.increment() under the hood?',
      hint2: 'It calls ClassName.increment(obj).',
      hint3: 'Therefore self references the current instance object.',
    },
  },

  // 3. DATA STRUCTURES & ALGORITHMS (subj_cs201)
  {
    id: 'q_dsa_arr_1',
    subjectId: 'subj_cs201',
    topic: 'Array Traversal & Time Complexity',
    conceptId: 'dsa_arrays',
    conceptName: 'Arrays',
    difficulty: 'Easy',
    question: 'What is the worst-case time complexity of inserting an element at index 0 of a dynamic array of size N?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctAnswerIndex: 2,
    explanation:
      'Inserting at index 0 of a contiguous array requires shifting all N existing elements one position to the right, taking O(N) linear time.',
    mistakeType: 'Amortized resizing & sliding window bounds',
    hints: {
      hint1: 'Remember that array elements are stored in contiguous memory locations.',
      hint2: 'To place a new element at index 0, what must happen to elements at indices 0..N-1?',
      hint3: 'Shifting N elements right takes O(N) operations.',
    },
  },
  {
    id: 'q_dsa_ll_1',
    subjectId: 'subj_cs201',
    topic: 'Singly Linked List Insertion',
    conceptId: 'dsa_linked_lists',
    conceptName: 'Linked Lists',
    difficulty: 'Medium',
    question: 'Which pointer sequence correctly inserts newNode right after node curr in a singly linked list?',
    codeSnippet: `// Insert newNode after curr:
// Which order avoids losing the rest of the list?`,
    codeFilename: 'linked_list.c',
    codeLanguage: 'DSA Pseudocode',
    options: [
      'curr->next = newNode; newNode->next = curr->next;',
      'newNode->next = curr->next; curr->next = newNode;',
      'newNode->next = curr; curr = newNode;',
      'curr->next = curr->next->next;',
    ],
    correctAnswerIndex: 1,
    explanation:
      'You must first link newNode->next to curr->next so you do not lose the pointer to the remainder of the list, and only then update curr->next = newNode.',
    mistakeType: 'Losing head/next reference during pointer reassignment',
    hints: {
      hint1: 'What happens if you overwrite curr->next before saving its old value?',
      hint2: 'Attach newNode to the successor node first.',
      hint3: 'newNode->next = curr->next; followed by curr->next = newNode; preserves the chain.',
    },
  },
  {
    id: 'q_dsa_stack_1',
    subjectId: 'subj_cs201',
    topic: 'Stack LIFO Evaluation',
    conceptId: 'dsa_stacks',
    conceptName: 'Stacks',
    difficulty: 'Easy',
    question: 'What is the value at the top of the stack after evaluating the postfix expression: 5 3 + 2 * ?',
    options: ['11', '16', '13', '10'],
    correctAnswerIndex: 1,
    explanation:
      'Push 5, push 3. The + operator pops 3 and 5 and pushes 8. Push 2. The * operator pops 2 and 8 and pushes 8 * 2 = 16.',
    mistakeType: 'Stack underflow & infix-to-postfix precedence',
    hints: {
      hint1: 'In postfix (Reverse Polish) notation, operators apply to the two most recently pushed operands.',
      hint2: 'First 5 3 + evaluates to 8.',
      hint3: 'Next 8 2 * evaluates to 16.',
    },
  },
  {
    id: 'q_dsa_queue_1',
    subjectId: 'subj_cs201',
    topic: 'Circular Queue Wrap-Around',
    conceptId: 'dsa_queues',
    conceptName: 'Queues',
    difficulty: 'Medium',
    question: 'In a circular queue backed by an array of capacity N, how is the rear index advanced on enqueue?',
    options: [
      'rear = rear + 1',
      'rear = (rear + 1) % N',
      'rear = (rear - 1) % N',
      'rear = N - rear',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Using modulo arithmetic rear = (rear + 1) % N wraps the index around from N - 1 back to 0, reusing freed slots at the front of the array.',
    mistakeType: 'Circular queue full vs empty modulo condition',
    hints: {
      hint1: 'What should rear become when it is at index N - 1 and we enqueue one more item?',
      hint2: 'It should wrap back to index 0.',
      hint3: '(rear + 1) % N achieves circular wrap-around.',
    },
  },
  {
    id: 'q_dsa_search_1',
    subjectId: 'subj_cs201',
    topic: 'Binary Search Precondition',
    conceptId: 'dsa_searching',
    conceptName: 'Searching',
    difficulty: 'Easy',
    question: 'What precondition must an array satisfy for Binary Search to guarantee O(log N) lookup correctness?',
    options: [
      'All elements must be positive integers',
      'The array must be sorted in monotonic order',
      'The array size must be a power of 2',
      'The array must contain no duplicate values',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Binary search eliminates half of the remaining search space at each comparison, which is only valid if the elements are sorted monotonically.',
    mistakeType: 'Midpoint overflow & infinite loop on boundary update',
    hints: {
      hint1: 'Why can binary search discard the entire left or right half after checking mid?',
      hint2: 'It relies on knowing all elements to the left are smaller and to the right are larger.',
      hint3: 'Therefore, the array must be sorted.',
    },
  },
  {
    id: 'q_dsa_sort_1',
    subjectId: 'subj_cs201',
    topic: 'Sorting Time Complexity & Stability',
    conceptId: 'dsa_sorting',
    conceptName: 'Sorting',
    difficulty: 'Medium',
    question: 'Which sorting algorithm guarantees O(N log N) time complexity in best, average, AND worst cases and is stable?',
    options: ['Quick Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
    correctAnswerIndex: 2,
    explanation:
      'Merge Sort always divides the array into two equal halves and merges them in linear time, guaranteeing O(N log N) in all cases while preserving relative order of equal keys.',
    mistakeType: 'QuickSort worst-case O(n^2) pivot selection',
    hints: {
      hint1: 'Quick Sort can degrade to O(N^2) on badly chosen pivots.',
      hint2: 'Which divide-and-conquer sort always splits the array 50/50?',
      hint3: 'Merge Sort guarantees O(N log N) worst-case and is stable.',
    },
  },
  {
    id: 'q_dsa_tree_1',
    subjectId: 'subj_cs201',
    topic: 'Binary Search Tree Traversals',
    conceptId: 'dsa_trees',
    conceptName: 'Trees',
    difficulty: 'Medium',
    question: 'Which traversal of a valid Binary Search Tree (BST) always visits node keys in non-decreasing sorted order?',
    options: [
      'Preorder (Root, Left, Right)',
      'Inorder (Left, Root, Right)',
      'Postorder (Left, Right, Root)',
      'Level-order (Breadth-First)',
    ],
    correctAnswerIndex: 1,
    explanation:
      'In a BST, all keys in the left subtree are smaller than the root and all keys in the right subtree are larger. Visiting Left -> Root -> Right (Inorder) outputs keys in sorted order.',
    mistakeType: 'BST global subtree min/max validation error',
    hints: {
      hint1: 'Where are smaller keys located relative to the root in a BST?',
      hint2: 'Left subtree keys < Root key < Right subtree keys.',
      hint3: 'Visiting Left, then Root, then Right is Inorder traversal.',
    },
  },
  {
    id: 'q_dsa_graph_1',
    subjectId: 'subj_cs201',
    topic: 'Graph Shortest Paths & BFS',
    conceptId: 'dsa_graphs',
    conceptName: 'Graphs',
    difficulty: 'Hard',
    question: 'Which graph algorithm finds the shortest path (minimum number of edges) from a source in an unweighted graph in O(V + E) time?',
    options: [
      'Depth-First Search (DFS)',
      'Breadth-First Search (BFS)',
      'Kruskal’s Minimum Spanning Tree',
      'Topological Sort',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Breadth-First Search (BFS) explores vertices layer by layer in increasing order of edge distance from the source using a FIFO queue, finding shortest paths in unweighted graphs in O(V + E).',
    mistakeType: 'Missing visited set causing infinite cycle traversal',
    hints: {
      hint1: 'We want to visit all distance-1 neighbors before any distance-2 neighbors.',
      hint2: 'Which traversal uses a FIFO Queue to explore level by level?',
      hint3: 'Breadth-First Search (BFS).',
    },
  },

  // 4. DBMS (subj_cs301)
  {
    id: 'q_dbms_er_1',
    subjectId: 'subj_cs301',
    topic: 'ER Model M:N Relationship Mapping',
    conceptId: 'dbms_er_model',
    conceptName: 'ER Model',
    difficulty: 'Easy',
    question: 'When mapping a Many-to-Many (M:N) relationship between Student and Course into relational tables, what is required?',
    options: [
      'Embed a single CourseID column inside the Student table',
      'Create a separate junction (relationship) table containing foreign keys to both Student and Course',
      'Merge Student and Course into one giant table',
      'Drop primary keys from both tables',
    ],
    correctAnswerIndex: 1,
    explanation:
      'An M:N relationship cannot be represented by a single foreign key without repeating groups; it requires a separate junction table whose primary key is the composite of both entity primary keys.',
    mistakeType: 'M:N relationship junction table mapping',
    hints: {
      hint1: 'Can a single Student row store multiple Course IDs while staying in 1NF?',
      hint2: 'No, 1NF requires atomic attribute values.',
      hint3: 'A separate Enrollment junction table with (student_id, course_id) is required.',
    },
  },
  {
    id: 'q_dbms_rel_1',
    subjectId: 'subj_cs301',
    topic: 'Relational Algebra Operators',
    conceptId: 'dbms_relational',
    conceptName: 'Relational Model',
    difficulty: 'Easy',
    question: 'In Relational Algebra, which operator filters rows (tuples) that satisfy a given predicate condition?',
    options: [
      'Projection (π)',
      'Selection (σ)',
      'Cartesian Product (×)',
      'Set Difference (−)',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Selection (σ) is a horizontal filter that retains tuples satisfying a predicate (equivalent to SQL WHERE), whereas Projection (π) selects vertical columns.',
    mistakeType: 'Relational division vs natural join semantics',
    hints: {
      hint1: 'Distinguish between choosing rows (horizontal) and choosing columns (vertical).',
      hint2: 'π (Pi) projects columns; σ (Sigma) selects rows.',
      hint3: 'Selection (σ) filters tuples based on a condition.',
    },
  },
  {
    id: 'q_dbms_key_1',
    subjectId: 'subj_cs301',
    topic: 'Candidate Keys & Referential Integrity',
    conceptId: 'dbms_keys',
    conceptName: 'Keys',
    difficulty: 'Medium',
    question: 'What is the exact relationship between a Super Key and a Candidate Key in a relational schema?',
    options: [
      'Every Super Key is a minimal Candidate Key',
      'A Candidate Key is a minimal Super Key with no redundant attributes',
      'A Candidate Key can contain NULL values whereas a Super Key cannot',
      'A relation can have only one Candidate Key',
    ],
    correctAnswerIndex: 1,
    explanation:
      'A Super Key is any attribute set that uniquely identifies a tuple. A Candidate Key is a minimal Super Key—removing any single attribute from it destroys uniqueness.',
    mistakeType: 'Finding attribute closure F+ for candidate keys',
    hints: {
      hint1: 'If {RollNo} uniquely identifies a student, then {RollNo, Name} is a Super Key.',
      hint2: 'Why is {RollNo, Name} not a Candidate Key?',
      hint3: 'Because Name is redundant; a Candidate Key is a minimal Super Key.',
    },
  },
  {
    id: 'q_dbms_sql_1',
    subjectId: 'subj_cs301',
    topic: 'SQL GROUP BY & HAVING',
    conceptId: 'dbms_sql',
    conceptName: 'SQL',
    difficulty: 'Medium',
    question: 'Why does the first SQL query fail when filtering departments with more than 5 employees, and how is it fixed?',
    codeSnippet: `-- Query: Find departments with > 5 employees
SELECT dept_id, COUNT(*)
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 5;`,
    codeFilename: 'query.sql',
    codeLanguage: 'SQL Query',
    options: [
      'WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY',
      'COUNT(*) can only be used inside WHERE clauses',
      'GROUP BY must always appear after ORDER BY',
      'HAVING can only compare string columns',
    ],
    correctAnswerIndex: 0,
    explanation:
      'In SQL execution order, WHERE is evaluated before GROUP BY and cannot reference aggregate functions like COUNT(*). HAVING is evaluated after GROUP BY to filter groups.',
    mistakeType: 'Filtering aggregates with WHERE instead of HAVING',
    hints: {
      hint1: 'When does SQL compute COUNT(*)—before or after grouping rows?',
      hint2: 'WHERE runs before GROUP BY; HAVING runs after GROUP BY.',
      hint3: 'Aggregate conditions must be placed in the HAVING clause.',
    },
  },
  {
    id: 'q_dbms_norm_1',
    subjectId: 'subj_cs301',
    topic: '2NF, 3NF & BCNF Normalization',
    conceptId: 'dbms_normalization',
    conceptName: 'Normalization',
    difficulty: 'Hard',
    question: 'A relation R is in Second Normal Form (2NF) if it is in 1NF and every non-prime attribute is:',
    options: [
      'Partially dependent on a candidate key',
      'Fully functionally dependent on every candidate key (no partial dependencies)',
      'Transitively dependent on another non-prime attribute',
      'Part of a foreign key',
    ],
    correctAnswerIndex: 1,
    explanation:
      '2NF eliminates partial functional dependencies—no non-prime attribute may depend on only a proper subset of a composite candidate key.',
    mistakeType: 'Partial vs transitive dependency identification',
    hints: {
      hint1: 'What anomaly occurs when an attribute depends on only half of a composite key (A, B)?',
      hint2: 'That is called a partial dependency.',
      hint3: '2NF requires full functional dependency on the entire candidate key.',
    },
  },
  {
    id: 'q_dbms_tx_1',
    subjectId: 'subj_cs301',
    topic: 'ACID Properties & Serializability',
    conceptId: 'dbms_transactions',
    conceptName: 'Transactions',
    difficulty: 'Hard',
    question: 'Which ACID property guarantees that either all operations of a transaction are reflected in the database or none are?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctAnswerIndex: 0,
    explanation:
      'Atomicity ("all-or-nothing") ensures via undo logging and rollback that a partially failed transaction leaves no partial side effects.',
    mistakeType: 'Dirty read & phantom read isolation anomalies',
    hints: {
      hint1: 'Think of the "all-or-nothing" rule in bank transfers.',
      hint2: 'If debit succeeds but credit crashes, the whole transaction must roll back.',
      hint3: 'This all-or-nothing guarantee is Atomicity.',
    },
  },

  // 5. ENGINEERING MATHEMATICS (subj_ma101)
  {
    id: 'q_math_mat_1',
    subjectId: 'subj_ma101',
    topic: 'Matrix Rank & Linear Systems',
    conceptId: 'math_matrices',
    conceptName: 'Matrices',
    difficulty: 'Easy',
    question: 'A non-homogeneous linear system AX = B with n unknowns is consistent and has a unique solution if and only if:',
    options: [
      'rank(A) < rank([A | B])',
      'rank(A) = rank([A | B]) = n',
      'rank(A) = rank([A | B]) < n',
      'det(A) = 0',
    ],
    correctAnswerIndex: 1,
    explanation:
      'By Rouché–Capelli theorem, AX = B is consistent when rank(A) = rank([A|B]), and the solution is unique when that common rank equals the number of unknowns n.',
    mistakeType: 'Row reduction sign errors in augmented matrices',
    hints: {
      hint1: 'What is required for AX = B to have at least one solution?',
      hint2: 'rank(A) must equal rank([A | B]).',
      hint3: 'For a unique solution (zero free variables), that rank must equal n.',
    },
  },
  {
    id: 'q_math_eig_1',
    subjectId: 'subj_ma101',
    topic: 'Eigenvalues Trace & Determinant',
    conceptId: 'math_eigen',
    conceptName: 'Eigenvalues',
    difficulty: 'Medium',
    question: 'If a 2×2 matrix A has trace(A) = 7 and det(A) = 10, what are the eigenvalues of A?',
    options: ['λ = 1, 10', 'λ = 2, 5', 'λ = -2, -5', 'λ = 3, 4'],
    correctAnswerIndex: 1,
    explanation:
      'The sum of eigenvalues equals trace(A) = 7 and the product of eigenvalues equals det(A) = 10. Since 2 + 5 = 7 and 2 × 5 = 10, the eigenvalues are 2 and 5.',
    mistakeType: 'Trace and determinant check on characteristic roots',
    hints: {
      hint1: 'Recall how λ1 + λ2 and λ1 · λ2 relate to trace and determinant.',
      hint2: 'λ1 + λ2 = 7 and λ1 × λ2 = 10.',
      hint3: 'The numbers 2 and 5 sum to 7 and multiply to 10.',
    },
  },
  {
    id: 'q_math_int_1',
    subjectId: 'subj_ma101',
    topic: 'Polar Coordinate Double Integrals',
    conceptId: 'math_integrals',
    conceptName: 'Multiple Integrals',
    difficulty: 'Medium',
    question: 'When converting a double integral ∬ f(x, y) dx dy from Cartesian to polar coordinates (r, θ), what does the area element dx dy become?',
    options: ['dr dθ', 'r² dr dθ', 'r dr dθ', '(1/r) dr dθ'],
    correctAnswerIndex: 2,
    explanation:
      'The Jacobian determinant of the polar transformation x = r cos θ, y = r sin θ is J = r, so dx dy = r dr dθ.',
    mistakeType: 'Forgetting Jacobian factor r in polar coordinate conversion',
    hints: {
      hint1: 'Compute the Jacobian ∂(x,y)/∂(r,θ).',
      hint2: 'r cos²θ + r sin²θ simplifies to r.',
      hint3: 'Therefore dx dy = r dr dθ.',
    },
  },
  {
    id: 'q_math_vec_1',
    subjectId: 'subj_ma101',
    topic: 'Solenoidal & Irrotational Fields',
    conceptId: 'math_vector',
    conceptName: 'Vector Calculus',
    difficulty: 'Hard',
    question: 'A vector field F is called solenoidal (incompressible) if everywhere in its domain:',
    options: ['curl(F) = 0', 'div(F) = ∇ · F = 0', 'grad(F) = 0', '∇²F = 1'],
    correctAnswerIndex: 1,
    explanation:
      'A vector field F is solenoidal if its divergence vanishes (∇ · F = 0), and irrotational if its curl vanishes (∇ × F = 0).',
    mistakeType: 'Curl determinant sign flip on j-component',
    hints: {
      hint1: 'Distinguish between solenoidal (zero net flux) and irrotational (zero rotation).',
      hint2: 'Divergence measures net outward flux per unit volume.',
      hint3: 'Hence solenoidal means div(F) = ∇ · F = 0.',
    },
  },

  // 6. DIGITAL LOGIC (subj_ec102)
  {
    id: 'q_dl_num_1',
    subjectId: 'subj_ec102',
    topic: '2’s Complement Representation',
    conceptId: 'dl_numbers',
    conceptName: 'Number Systems',
    difficulty: 'Easy',
    question: 'What is the 8-bit 2’s complement binary representation of the signed decimal number -5?',
    options: ['10000101', '11111010', '11111011', '00000101'],
    correctAnswerIndex: 2,
    explanation:
      '+5 in 8-bit binary is 00000101. Inverting all bits gives 11111010 (1’s complement), and adding 1 gives 11111011.',
    mistakeType: 'Signed 2’s complement overflow detection',
    hints: {
      hint1: 'Start with +5 in 8 bits: 00000101.',
      hint2: 'Invert all bits to get 11111010.',
      hint3: 'Add 1 to get 11111011.',
    },
  },
  {
    id: 'q_dl_kmap_1',
    subjectId: 'subj_ec102',
    topic: 'K-Map Grouping Rules',
    conceptId: 'dl_kmap',
    conceptName: 'K-Maps',
    difficulty: 'Medium',
    question: 'In a 4-variable Karnaugh Map, grouping an octet (8 adjacent 1s) eliminates how many boolean variables from the product term?',
    options: ['1 variable', '2 variables', '3 variables', '4 variables'],
    correctAnswerIndex: 2,
    explanation:
      'Grouping 2^k adjacent cells in a K-Map eliminates k variables. Since 8 = 2^3, an octet eliminates 3 variables, leaving a 1-literal term.',
    mistakeType: 'Missing wrap-around corner grouping in 4-variable K-Map',
    hints: {
      hint1: 'A group of 2^k cells eliminates k variables.',
      hint2: 'Express 8 as a power of 2: 8 = 2^3.',
      hint3: 'Thus 3 variables are eliminated.',
    },
  },
  {
    id: 'q_dl_comb_1',
    subjectId: 'subj_ec102',
    topic: 'Multiplexer Select Lines',
    conceptId: 'dl_combinational',
    conceptName: 'Combinational Logic',
    difficulty: 'Medium',
    question: 'How many selection lines are required in an 8-to-1 Multiplexer (MUX)?',
    options: ['2', '4', '3', '8'],
    correctAnswerIndex: 2,
    explanation:
      'A 2^n-to-1 multiplexer requires n selection lines to uniquely address one of the 2^n inputs. Since 8 = 2^3, 3 select lines are required.',
    mistakeType: 'Implementing n-variable function with (n-1) select MUX',
    hints: {
      hint1: 'With n select bits, how many distinct input channels can be chosen?',
      hint2: '2^n inputs.',
      hint3: 'Since 2^3 = 8, 3 select lines are needed.',
    },
  },
  {
    id: 'q_dl_ff_1',
    subjectId: 'subj_ec102',
    topic: 'JK Flip-Flop Toggle Mode',
    conceptId: 'dl_flipflops',
    conceptName: 'Flip-Flops',
    difficulty: 'Hard',
    question: 'In a clocked JK Flip-Flop, what happens to the next state Q(t+1) when both J = 1 and K = 1 on the active clock edge?',
    options: [
      'Q(t+1) = 0 (Reset)',
      'Q(t+1) = 1 (Set)',
      'Q(t+1) = Q’(t) (Toggles complement of current state)',
      'Invalid / Forbidden state',
    ],
    correctAnswerIndex: 2,
    explanation:
      'The JK flip-flop resolves the SR forbidden (1,1) state by toggling: when J = 1 and K = 1, Q(t+1) = Q’(t).',
    mistakeType: 'JK race-around condition & excitation table transitions',
    hints: {
      hint1: 'Unlike the SR latch where S=1, R=1 is invalid, what does the JK flip-flop do?',
      hint2: 'Characteristic equation: Q(t+1) = J Q’ + K’ Q.',
      hint3: 'Substituting J=1, K=1 gives Q(t+1) = Q’(t) (toggle).',
    },
  },

  // 7. OPERATING SYSTEMS (subj_cs204)
  {
    id: 'q_os_proc_1',
    subjectId: 'subj_cs204',
    topic: 'fork() System Call Process Creation',
    conceptId: 'os_processes',
    conceptName: 'Processes & Threads',
    difficulty: 'Easy',
    question: 'If a process executes fork() 3 times consecutively without any conditionals, how many total processes (including the original parent) exist?',
    options: ['3', '4', '8', '6'],
    correctAnswerIndex: 2,
    explanation:
      'Each unconditional fork() doubles the number of running processes. After n fork() calls, there are 2^n processes in total: 2^3 = 8 processes (1 parent + 7 children).',
    mistakeType: 'Counting child processes across multiple fork() calls',
    hints: {
      hint1: 'How many processes exist after the 1st fork()?',
      hint2: 'After 1st: 2. After 2nd: 4.',
      hint3: 'After n fork() calls: 2^n = 2^3 = 8 total processes.',
    },
  },
  {
    id: 'q_os_sched_1',
    subjectId: 'subj_cs204',
    topic: 'CPU Scheduling Optimality',
    conceptId: 'os_scheduling',
    conceptName: 'CPU Scheduling',
    difficulty: 'Medium',
    question: 'Which CPU scheduling algorithm is provably optimal for minimizing average waiting time for a given set of processes?',
    options: [
      'First-Come, First-Served (FCFS)',
      'Shortest Job First / Shortest Remaining Time First (SJF / SRTF)',
      'Round Robin (RR)',
      'Multilevel Queue',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Executing shorter CPU bursts ahead of longer bursts reduces the waiting delay incurred by all subsequent jobs, making SJF/SRTF provably optimal for minimum average waiting time.',
    mistakeType: 'Arrival time preemption in SRTF and Round Robin queue order',
    hints: {
      hint1: 'Think about moving a short job ahead of a long job in a queue.',
      hint2: 'The short job’s wait decreases by the long job’s burst, which is greater than the increase for the long job.',
      hint3: 'Shortest Job First (SJF/SRTF) minimizes average waiting time.',
    },
  },
  {
    id: 'q_os_sync_1',
    subjectId: 'subj_cs204',
    topic: 'Semaphores & Critical Section',
    conceptId: 'os_sync',
    conceptName: 'Synchronization',
    difficulty: 'Hard',
    question: 'A counting semaphore S is initialized to 5. After 7 wait (P) operations and 4 signal (V) operations complete, what is the current value of S?',
    options: ['0', '2', '3', '8'],
    correctAnswerIndex: 1,
    explanation:
      'Each wait(P) decrements the semaphore by 1, and each signal(V) increments it by 1. Thus S = 5 - 7 + 4 = 2.',
    mistakeType: 'wait(P) and signal(V) ordering causing deadlock',
    hints: {
      hint1: 'What arithmetic operation does wait(P) perform on S?',
      hint2: 'wait(P) subtracts 1; signal(V) adds 1.',
      hint3: '5 - 7 + 4 = 2.',
    },
  },
  {
    id: 'q_os_dead_1',
    subjectId: 'subj_cs204',
    topic: 'Deadlock Necessary Conditions',
    conceptId: 'os_deadlocks',
    conceptName: 'Deadlocks',
    difficulty: 'Medium',
    question: 'Which of the following is NOT one of the four Coffman necessary conditions for a resource deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption of Resources', 'Circular Wait'],
    correctAnswerIndex: 2,
    explanation:
      'The four Coffman conditions are Mutual Exclusion, Hold and Wait, NO Preemption, and Circular Wait. Allowing preemption breaks deadlocks.',
    mistakeType: 'Computing Need = Max - Allocation in Banker’s matrix',
    hints: {
      hint1: 'Recall the 4 Coffman conditions required simultaneously for deadlock.',
      hint2: 'Can a deadlock persist if the OS can preempt (forcibly take back) resources?',
      hint3: 'No—the condition is "No Preemption", so "Preemption of Resources" is not a deadlock condition.',
    },
  },

  // 8. OBJECT-ORIENTED PROGRAMMING (subj_cs202)
  {
    id: 'q_oop_cls_1',
    subjectId: 'subj_cs202',
    topic: 'Encapsulation & Access Modifiers',
    conceptId: 'oop_encapsulation',
    conceptName: 'Encapsulation',
    difficulty: 'Easy',
    question: 'Which access modifier allows a class member to be accessed inside its own class and by derived subclasses, but NOT by unrelated external code?',
    options: ['private', 'protected', 'public', 'static'],
    correctAnswerIndex: 1,
    explanation:
      'protected members are hidden from external callers but remain accessible to subclasses in an inheritance hierarchy.',
    mistakeType: 'Protected vs private visibility in subclasses',
    hints: {
      hint1: 'private restricts access strictly to the declaring class.',
      hint2: 'public allows access from anywhere.',
      hint3: 'protected bridges the two for inheritance subclasses.',
    },
  },
  {
    id: 'q_oop_inh_1',
    subjectId: 'subj_cs202',
    topic: 'Constructor Order in Inheritance',
    conceptId: 'oop_inheritance',
    conceptName: 'Inheritance',
    difficulty: 'Medium',
    question: 'When instantiating a Derived class object that inherits from a Base class, in what order do constructors execute?',
    options: [
      'Base class constructor first, then Derived class constructor',
      'Derived class constructor first, then Base class constructor',
      'Only the Derived class constructor executes',
      'They execute in alphabetical order',
    ],
    correctAnswerIndex: 0,
    explanation:
      'The Base sub-object must be initialized before the Derived class body can safely use inherited members, so the Base constructor always runs first (and destructors run in reverse order).',
    mistakeType: 'Base-to-derived constructor execution order',
    hints: {
      hint1: 'Can a Derived class initialize itself before its Base foundation exists?',
      hint2: 'Base state must be constructed first.',
      hint3: 'Base constructor runs first, followed by Derived constructor.',
    },
  },
  {
    id: 'q_oop_poly_1',
    subjectId: 'subj_cs202',
    topic: 'Runtime Polymorphism & Dynamic Dispatch',
    conceptId: 'oop_polymorphism',
    conceptName: 'Polymorphism',
    difficulty: 'Hard',
    question: 'What mechanism enables a base class pointer or reference to invoke the overridden method of the actual derived object at runtime?',
    options: [
      'Compile-time function overloading',
      'Virtual methods and dynamic dispatch (vtable)',
      'Preprocessor macros',
      'Private constructors',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Declaring a method virtual (or using dynamic dispatch by default in Java/Python) looks up the overridden implementation in the object’s virtual method table (vtable) at runtime.',
    mistakeType: 'Missing virtual keyword causing static binding',
    hints: {
      hint1: 'Static binding looks at the pointer type at compile time.',
      hint2: 'Dynamic binding looks at the actual object type at runtime.',
      hint3: 'Virtual methods and vtables enable runtime polymorphism.',
    },
  },

  // 9. COMPUTER ORGANIZATION (subj_cs203)
  {
    id: 'q_co_pipe_1',
    subjectId: 'subj_cs203',
    topic: 'Pipeline RAW Data Hazards',
    conceptId: 'co_pipelining',
    conceptName: 'Pipelining',
    difficulty: 'Medium',
    question: 'In a 5-stage RISC pipeline, instruction I2 immediately reads a register that instruction I1 is still computing. What type of data hazard is this?',
    options: [
      'WAR (Write After Read)',
      'WAW (Write After Write)',
      'RAW (Read After Write — True Data Dependency)',
      'Structural Hazard',
    ],
    correctAnswerIndex: 2,
    explanation:
      'When I2 needs to read a value after I1 writes it, but I2 reaches the read stage before I1 completes write-back, a Read After Write (RAW) true dependency hazard occurs.',
    mistakeType: 'Load-use hazard stall cycle even with forwarding',
    hints: {
      hint1: 'I1 writes the register; I2 reads the result of I1.',
      hint2: 'In program order, the Read should happen After the Write.',
      hint3: 'This is a Read After Write (RAW) hazard.',
    },
  },
  {
    id: 'q_co_cache_1',
    subjectId: 'subj_cs203',
    topic: 'Cache Average Memory Access Time (AMAT)',
    conceptId: 'co_cache',
    conceptName: 'Cache Memory',
    difficulty: 'Hard',
    question: 'If L1 cache hit time is 2 ns, L1 miss rate is 5% (0.05), and main memory miss penalty is 100 ns, what is the Average Memory Access Time (AMAT)?',
    options: ['5 ns', '7 ns', '9.5 ns', '102 ns'],
    correctAnswerIndex: 2,
    explanation:
      ' wait—let us check the formula: AMAT = Hit Time + (Miss Rate × Miss Penalty) = 2 ns + (0.05 × 100 ns) = 2 + 5 = 7 ns! Wait: let us make sure correctAnswerIndex points to 7 ns (index 1).',
    mistakeType: 'Splitting address bits into Tag, Set Index, and Byte Offset',
    hints: {
      hint1: 'Use the formula: AMAT = Hit Time + (Miss Rate × Miss Penalty).',
      hint2: 'Miss Rate × Miss Penalty = 0.05 × 100 ns = 5 ns.',
      hint3: 'Add Hit Time: 2 ns + 5 ns = 7 ns.',
    },
  },

  // 10. COMPUTER NETWORKS (subj_cs302)
  {
    id: 'q_cn_osi_1',
    subjectId: 'subj_cs302',
    topic: 'OSI Model Layers & Addressing',
    conceptId: 'cn_osi',
    conceptName: 'OSI & TCP/IP',
    difficulty: 'Easy',
    question: 'Which layer of the OSI model is responsible for logical IP addressing and end-to-end packet routing across different networks?',
    options: ['Data Link Layer (Layer 2)', 'Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)'],
    correctAnswerIndex: 1,
    explanation:
      'The Network Layer (Layer 3) handles logical IP addressing and inter-network routing, whereas Layer 2 handles hop-by-hop MAC framing and Layer 4 handles end-to-end process ports.',
    mistakeType: 'Matching transport/network headers to OSI layers',
    hints: {
      hint1: 'Routers operate primarily at which OSI layer?',
      hint2: 'Layer 2 uses MAC addresses; Layer 3 uses IP addresses.',
      hint3: 'Network Layer (Layer 3).',
    },
  },
  {
    id: 'q_cn_ip_1',
    subjectId: 'subj_cs302',
    topic: 'CIDR Subnetting Usable Hosts',
    conceptId: 'cn_ip_subnet',
    conceptName: 'IPv4 & CIDR',
    difficulty: 'Medium',
    question: 'How many usable host IPv4 addresses are available in a /26 CIDR subnet (subnet mask 255.255.255.192)?',
    options: ['64', '62', '30', '126'],
    correctAnswerIndex: 1,
    explanation:
      'A /26 prefix leaves 32 - 26 = 6 host bits. Total addresses = 2^6 = 64. Subtracting the network address and broadcast address leaves 64 - 2 = 62 usable host addresses.',
    mistakeType: 'Subtracting network and broadcast addresses from 2^h - 2 hosts',
    hints: {
      hint1: 'How many host bits remain in a 32-bit IPv4 address with a /26 prefix?',
      hint2: '32 - 26 = 6 host bits -> 2^6 = 64 total addresses.',
      hint3: 'Subtract 2 (network and broadcast) -> 62 usable hosts.',
    },
  },
  {
    id: 'q_cn_tcp_1',
    subjectId: 'subj_cs302',
    topic: 'TCP 3-Way Handshake',
    conceptId: 'cn_tcp',
    conceptName: 'TCP Transport',
    difficulty: 'Medium',
    question: 'What is the exact sequence of control segments exchanged to establish a TCP connection?',
    options: [
      'SYN → ACK → FIN',
      'SYN → SYN-ACK → ACK',
      'ACK → SYN → SYN-ACK',
      'SYN → FIN-ACK → ACK',
    ],
    correctAnswerIndex: 1,
    explanation:
      'TCP uses a 3-way handshake: Client sends SYN, Server responds with SYN-ACK, and Client replies with ACK to synchronize initial sequence numbers.',
    mistakeType: 'cwnd halving vs reset to 1 MSS on 3 duplicate ACKs vs timeout',
    hints: {
      hint1: 'Both sides must synchronize their sequence numbers and acknowledge the other.',
      hint2: 'Client initiates with SYN; Server combines its SYN and ACK.',
      hint3: 'SYN → SYN-ACK → ACK.',
    },
  },

  // 11. WEB TECHNOLOGIES (subj_cs303)
  {
    id: 'q_web_js_1',
    subjectId: 'subj_cs303',
    topic: 'JavaScript Event Loop & Microtasks',
    conceptId: 'web_js_core',
    conceptName: 'JS & Event Loop',
    difficulty: 'Medium',
    question: 'In what order are numbers logged by the JavaScript Event Loop?',
    codeSnippet: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
    codeFilename: 'app.js',
    codeLanguage: 'JavaScript (ES6+)',
    options: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '1, 3, 4, 2'],
    correctAnswerIndex: 1,
    explanation:
      'Synchronous code (1, 4) runs first on the call stack. Then the microtask queue (Promise.then -> 3) is drained completely before the next macrotask (setTimeout -> 2).',
    mistakeType: 'Promise microtasks executing before setTimeout macrotasks',
    hints: {
      hint1: 'Synchronous console.log(1) and console.log(4) run immediately.',
      hint2: 'Does the Event Loop process Promise microtasks or setTimeout macrotasks first?',
      hint3: 'Microtasks run first: 1, 4, 3, 2.',
    },
  },
  {
    id: 'q_web_async_1',
    subjectId: 'subj_cs303',
    topic: 'Fetch API & HTTP Status Handling',
    conceptId: 'web_async_api',
    conceptName: 'Async & REST APIs',
    difficulty: 'Medium',
    question: 'When using the browser fetch() API, under what condition does the returned Promise reject automatically?',
    options: [
      'Whenever the server returns HTTP 404 or 500',
      'Only on a network failure or aborted request (HTTP 4xx/5xx resolve with res.ok === false)',
      'Whenever the response body is JSON',
      'Whenever a GET request has query parameters',
    ],
    correctAnswerIndex: 1,
    explanation:
      'fetch() only rejects on network-level failures. For HTTP 404 or 500 responses, fetch() resolves normally with response.ok set to false.',
    mistakeType: 'fetch() not rejecting on HTTP 404/500 without checking res.ok',
    hints: {
      hint1: 'Why do developers write if (!res.ok) throw new Error(...) after await fetch()?',
      hint2: 'Because HTTP 404/500 still resolve the fetch promise.',
      hint3: 'fetch() only rejects on network failure.',
    },
  },

  // 12. ENGINEERING PHYSICS (subj_ph101)
  {
    id: 'q_phy_fib_1',
    subjectId: 'subj_ph101',
    topic: 'Optical Fiber Numerical Aperture',
    conceptId: 'phy_fiber',
    conceptName: 'Fiber Optics',
    difficulty: 'Easy',
    question: 'For a step-index optical fiber with core refractive index n1 and cladding refractive index n2 (in air), what is the Numerical Aperture (NA)?',
    options: [
      'NA = n1 + n2',
      'NA = √(n1² − n2²)',
      'NA = n2 / n1',
      'NA = n1² + n2²',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Total internal reflection inside the fiber core yields sin(θa) = √(n1² − n2²), which defines the Numerical Aperture (NA) of the fiber.',
    mistakeType: 'Critical angle vs acceptance cone angle formula',
    hints: {
      hint1: 'Recall that n1 must be slightly greater than n2 for total internal reflection.',
      hint2: 'NA measures the light-gathering power sin(θ_acceptance).',
      hint3: 'NA = √(n1² − n2²).',
    },
  },
  {
    id: 'q_phy_qm_1',
    subjectId: 'subj_ph101',
    topic: 'Particle in a 1D Infinite Potential Well',
    conceptId: 'phy_quantum',
    conceptName: 'Quantum Mechanics',
    difficulty: 'Medium',
    question: 'If the ground-state energy (n = 1) of a quantum particle in a 1D infinite potential box of length L is E1 = 2 eV, what is the energy of the first excited state (n = 2)?',
    options: ['4 eV', '6 eV', '8 eV', '16 eV'],
    correctAnswerIndex: 2,
    explanation:
      'Energy eigenvalues in a 1D infinite potential well scale as En = n² E1. For n = 2, E2 = 2² × 2 eV = 4 × 2 eV = 8 eV.',
    mistakeType: 'Particle in 1D box energy scaling En proportional to n^2',
    hints: {
      hint1: 'Recall the formula En = (n² h²) / (8 m L²).',
      hint2: 'Notice that En is proportional to n², not n.',
      hint3: 'For n = 2, E2 = 4 × E1 = 8 eV.',
    },
  },

  // 13. ENGINEERING CHEMISTRY (subj_ch101)
  {
    id: 'q_chem_el_1',
    subjectId: 'subj_ch101',
    topic: 'Nernst Equation & Electrode Potential',
    conceptId: 'chem_electro',
    conceptName: 'Electrochemistry',
    difficulty: 'Easy',
    question: 'At 298 K (25 °C), how does the reduction potential E of a metal electrode M^(n+) + ne⁻ → M vary with ion concentration [M^(n+)] according to the Nernst equation?',
    options: [
      'E = E° + (0.0591 / n) log10([M^(n+)])',
      'E = E° − (0.0591 / n) log10([M^(n+)])',
      'E = E° × n',
      'E is independent of ion concentration',
    ],
    correctAnswerIndex: 0,
    explanation:
      'For the reduction M^(n+) + ne⁻ → M, the reaction quotient Q = 1/[M^(n+)]. Thus E = E° − (0.0591/n) log(1/[M^(n+)]) = E° + (0.0591/n) log([M^(n+)]).',
    mistakeType: 'Reaction quotient [oxidized]/[reduced] in Nernst log term',
    hints: {
      hint1: 'Write the Nernst equation: E = E° − (0.0591/n) log([Products]/[Reactants]).',
      hint2: 'Since solid metal [M] = 1, Q = 1 / [M^(n+)].',
      hint3: 'Flipping 1/[M^(n+)] inside the log changes the minus sign to a plus sign.',
    },
  },
  {
    id: 'q_chem_poly_1',
    subjectId: 'subj_ch101',
    topic: 'Polydispersity Index (PDI) of Polymers',
    conceptId: 'chem_polymers',
    conceptName: 'Polymers',
    difficulty: 'Medium',
    question: 'How is the Polydispersity Index (PDI) of a synthetic polymer sample defined in terms of weight-average (Mw) and number-average (Mn) molecular weights?',
    options: [
      'PDI = Mw / Mn (and is always ≥ 1)',
      'PDI = Mn / Mw (and is always < 1)',
      'PDI = Mw − Mn',
      'PDI = Mw × Mn',
    ],
    correctAnswerIndex: 0,
    explanation:
      'Polydispersity Index is defined as PDI = Mw / Mn. Because heavier chains contribute more to Mw than Mn, Mw ≥ Mn, so PDI ≥ 1 (equal to 1 only for monodisperse polymers).',
    mistakeType: 'Number-average Mn vs weight-average Mw molecular weight',
    hints: {
      hint1: 'Which average molecular weight is always greater or equal: Mw or Mn?',
      hint2: 'Weight-average Mw ≥ Number-average Mn.',
      hint3: 'PDI = Mw / Mn ≥ 1.',
    },
  },
];

// Fix q_co_cache_1 correctAnswerIndex to 1 ('7 ns') cleanly
const cacheQuestion = MULTI_SUBJECT_QUESTION_BANK.find((q) => q.id === 'q_co_cache_1');
if (cacheQuestion) {
  cacheQuestion.correctAnswerIndex = 1;
  cacheQuestion.explanation =
    'Using AMAT = Hit Time + (Miss Rate × Miss Penalty): AMAT = 2 ns + (0.05 × 100 ns) = 2 ns + 5 ns = 7 ns.';
}

/**
 * Returns subject-aware ConceptLessonData for any concept across any subject.
 * Uses rich C lessons for C Programming concepts and dynamically constructs
 * structured 6-section lessons for every other subject's concepts using its
 * subject questions and concept metadata.
 */
export function getSubjectConceptLesson(
  subjectId: string,
  subjectName: string,
  concept: ConceptNodeDefinition,
  subjectQuestions: QuestionMetadata[]
): ConceptLessonData {
  if (subjectId === 'subj_cs101' && CONCEPT_LESSONS[concept.id]) {
    return CONCEPT_LESSONS[concept.id];
  }

  const matchingQ =
    subjectQuestions.find((q) => q.conceptId === concept.id) || subjectQuestions[0];

  const buildSection = (levelLabel: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const levelIntro =
      levelLabel === 'Beginner'
        ? `In ${subjectName}, ${concept.name} introduces the core building blocks: ${concept.description}`
        : levelLabel === 'Intermediate'
        ? `At the Intermediate level of ${subjectName}, ${concept.name} focuses on problem-solving patterns: ${concept.description}`
        : `At the Advanced level of ${subjectName}, ${concept.name} emphasizes formal analysis, edge cases, and optimization: ${concept.description}`;

    return {
      whatIsIt: levelIntro,
      whyUsed: `${concept.shortName} is a foundational pillar in ${subjectName}. Mastering it prevents "${concept.deficitLabel}" and unlocks dependent topics in your syllabus chain.`,
      syntax:
        matchingQ?.codeSnippet ||
        `// ${subjectName} — ${concept.name}\n// Core Principle: ${concept.description}\n// Focus Area: ${concept.deficitLabel}`,
      codeExample: {
        title: `${concept.shortName} Worked Example in ${subjectName}`,
        code:
          matchingQ?.codeSnippet ||
          `/* ${subjectName}: ${concept.name} */\nStep 1: Identify given parameters for ${concept.shortName}\nStep 2: Apply ${concept.shortName} principles without ${concept.deficitLabel}\nStep 3: Verify result against constraints`,
        output: matchingQ
          ? `Verified Answer: ${matchingQ.options[matchingQ.correctAnswerIndex]}`
          : `${concept.shortName} verified successfully.`,
        walkthrough: matchingQ
          ? [matchingQ.hints.hint1, matchingQ.hints.hint2, matchingQ.explanation]
          : [
              `Understand the definition and scope of ${concept.name}.`,
              `Check prerequisites (${concept.prerequisites.length > 0 ? concept.prerequisites.join(', ') : 'Foundational Topic'}) before applying ${concept.shortName}.`,
              `Guard against the common pitfall: ${concept.deficitLabel}.`,
            ],
      },
      commonMistakes: [
        {
          mistakeTitle: concept.deficitLabel,
          badCode: matchingQ
            ? `Incorrect approach: Selecting "${matchingQ.options[(matchingQ.correctAnswerIndex + 1) % matchingQ.options.length]}"`
            : `Skipping boundary & prerequisite checks in ${concept.shortName}`,
          fixedCode: matchingQ
            ? `Correct approach: "${matchingQ.options[matchingQ.correctAnswerIndex]}"`
            : `Applying verified ${concept.shortName} rules step-by-step`,
          explanation:
            matchingQ?.explanation ||
            `In ${subjectName}, students frequently encounter "${concept.deficitLabel}" when rushing through ${concept.shortName}. Always verify constraints step by step.`,
        },
      ],
      practicePrompt: matchingQ
        ? {
            question: matchingQ.question,
            code: matchingQ.codeSnippet,
            options: matchingQ.options,
            correctIndex: matchingQ.correctAnswerIndex,
            explanation: matchingQ.explanation,
          }
        : {
            question: `Which key pitfall should you carefully avoid when working with ${concept.name} in ${subjectName}?`,
            options: [
              concept.deficitLabel,
              'Using structured step-by-step verification',
              'Checking prerequisite concepts',
              'Validating boundary conditions',
            ],
            correctIndex: 0,
            explanation: `"${concept.deficitLabel}" is the primary error pattern tracked for ${concept.name} in ${subjectName}.`,
          },
    };
  };

  return {
    conceptId: concept.id,
    title: `${concept.name} (${subjectName})`,
    subtitle: concept.description,
    levels: {
      Beginner: buildSection('Beginner'),
      Intermediate: buildSection('Intermediate'),
      Advanced: buildSection('Advanced'),
    },
  };
}
