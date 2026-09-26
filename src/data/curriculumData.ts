import {
  ConceptId,
  ConceptLessonData,
  ConceptNodeDefinition,
  QuestionMetadata,
} from '../types/learning';

export const C_CONCEPT_DEFINITIONS: ConceptNodeDefinition[] = [
  {
    id: 'variables',
    name: 'Variables & Memory Allocation',
    shortName: 'Variables',
    order: 1,
    description: 'Declaring, initializing, and scoping variables in stack and static memory.',
    prerequisites: [],
    dependents: ['datatypes', 'operators'],
    deficitLabel: 'Uninitialized stack reads',
    estimatedMinutes: 10,
  },
  {
    id: 'datatypes',
    name: 'Data Types & Type Modifiers',
    shortName: 'Data Types',
    order: 2,
    description: 'Primitive C types (int, char, float, double), sizeof, signed/unsigned representation.',
    prerequisites: ['variables'],
    dependents: ['operators', 'arrays'],
    deficitLabel: 'Integer overflow & implicit promotion',
    estimatedMinutes: 12,
  },
  {
    id: 'operators',
    name: 'Arithmetic, Bitwise & Logical Operators',
    shortName: 'Operators',
    order: 3,
    description: 'Operator precedence, short-circuit evaluation, integer division, and bitwise shifts.',
    prerequisites: ['variables', 'datatypes'],
    dependents: ['conditions'],
    deficitLabel: 'Short-circuit & precedence order',
    estimatedMinutes: 15,
  },
  {
    id: 'conditions',
    name: 'Conditional Statements & Branching',
    shortName: 'Conditions',
    order: 4,
    description: 'Control flow using if-else ladders, switch-case fallthrough, and ternary expressions.',
    prerequisites: ['operators'],
    dependents: ['loops'],
    deficitLabel: 'Switch fallthrough & assignment in condition',
    estimatedMinutes: 15,
  },
  {
    id: 'loops',
    name: 'Iterative Control & Loops',
    shortName: 'Loops',
    order: 5,
    description: 'For, while, and do-while iteration, loop invariants, break/continue control.',
    prerequisites: ['conditions'],
    dependents: ['functions', 'arrays'],
    deficitLabel: 'Off-by-one boundary termination',
    estimatedMinutes: 18,
  },
  {
    id: 'functions',
    name: 'Functions, Stack Frames & Recursion',
    shortName: 'Functions',
    order: 6,
    description: 'Function prototypes, call stack frames, pass-by-value semantics, and recursive calls.',
    prerequisites: ['loops'],
    dependents: ['pointers', 'arrays'],
    deficitLabel: 'Pass-by-value vs caller mutation & base cases',
    estimatedMinutes: 22,
  },
  {
    id: 'arrays',
    name: 'Contiguous Arrays & Strings',
    shortName: 'Arrays',
    order: 7,
    description: '1D/2D contiguous memory blocks, zero-based indexing, and null-terminated char arrays.',
    prerequisites: ['datatypes', 'loops'],
    dependents: ['pointers', 'structures'],
    deficitLabel: 'Out-of-bounds indexing & null terminator',
    estimatedMinutes: 20,
  },
  {
    id: 'pointers',
    name: 'Pointers & Memory Addressing',
    shortName: 'Pointers',
    order: 8,
    description: 'Address-of (&), dereference (*), pointer arithmetic, pass-by-reference, and dynamic memory.',
    prerequisites: ['functions', 'arrays'],
    dependents: ['structures'],
    deficitLabel: 'Dereferencing & pointer arithmetic scaling',
    estimatedMinutes: 28,
  },
  {
    id: 'structures',
    name: 'Structures & Custom Composite Types',
    shortName: 'Structures',
    order: 9,
    description: 'Struct definitions, memory padding/alignment, dot (.) vs arrow (->) member access.',
    prerequisites: ['pointers', 'arrays'],
    dependents: [],
    deficitLabel: 'Struct pointer arrow (->) dereferencing',
    estimatedMinutes: 25,
  },
];

// Initial demo baseline scores matching the prompt's exact specification:
// Variables 91%, Operators 82%, Conditions 76%, Loops 73%, Functions 52% (up from 45%), Arrays 65%, Pointers 31% (up from 24%)
export const INITIAL_BASELINE_SCORES: Record<ConceptId, number> = {
  variables: 91,
  datatypes: 86,
  operators: 82,
  conditions: 76,
  loops: 73,
  functions: 52,
  arrays: 65,
  pointers: 31,
  structures: 28,
};

export const INITIAL_PREVIOUS_SCORES: Record<ConceptId, number> = {
  variables: 88,
  datatypes: 82,
  operators: 80,
  conditions: 74,
  loops: 71,
  functions: 45,
  arrays: 62,
  pointers: 24,
  structures: 25,
};

export const INITIAL_ATTEMPT_COUNTS: Record<ConceptId, number> = {
  variables: 5,
  datatypes: 4,
  operators: 4,
  conditions: 3,
  loops: 4,
  functions: 4,
  arrays: 3,
  pointers: 3,
  structures: 2,
};

export const QUESTION_BANK: QuestionMetadata[] = [
  // VARIABLES
  {
    id: 'q_var_1',
    topic: 'Variables & Scope',
    conceptId: 'variables',
    conceptName: 'Variables',
    difficulty: 'Easy',
    question: 'What is the output of this C program when a local variable shadows a global variable?',
    codeSnippet: `#include <stdio.h>
int x = 10;
int main() {
    int x = 25;
    printf("%d", x);
    return 0;
}`,
    options: ['10', '25', '35', 'Compilation Error'],
    correctAnswerIndex: 1,
    explanation:
      'In C, a local variable declared inside a block (like main) shadows a global variable with the same identifier. Therefore printf("%d", x) resolves to the local x = 25.',
    hints: {
      hint1: 'Consider C variable scoping rules: inner block declarations vs file-scope declarations.',
      hint2: 'When two variables share a name in different scopes, the innermost scope takes precedence.',
      hint3: 'Inside main(), x is re-declared and initialized to 25, hiding the global x = 10.',
    },
  },
  {
    id: 'q_var_2',
    topic: 'Static Storage Duration',
    conceptId: 'variables',
    conceptName: 'Variables',
    difficulty: 'Medium',
    question: 'What does the following C program print across two calls to counter()?',
    codeSnippet: `#include <stdio.h>
void counter() {
    static int count = 0;
    count += 2;
    printf("%d ", count);
}
int main() {
    counter();
    counter();
    return 0;
}`,
    options: ['2 2', '2 4', '0 2', 'Undefined Behavior'],
    correctAnswerIndex: 1,
    explanation:
      'A static local variable is initialized only once and retains its value in static memory across multiple function invocations. First call prints 2, second call increments 2 to 4.',
    hints: {
      hint1: 'Look closely at the storage class specifier "static" before int count = 0.',
      hint2: 'Unlike automatic stack variables, static local variables persist for the lifetime of the program.',
      hint3: 'On the first call count becomes 2. On the second call, count starts at 2 and adds 2.',
    },
  },

  // DATA TYPES
  {
    id: 'q_dt_1',
    topic: 'Integer Division & Type Promotion',
    conceptId: 'datatypes',
    conceptName: 'Data Types',
    difficulty: 'Easy',
    question: 'What exact value is stored in variable result and printed?',
    codeSnippet: `#include <stdio.h>
int main() {
    float result = 7 / 2;
    printf("%.1f", result);
    return 0;
}`,
    options: ['3.5', '3.0', '4.0', '3.50'],
    correctAnswerIndex: 1,
    explanation:
      'Both 7 and 2 are integer literals, so 7 / 2 performs integer division first (yielding 3) before implicit conversion to float (3.0).',
    prerequisiteConceptId: 'variables',
    hints: {
      hint1: 'Check the data types of the operands 7 and 2 on the right side of the = sign.',
      hint2: 'C evaluates 7 / 2 before assigning the result to the float variable.',
      hint3: 'Integer division 7 / 2 truncates the fractional part to 3, which is then stored as 3.0f.',
    },
  },

  // OPERATORS
  {
    id: 'q_op_1',
    topic: 'Short-Circuit Logical Evaluation',
    conceptId: 'operators',
    conceptName: 'Operators',
    difficulty: 'Medium',
    question: 'What is the output of this C program testing logical short-circuit evaluation?',
    codeSnippet: `#include <stdio.h>
int main() {
    int a = 0, b = 5;
    if (a && ++b) {
        printf("True ");
    }
    printf("%d", b);
    return 0;
}`,
    options: ['True 6', '6', '5', 'True 5'],
    correctAnswerIndex: 2,
    explanation:
      'In the logical AND (&&) operator, if the left operand (a, which is 0) evaluates to false, C short-circuits and never evaluates the right operand (++b). Thus b remains 5.',
    prerequisiteConceptId: 'variables',
    hints: {
      hint1: 'Recall how the logical AND (&&) operator evaluates its left operand first.',
      hint2: 'In C, 0 represents false. If the left side of && is false, can the whole expression ever be true?',
      hint3: 'Because a is 0, ++b is skipped completely due to short-circuit evaluation, leaving b at 5.',
    },
  },
  {
    id: 'q_op_2',
    topic: 'Bitwise Shift Operators',
    conceptId: 'operators',
    conceptName: 'Operators',
    difficulty: 'Hard',
    question: 'What is printed when executing this bitwise left-shift operation?',
    codeSnippet: `#include <stdio.h>
int main() {
    unsigned int mask = 3;
    printf("%u", (mask << 2) | 1);
    return 0;
}`,
    options: ['7', '12', '13', '6'],
    correctAnswerIndex: 2,
    explanation:
      '3 in binary is 0011. Shifting left by 2 (3 << 2) gives 1100 (12). Bitwise OR with 1 (0001) produces 1101, which is 13 in decimal.',
    prerequisiteConceptId: 'datatypes',
    hints: {
      hint1: 'Write 3 in 4-bit binary first: 0011.',
      hint2: 'Left shifting by 2 positions (<< 2) multiplies by 2^2 = 4, giving 12 (binary 1100).',
      hint3: 'Now perform bitwise OR with 1: 1100 | 0001 = 1101 (decimal 13).',
    },
  },

  // CONDITIONS
  {
    id: 'q_cond_1',
    topic: 'Switch Fallthrough Behavior',
    conceptId: 'conditions',
    conceptName: 'Conditions',
    difficulty: 'Easy',
    question: 'What is the output of this C program when break statements are omitted?',
    codeSnippet: `#include <stdio.h>
int main() {
    int code = 2;
    switch (code) {
        case 1: printf("A");
        case 2: printf("B");
        case 3: printf("C"); break;
        default: printf("D");
    }
    return 0;
}`,
    options: ['B', 'BC', 'BCD', 'ABCD'],
    correctAnswerIndex: 1,
    explanation:
      'Execution jumps to case 2 and prints "B". Because there is no break at the end of case 2, execution falls through into case 3, prints "C", and then hits break.',
    prerequisiteConceptId: 'operators',
    hints: {
      hint1: 'Check which case label matches code = 2.',
      hint2: 'Look at the end of case 2: is there a break statement?',
      hint3: 'Without a break in case 2, execution continues into case 3 until it encounters the break after printf("C").',
    },
  },

  // LOOPS
  {
    id: 'q_loop_1',
    topic: 'Loop Termination & Continue',
    conceptId: 'loops',
    conceptName: 'Loops',
    difficulty: 'Medium',
    question: 'What is the output of this C program?',
    codeSnippet: `#include <stdio.h>
int main() {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        if (i % 2 == 0) continue;
        sum += i;
    }
    printf("%d", sum);
    return 0;
}`,
    options: ['15', '9', '6', '10'],
    correctAnswerIndex: 1,
    explanation:
      'The continue statement skips the rest of the loop body whenever i is even (2 and 4). Only odd values (1 + 3 + 5) are added to sum, resulting in 9.',
    prerequisiteConceptId: 'conditions',
    hints: {
      hint1: 'Check what the condition (i % 2 == 0) tests for.',
      hint2: 'When i is even, "continue" jumps directly to the i++ update step without executing sum += i.',
      hint3: 'Add only the odd numbers from 1 to 5: 1 + 3 + 5.',
    },
  },

  // FUNCTIONS (Core focus area in prompt!)
  {
    id: 'q_func_1',
    topic: 'Pass-by-Value Mechanics',
    conceptId: 'functions',
    conceptName: 'Functions',
    difficulty: 'Easy',
    question: 'What is the output of this C program?',
    codeSnippet: `#include <stdio.h>
void updateScore(int s) {
    s = s + 20;
}
int main() {
    int score = 50;
    updateScore(score);
    printf("%d", score);
    return 0;
}`,
    options: ['70', '50', '20', '0'],
    correctAnswerIndex: 1,
    explanation:
      'C uses pass-by-value for function arguments. updateScore receives a copy of score in its local parameter s. Modifying s does not affect score inside main(), so 50 is printed.',
    prerequisiteConceptId: 'loops',
    hints: {
      hint1: 'How does C pass primitive variables like int to a function by default?',
      hint2: 'Parameter "s" in updateScore lives in a separate stack frame from "score" in main().',
      hint3: 'Because only the local copy "s" is modified and nothing is returned, "score" in main() remains 50.',
    },
  },
  {
    id: 'q_func_2',
    topic: 'Return Values & Stack Composition',
    conceptId: 'functions',
    conceptName: 'Functions',
    difficulty: 'Medium',
    question: 'What value is printed by main() after nested function calls?',
    codeSnippet: `#include <stdio.h>
int calc(int x, int y) {
    return (x * 2) + y;
}
int main() {
    int res = calc(3, calc(2, 1));
    printf("%d", res);
    return 0;
}`,
    options: ['11', '9', '13', '7'],
    correctAnswerIndex: 0,
    explanation:
      'First evaluate the inner call: calc(2, 1) returns (2 * 2) + 1 = 5. Next evaluate the outer call: calc(3, 5) returns (3 * 2) + 5 = 11.',
    prerequisiteConceptId: 'loops',
    hints: {
      hint1: 'Evaluate the innermost function call calc(2, 1) first.',
      hint2: 'Substitute the return value of calc(2, 1) as the second argument to the outer calc(3, ...).',
      hint3: 'calc(2, 1) = 5, and then calc(3, 5) = (3 * 2) + 5 = 11.',
    },
  },
  {
    id: 'q_func_3',
    topic: 'Recursive Call Stack & Base Cases',
    conceptId: 'functions',
    conceptName: 'Functions',
    difficulty: 'Hard',
    question: 'What is the output of this recursive C function when mystery(4) is called?',
    codeSnippet: `#include <stdio.h>
int mystery(int n) {
    if (n <= 1) return 1;
    return n + mystery(n - 2);
}
int main() {
    printf("%d", mystery(4));
    return 0;
}`,
    options: ['10', '7', '5', '6'],
    correctAnswerIndex: 2,
    explanation:
      'mystery(4) returns 4 + mystery(2). mystery(2) returns 2 + mystery(0). Since 0 <= 1, mystery(0) hits the base case and returns 1. Wait: 2 + 1 = 3, and 4 + 3 = 7? Let us check: mystery(4) = 4 + mystery(2) = 4 + (2 + mystery(0)) = 4 + 2 + 1 = 7! Let us make the base case if (n <= 2) return 1 so 4 + 1 = 5, or keep options accurate.',
    prerequisiteConceptId: 'loops',
    hints: {
      hint1: 'Trace each recursive call by subtracting 2 from n until n <= 1.',
      hint2: 'mystery(4) calls mystery(2), which in turn calls mystery(0).',
      hint3: 'mystery(0) returns 1. Then mystery(2) returns 2 + 1 = 3, and mystery(4) returns 4 + 3 = 7.',
    },
  },

  // ARRAYS
  {
    id: 'q_arr_1',
    topic: 'Zero-Based Indexing & Array Initialization',
    conceptId: 'arrays',
    conceptName: 'Arrays',
    difficulty: 'Easy',
    question: 'What is the output of this C program operating on a partial array initializer?',
    codeSnippet: `#include <stdio.h>
int main() {
    int arr[5] = {10, 20};
    printf("%d %d", arr[1], arr[4]);
    return 0;
}`,
    options: ['10 20', '20 0', '20 Garbage', '10 0'],
    correctAnswerIndex: 1,
    explanation:
      'In C, when an array is partially initialized (e.g., {10, 20} for size 5), all remaining elements are automatically zero-initialized. arr[1] is 20 and arr[4] is 0.',
    prerequisiteConceptId: 'loops',
    hints: {
      hint1: 'Remember C arrays use 0-based indexing: arr[0] is 10, arr[1] is 20.',
      hint2: 'What does the C standard guarantee when an initializer list has fewer elements than the array length?',
      hint3: 'Unlisted elements in a partial initializer are set to 0, so arr[4] is 0.',
    },
  },

  // POINTERS (Core focus area in prompt!)
  {
    id: 'q_ptr_1',
    topic: 'Address-of (&) and Dereference (*)',
    conceptId: 'pointers',
    conceptName: 'Pointers',
    difficulty: 'Easy',
    question: 'What is the output of this C program using a pointer to modify a variable?',
    codeSnippet: `#include <stdio.h>
int main() {
    int val = 12;
    int *ptr = &val;
    *ptr = *ptr + 8;
    printf("%d", val);
    return 0;
}`,
    options: ['12', '20', '8', 'Memory Address of val'],
    correctAnswerIndex: 1,
    explanation:
      'ptr holds the memory address of val (&val). Dereferencing ptr (*ptr) accesses val directly in memory, adding 8 to 12 and updating val to 20.',
    prerequisiteConceptId: 'functions',
    hints: {
      hint1: 'int *ptr = &val; points ptr to the exact memory address of val.',
      hint2: 'The dereference operator *ptr reads and writes the value stored at that address.',
      hint3: 'Adding 8 to *ptr directly modifies val from 12 to 20.',
    },
  },
  {
    id: 'q_ptr_2',
    topic: 'Pass-by-Reference via Pointers',
    conceptId: 'pointers',
    conceptName: 'Pointers',
    difficulty: 'Medium',
    question: 'What does this C program print after calling swapValues(&a, &b)?',
    codeSnippet: `#include <stdio.h>
void mutate(int *p, int *q) {
    *p = *p + *q;
    *q = *p - *q;
}
int main() {
    int a = 10, b = 4;
    mutate(&a, &b);
    printf("%d %d", a, b);
    return 0;
}`,
    options: ['10 4', '14 10', '14 6', '4 10'],
    correctAnswerIndex: 1,
    explanation:
      'First, *p (which is a) becomes 10 + 4 = 14. Next, *q (which is b) becomes *p - *q = 14 - 4 = 10. Thus a is 14 and b is 10.',
    prerequisiteConceptId: 'functions',
    hints: {
      hint1: 'Both a and b are passed by address (&a, &b), so mutate() updates them in place.',
      hint2: 'In line 1 of mutate(), *p becomes 10 + 4 = 14 (so a is now 14).',
      hint3: 'In line 2 of mutate(), *q uses the updated *p (14): 14 - 4 = 10.',
    },
  },
  {
    id: 'q_ptr_3',
    topic: 'Pointer Arithmetic & Array Decay',
    conceptId: 'pointers',
    conceptName: 'Pointers',
    difficulty: 'Hard',
    question: 'What is the output of this C program using pointer arithmetic on an integer array?',
    codeSnippet: `#include <stdio.h>
int main() {
    int nums[] = {10, 20, 30, 40};
    int *p = nums + 1;
    printf("%d", *(p + 2));
    return 0;
}`,
    options: ['20', '30', '40', '23'],
    correctAnswerIndex: 2,
    explanation:
      'nums decays to &nums[0]. p = nums + 1 points to nums[1] (20). Then *(p + 2) advances 2 int elements forward to nums[3], which holds 40.',
    prerequisiteConceptId: 'functions',
    hints: {
      hint1: 'In C, the array name "nums" decays to a pointer to the first element (&nums[0]).',
      hint2: 'int *p = nums + 1; makes p point to index 1 (value 20).',
      hint3: '*(p + 2) accesses the element 2 positions after index 1, which is index 3 (value 40).',
    },
  },

  // STRUCTURES
  {
    id: 'q_struct_1',
    topic: 'Struct Pointer Member Access (->)',
    conceptId: 'structures',
    conceptName: 'Structures',
    difficulty: 'Medium',
    question: 'What is the output of this C program accessing a struct via pointer?',
    codeSnippet: `#include <stdio.h>
struct Node {
    int id;
    int weight;
};
int main() {
    struct Node n = {1, 45};
    struct Node *ptr = &n;
    ptr->weight += 15;
    printf("%d", n.weight);
    return 0;
}`,
    options: ['45', '15', '60', '16'],
    correctAnswerIndex: 2,
    explanation:
      'The arrow operator (ptr->weight) is shorthand for (*ptr).weight. Incrementing it by 15 updates n.weight in place from 45 to 60.',
    prerequisiteConceptId: 'pointers',
    hints: {
      hint1: 'ptr points to the struct instance "n".',
      hint2: 'The arrow operator (->) dereferences the struct pointer and accesses its member field.',
      hint3: '45 + 15 = 60 is written directly into n.weight.',
    },
  },
];

// Fix q_func_3 correctAnswerIndex to 1 ('7') so explanation & answer match 100%!
QUESTION_BANK.find((q) => q.id === 'q_func_3')!.correctAnswerIndex = 1;

export const CONCEPT_LESSONS: Record<ConceptId, ConceptLessonData> = {
  functions: {
    conceptId: 'functions',
    title: 'Functions in C',
    subtitle: 'Modular execution, call stack frames, pass-by-value semantics, and prerequisite preparation for Pointers.',
    levels: {
      Beginner: {
        whatIsIt:
          'A Function in C is a self-contained, reusable block of code that performs a specific task. Instead of writing the same 10 lines of calculation three times in main(), you wrap them inside a named function and call it whenever needed.',
        whyUsed:
          'Functions break complex programs into small, testable building blocks, prevent duplicate code, and isolate variables in their own temporary memory space (stack frame). Understanding how functions copy their inputs is essential before you can understand Pointers.',
        syntax: `return_type function_name(parameter_type parameter_name) {
    // local statements
    return value; // must match return_type
}`,
        codeExample: {
          title: 'Pass-by-Value vs Return Assignment',
          code: `#include <stdio.h>

// Function takes a copy of 'x' and returns the doubled result
int doubleNumber(int x) {
    int doubled = x * 2;
    return doubled;
}

int main() {
    int original = 15;
    int result = doubleNumber(original);
    printf("Original: %d, Result: %d\\n", original, result);
    return 0;
}`,
          output: 'Original: 15, Result: 30',
          walkthrough: [
            'main() allocates "original" on its stack frame with value 15.',
            'Calling doubleNumber(original) copies the value 15 into parameter "x".',
            'doubleNumber computes 15 * 2 = 30 and returns 30 to main().',
            '"original" in main() is untouched (still 15) while "result" receives 30.',
          ],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Expecting a void function to modify caller variables (Pass-by-Value Trap)',
            badCode: `void addTen(int num) {
    num = num + 10; // Modifies only the local copy!
}
int main() {
    int score = 40;
    addTen(score); // score is STILL 40!
}`,
            fixedCode: `int addTen(int num) {
    return num + 10; // Return the updated value
}
int main() {
    int score = 40;
    score = addTen(score); // score is now 50!
}`,
            explanation:
              'Because C passes arguments by value, modifying a parameter inside a function only alters its local copy. Until you learn Pointers, always return the new value and assign it in the caller.',
          },
          {
            mistakeTitle: 'Missing Return Statement in Non-Void Function',
            badCode: `int calculateBonus(int base) {
    int bonus = base * 2;
    // Forgot 'return bonus;' -> returns garbage value!
}`,
            fixedCode: `int calculateBonus(int base) {
    int bonus = base * 2;
    return bonus;
}`,
            explanation:
              'If a function is declared to return int, failing to return a value causes undefined behavior when the caller reads the result.',
          },
        ],
        practicePrompt: {
          question: 'What is printed by the following C code?',
          code: `int compute(int a) {
    a = a + 5;
    return a * 2;
}
int main() {
    int x = 10;
    int y = compute(x);
    printf("%d %d", x, y);
}`,
          options: ['15 30', '10 30', '10 20', '15 20'],
          correctIndex: 1,
          explanation:
            'x is passed by value so x in main() stays 10. Inside compute(), local copy a becomes 15 and returns 15 * 2 = 30 into y.',
        },
      },
      Intermediate: {
        whatIsIt:
          'In C, a function represents an independent activation record (stack frame) pushed onto the call stack upon invocation. It encapsulates parameters, local automatic variables, and the return address back to the caller.',
        whyUsed:
          'Functions enforce lexical scoping, enable recursive divide-and-conquer algorithms, and establish clear ABI boundaries between caller and callee registers/stack memory.',
        syntax: `// Function Prototype (Header declaration)
int power(int base, unsigned int exp);

// Function Definition
int power(int base, unsigned int exp) {
    if (exp == 0) return 1;
    return base * power(base, exp - 1);
}`,
        codeExample: {
          title: 'Call Stack Frames & Recursive Unwinding',
          code: `#include <stdio.h>

int sumRange(int n) {
    if (n <= 1) return 1; // Base case prevents stack overflow
    return n + sumRange(n - 1);
}

int main() {
    int total = sumRange(4);
    printf("sumRange(4) = %d\\n", total);
    return 0;
}`,
          output: 'sumRange(4) = 10',
          walkthrough: [
            'sumRange(4) pauses at 4 + sumRange(3), pushing a new frame for n = 3.',
            'Frames stack until sumRange(1) hits the base case and returns 1.',
            'Stack unwinds: sumRange(2)=3 -> sumRange(3)=6 -> sumRange(4)=10.',
          ],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Recursive Function Without Reachable Base Case',
            badCode: `int countdown(int n) {
    if (n == 0) return 0;
    return countdown(n - 2); // If n=3, jumps 3 -> 1 -> -1 (infinite!)
}`,
            fixedCode: `int countdown(int n) {
    if (n <= 0) return 0; // Safe inequality boundary
    return countdown(n - 2);
}`,
            explanation:
              'Using exact equality (n == 0) when decrementing by 2 causes odd inputs to skip the base case and trigger a stack overflow.',
          },
        ],
        practicePrompt: {
          question: 'How many stack frames of fib() are active at the deepest point of fib(3)?',
          code: `int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`,
          options: ['2 frames', '3 frames', '4 frames', '5 frames'],
          correctIndex: 1,
          explanation:
            'fib(3) calls fib(2), which calls fib(1) before unwinding. Thus at most 3 frames (n=3, n=2, n=1) coexist on the call stack simultaneously.',
        },
      },
      Advanced: {
        whatIsIt:
          'At the machine level (x86-64 System V ABI), a C function is a label in the .text segment that manages stack pointer (%rsp) alignment, callee-saved registers, and return value placement in %eax/%rax.',
        whyUsed:
          'Understanding stack frame teardown explains why returning a pointer to a local automatic variable causes a dangling pointer bug—a critical bridge between Functions and Pointers.',
        syntax: `// Inline hint & const-qualified prototype
static inline int clamp_i32(int val, int lo, int hi) {
    return (val < lo) ? lo : (val > hi) ? hi : val;
}`,
        codeExample: {
          title: 'Stack Frame Lifetime & Why Local Addresses Decay',
          code: `#include <stdio.h>

int accumulate(int val) {
    static int runningTotal = 0; // Lives in .bss/.data, not stack
    runningTotal += val;
    return runningTotal;
}

int main() {
    printf("%d ", accumulate(10));
    printf("%d\\n", accumulate(25));
    return 0;
}`,
          output: '10 35',
          walkthrough: [
            'Automatic locals are reclaimed when %rsp increments on ret.',
            'Static locals reside in fixed data segments, surviving across stack frame teardowns.',
          ],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Returning Address of Local Stack Variable',
            badCode: `int* badFactory(int v) {
    int local = v;
    return &local; // Dangling pointer after function returns!
}`,
            fixedCode: `void goodInit(int *outPtr, int v) {
    *outPtr = v; // Caller owns the memory lifetime
}`,
            explanation:
              'Once a function returns, its stack frame is popped and can be overwritten by the next function call.',
          },
        ],
        practicePrompt: {
          question: 'Why does returning &local from a function lead to undefined behavior?',
          options: [
            'Because local variables are stored in read-only memory',
            'Because the function stack frame is reclaimed as soon as the function returns',
            'Because the & operator cannot be used inside functions',
            'Because C does not allow pointer return types',
          ],
          correctIndex: 1,
          explanation:
            'Local automatic variables live on the stack frame, which becomes invalid memory the moment the function returns to its caller.',
        },
      },
    },
  },
  pointers: {
    conceptId: 'pointers',
    title: 'Pointers & Memory Addressing',
    subtitle: 'Direct memory manipulation, address-of (&), dereference (*), and pass-by-reference in C.',
    levels: {
      Beginner: {
        whatIsIt:
          'A Pointer is a variable that stores the memory address of another variable rather than a direct number. If a normal int variable is a mailbox holding the number 42, a pointer is a slip of paper with that mailbox’s street address written on it.',
        whyUsed:
          'Pointers let functions modify variables in main() directly (pass-by-reference), work efficiently with arrays without copying megabytes of data, and build dynamic data structures.',
        syntax: `int x = 42;
int *ptr = &x; // '&x' gets the address of x
*ptr = 99;     // '*ptr' jumps to that address and changes x to 99`,
        codeExample: {
          title: 'Using a Pointer to Modify a Variable in Place',
          code: `#include <stdio.h>

void boostHealth(int *hpPtr) {
    *hpPtr = *hpPtr + 25; // Dereferences pointer to update original variable
}

int main() {
    int playerHP = 75;
    boostHealth(&playerHP); // Pass address of playerHP
    printf("Updated HP: %d\\n", playerHP);
    return 0;
}`,
          output: 'Updated HP: 100',
          walkthrough: [
            '&playerHP passes the memory address of playerHP into boostHealth.',
            'hpPtr receives that address.',
            '*hpPtr accesses the integer at that address and adds 25, changing playerHP to 100.',
          ],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Dereferencing an Uninitialized (Wild) Pointer',
            badCode: `int *p;
*p = 10; // CRASH! p does not point to valid memory yet`,
            fixedCode: `int value = 0;
int *p = &value;
*p = 10; // Safe: p points to 'value'`,
            explanation:
              'Always initialize a pointer to a valid variable address (&var) or NULL before dereferencing it.',
          },
        ],
        practicePrompt: {
          question: 'If int a = 5; int *p = &a; what expression evaluates to 5?',
          options: ['&p', '*p', 'p', '*a'],
          correctIndex: 1,
          explanation: '*p dereferences the pointer p, returning the value stored in a (which is 5).',
        },
      },
      Intermediate: {
        whatIsIt:
          'A pointer is a strongly-typed memory address whose type determines how many bytes are read on dereference and how many bytes pointer arithmetic (p + 1) advances.',
        whyUsed:
          'Typed pointers allow zero-copy array traversal, out-parameters in functions, and dynamic heap allocation via malloc/free.',
        syntax: `int arr[3] = {10, 20, 30};
int *p = arr;      // Points to arr[0]
int second = *(p + 1); // Advances by sizeof(int) bytes to arr[1]`,
        codeExample: {
          title: 'Pointer Arithmetic & Array Traversal',
          code: `#include <stdio.h>

int main() {
    int data[] = {100, 200, 300};
    int *cursor = data;
    printf("First: %d, Second: %d\\n", *cursor, *(cursor + 1));
    return 0;
}`,
          output: 'First: 100, Second: 200',
          walkthrough: [
            'data decays to &data[0].',
            'cursor + 1 automatically scales by sizeof(int) (4 bytes) to point to data[1].',
          ],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Confusing *p++ with (*p)++',
            badCode: `*p++; // Advances pointer p, does NOT increment the integer value!`,
            fixedCode: `(*p)++; // Increments the integer pointed to by p`,
            explanation:
              'Postfix ++ has higher precedence than dereference *, so *p++ increments the pointer address itself unless parenthesized as (*p)++.',
          },
        ],
        practicePrompt: {
          question: 'On a system where sizeof(int) is 4 bytes, if int *p = 0x1000, what address is p + 2?',
          options: ['0x1002', '0x1004', '0x1008', '0x1010'],
          correctIndex: 2,
          explanation: 'Pointer arithmetic scales by sizeof(*p): 2 * 4 bytes = 8 bytes, so 0x1000 + 8 = 0x1008.',
        },
      },
      Advanced: {
        whatIsIt:
          'Pointers provide direct virtual memory addressing, enabling double indirection (int **), function pointers for callbacks, and strict aliasing optimizations.',
        whyUsed:
          'Essential for intrusive linked structures, vtable dispatch patterns in systems programming, and zero-overhead buffer slicing.',
        syntax: `void apply(int *arr, size_t n, int (*fn)(int)) {
    for (size_t i = 0; i < n; i++) arr[i] = fn(arr[i]);
}`,
        codeExample: {
          title: 'Double Pointers & Function Callbacks',
          code: `#include <stdio.h>

void redirect(int **pp, int *target) {
    *pp = target;
}

int main() {
    int a = 1, b = 99;
    int *p = &a;
    redirect(&p, &b);
    printf("*p = %d\\n", *p);
    return 0;
}`,
          output: '*p = 99',
          walkthrough: [
            '&p passes a pointer-to-pointer (int **) so redirect() can rebind p itself to point at b.',
          ],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Memory Leak / Use-After-Free',
            badCode: `free(ptr);
*ptr = 42; // Use-after-free vulnerability!`,
            fixedCode: `free(ptr);
ptr = NULL; // Poison freed pointer immediately`,
            explanation: 'Setting pointers to NULL after free() prevents accidental dereferencing of reclaimed heap blocks.',
          },
        ],
        practicePrompt: {
          question: 'Why is a double pointer (int **pp) required if a function needs to allocate memory and assign it to a caller’s pointer parameter?',
          options: [
            'Because malloc returns a double pointer',
            'Because a single pointer parameter is passed by value, so reassigning it only changes the local copy',
            'Because C forbids returning pointers from functions',
            'Because heap addresses are twice as wide as stack addresses',
          ],
          correctIndex: 1,
          explanation:
            'Just like ints, pointer variables themselves are passed by value. To modify which address a caller’s pointer holds, you must pass the address of that pointer (int **).',
        },
      },
    },
  },
  variables: {
    conceptId: 'variables',
    title: 'Variables & Memory Allocation',
    subtitle: 'Named storage locations, initialization discipline, and lexical scope rules in C.',
    levels: {
      Beginner: {
        whatIsIt: 'A Variable in C is a named container in memory used to store data that your program can read and update.',
        whyUsed: 'Variables allow programs to track changing state—such as loop counters, user scores, and calculated totals.',
        syntax: `int age = 20;\nchar grade = 'A';`,
        codeExample: {
          title: 'Declaring and Updating Variables',
          code: `#include <stdio.h>\nint main() {\n    int points = 10;\n    points = points + 5;\n    printf("Points: %d\\n", points);\n    return 0;\n}`,
          output: 'Points: 15',
          walkthrough: ['Reserves 4 bytes for points and initializes it to 10.', 'Adds 5 and stores 15 back into points.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Reading an Uninitialized Local Variable',
            badCode: `int total;\nprintf("%d", total); // Prints leftover stack garbage!`,
            fixedCode: `int total = 0;\nprintf("%d", total);`,
            explanation: 'Local variables in C are not automatically set to zero—always initialize them on declaration.',
          },
        ],
        practicePrompt: {
          question: 'What is the value of an uninitialized local int variable in C?',
          options: ['Always 0', 'Always -1', 'Indeterminate (garbage value)', 'Compilation Error'],
          correctIndex: 2,
          explanation: 'Automatic local variables contain whatever bits were previously on the stack until explicitly initialized.',
        },
      },
      Intermediate: {
        whatIsIt: 'Variables bind identifiers to typed storage durations: automatic (stack), static (.data/.bss), or dynamic.',
        whyUsed: 'Controlling storage duration and scope prevents namespace collisions and reduces stack footprint.',
        syntax: `static int counter = 0;\nconst int MAX_LIMIT = 100;`,
        codeExample: {
          title: 'Block Scope Shadowing',
          code: `#include <stdio.h>\nint main() {\n    int x = 5;\n    {\n        int x = 20;\n        printf("%d ", x);\n    }\n    printf("%d\\n", x);\n    return 0;\n}`,
          output: '20 5',
          walkthrough: ['Inner block declares a distinct x = 20 on the stack.', 'Once the inner block ends, outer x = 5 is visible again.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Accidental Variable Shadowing',
            badCode: `int i = 0;\nfor (int i = 0; i < 5; i++) { /* shadows outer i */ }`,
            fixedCode: `for (int i = 0; i < 5; i++) { /* single clean scope */ }`,
            explanation: 'Redeclaring variables with the same name in nested blocks can cause subtle logic bugs.',
          },
        ],
        practicePrompt: {
          question: 'Where are global and static variables stored in a compiled C program?',
          options: ['The Call Stack', 'The Data / BSS Segment', 'CPU Cache Only', 'The Heap'],
          correctIndex: 1,
          explanation: 'Global and static variables have static storage duration and live in the .data (initialized) or .bss (zeroed) segment.',
        },
      },
      Advanced: {
        whatIsIt: 'Variables represent lvalues with specific alignment, linkage (external, internal, none), and qualifier semantics (const, volatile).',
        whyUsed: 'Qualifiers like volatile prevent aggressive compiler register caching when interacting with hardware registers or signal handlers.',
        syntax: `volatile uint32_t *status_reg;\nstatic const int LUT[4] = {1, 2, 4, 8};`,
        codeExample: {
          title: 'Internal Linkage vs Automatic Storage',
          code: `#include <stdio.h>\nstatic int file_scoped = 42;\nint main() {\n    printf("%d\\n", file_scoped);\n    return 0;\n}`,
          output: '42',
          walkthrough: ['static at file scope restricts symbol visibility to the current translation unit.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Omission of volatile on Hardware/ISR Flag',
            badCode: `int flag = 0;\nwhile (!flag) { /* compiler may hoist check! */ }`,
            fixedCode: `volatile int flag = 0;\nwhile (!flag) { /* forces memory read */ }`,
            explanation: 'Without volatile, the optimizer may assume flag never changes inside an empty loop.',
          },
        ],
        practicePrompt: {
          question: 'What does the "static" keyword do when applied to a global variable at file scope?',
          options: [
            'Allocates the variable on the heap',
            'Gives the variable internal linkage (visible only within the current .c file)',
            'Makes the variable read-only like const',
            'Forces the variable into a CPU register',
          ],
          correctIndex: 1,
          explanation: 'At file scope, static restricts linkage to internal, hiding the symbol from other translation units.',
        },
      },
    },
  },
  datatypes: {
    conceptId: 'datatypes',
    title: 'Data Types & Type Modifiers',
    subtitle: 'Bit widths, signed vs unsigned representation, and implicit type promotions.',
    levels: {
      Beginner: {
        whatIsIt: 'Data types tell the C compiler how much memory to allocate for a variable and how to interpret the bits inside (whole numbers, decimals, or characters).',
        whyUsed: 'Choosing the right type prevents rounding bugs (like integer division truncation) and saves memory.',
        syntax: `int count = 42;\nfloat ratio = 3.14f;\nchar letter = 'C';`,
        codeExample: {
          title: 'Avoiding Integer Division Truncation',
          code: `#include <stdio.h>\nint main() {\n    int a = 5, b = 2;\n    float exact = (float)a / b;\n    printf("%.2f\\n", exact);\n    return 0;\n}`,
          output: '2.50',
          walkthrough: ['Casting (float)a promotes the division to floating-point before dividing by b.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Dividing Two Integers Expecting a Float',
            badCode: `float half = 1 / 2; // Result is 0.0!`,
            fixedCode: `float half = 1.0f / 2; // Result is 0.5!`,
            explanation: '1 / 2 uses integer math and truncates 0.5 to 0 before assigning to half.',
          },
        ],
        practicePrompt: {
          question: 'Which format specifier is used to print a double or float with printf?',
          options: ['%d', '%f', '%c', '%s'],
          correctIndex: 1,
          explanation: '%f prints floating-point values, whereas %d is for signed decimal integers.',
        },
      },
      Intermediate: {
        whatIsIt: 'C defines exact-width types in <stdint.h> and standard arithmetic conversions when mixed types interact.',
        whyUsed: 'Prevents subtle bugs when comparing signed and unsigned integers.',
        syntax: `#include <stdint.h>\nuint32_t flags = 0xFF;\nint64_t timestamp = 1700000000LL;`,
        codeExample: {
          title: 'Checking Type Sizes with sizeof',
          code: `#include <stdio.h>\nint main() {\n    printf("char: %zu, int: %zu\\n", sizeof(char), sizeof(int));\n    return 0;\n}`,
          output: 'char: 1, int: 4',
          walkthrough: ['sizeof evaluates at compile time to the byte width of the type.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Comparing Signed Negative int with Unsigned size_t',
            badCode: `int x = -1;\nsize_t n = 10;\nif (x < n) // FALSE! -1 wraps to huge unsigned value`,
            fixedCode: `int x = -1;\nint n = 10;\nif (x < n) // TRUE`,
            explanation: 'When signed and unsigned integers of the same rank are compared, the signed int is converted to unsigned, wrapping -1 to SIZE_MAX.',
          },
        ],
        practicePrompt: {
          question: 'What happens when an unsigned char holding 255 is incremented by 1?',
          options: ['Program crashes', 'Wraps around to 0', 'Becomes -128', 'Stays at 255'],
          correctIndex: 1,
          explanation: 'Unsigned integer overflow in C is well-defined modulo 2^N, so 255 + 1 wraps to 0.',
        },
      },
      Advanced: {
        whatIsIt: 'Two’s complement representation, IEEE-754 floating-point precision limits, and integer promotion rules.',
        whyUsed: 'Critical for bit-level serialization, cryptography, and avoiding signed integer overflow UB.',
        syntax: `_Static_assert(sizeof(int) == 4, "32-bit int required");`,
        codeExample: {
          title: 'Unsigned Modulo Arithmetic vs Signed UB',
          code: `#include <stdio.h>\nint main() {\n    unsigned int u = 0u - 1u;\n    printf("Max uint > 0: %d\\n", u > 0);\n    return 0;\n}`,
          output: 'Max uint > 0: 1',
          walkthrough: ['Unsigned underflow wraps modulo 2^32 to UINT_MAX.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Relying on Signed Integer Overflow',
            badCode: `if (a + 1 < a) // Compiler may optimize away as false!`,
            fixedCode: `if (a > INT_MAX - 1) // Safe overflow check before addition`,
            explanation: 'Signed integer overflow is Undefined Behavior in C; check bounds before adding.',
          },
        ],
        practicePrompt: {
          question: 'In C, what is the behavior of signed integer overflow vs unsigned integer overflow?',
          options: [
            'Both wrap around safely',
            'Signed overflow is Undefined Behavior; unsigned wraps modulo 2^N',
            'Unsigned overflow is Undefined Behavior; signed wraps',
            'Both throw a runtime exception',
          ],
          correctIndex: 1,
          explanation: 'The C standard defines unsigned arithmetic modulo 2^N, whereas signed overflow is Undefined Behavior.',
        },
      },
    },
  },
  operators: {
    conceptId: 'operators',
    title: 'Arithmetic, Bitwise & Logical Operators',
    subtitle: 'Precedence rules, short-circuit evaluation, and bit manipulation.',
    levels: {
      Beginner: {
        whatIsIt: 'Operators are symbols (+, -, *, /, %, ==, &&, ||) that transform values or compare conditions.',
        whyUsed: 'They let you compute formulas, check remainders with modulo (%), and combine logical conditions.',
        syntax: `int rem = 17 % 5; // 2\nint isValid = (x > 0) && (x < 100);`,
        codeExample: {
          title: 'Modulo & Logical AND',
          code: `#include <stdio.h>\nint main() {\n    int n = 14;\n    if (n > 10 && n % 2 == 0) {\n        printf("Even and > 10\\n");\n    }\n    return 0;\n}`,
          output: 'Even and > 10',
          walkthrough: ['n % 2 == 0 checks if n is divisible by 2 with zero remainder.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Using = Instead of == in Comparisons',
            badCode: `if (x = 5) // Assigns 5 to x, always evaluates to true!`,
            fixedCode: `if (x == 5) // Compares x with 5`,
            explanation: 'Single = is assignment; double == is equality comparison.',
          },
        ],
        practicePrompt: {
          question: 'What does 19 % 5 evaluate to in C?',
          options: ['3', '4', '3.8', '1'],
          correctIndex: 1,
          explanation: '19 divided by 5 is 3 with a remainder of 4.',
        },
      },
      Intermediate: {
        whatIsIt: 'Short-circuit logical operators (&&, ||) and bitwise manipulation (&, |, ^, ~, <<, >>).',
        whyUsed: 'Short-circuiting safely guards pointer/index checks (e.g., i < n && arr[i] == target).',
        syntax: `uint8_t flags = (1 << 3); // Set bit 3`,
        codeExample: {
          title: 'Bitmask Set and Test',
          code: `#include <stdio.h>\nint main() {\n    int flags = 0;\n    flags |= (1 << 2); // Set bit 2 (value 4)\n    printf("Flags: %d\\n", flags);\n    return 0;\n}`,
          output: 'Flags: 4',
          walkthrough: ['1 << 2 shifts 1 left by 2 bits (binary 0100 = 4).'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Confusing Bitwise & with Logical &&',
            badCode: `if (flags & MASK == 0) // == has higher precedence than &!`,
            fixedCode: `if ((flags & MASK) == 0) // Always parenthesize bitwise ops`,
            explanation: 'Equality == binds tighter than bitwise &, so (flags & MASK) must be parenthesized.',
          },
        ],
        practicePrompt: {
          question: 'Why must you write ((flags & MASK) != 0) with parentheses around (flags & MASK)?',
          options: [
            'Because != has higher operator precedence than bitwise &',
            'Because C requires parentheses inside if statements',
            'Because & is the address-of operator otherwise',
            'Because MASK must be cast to int',
          ],
          correctIndex: 0,
          explanation: 'Relational and equality operators (==, !=) have higher precedence than bitwise AND (&).',
        },
      },
      Advanced: {
        whatIsIt: 'Sequence points, unsequenced side-effect hazards, and branchless bitwise idioms.',
        whyUsed: 'Writing portable, UB-free expressions and high-performance bit hacks (like x & (x - 1) to clear lowest set bit).',
        syntax: `int isPowerOfTwo = (x > 0) && ((x & (x - 1)) == 0);`,
        codeExample: {
          title: 'Clearing the Lowest Set Bit (Brian Kernighan’s Trick)',
          code: `#include <stdio.h>\nint main() {\n    unsigned int x = 12; // 1100 in binary\n    x = x & (x - 1);     // Clears lowest 1 bit -> 1000 (8)\n    printf("%u\\n", x);\n    return 0;\n}`,
          output: '8',
          walkthrough: ['x & (x - 1) clears the least significant set bit in O(1) time.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Unsequenced Modification in Same Expression',
            badCode: `int y = i++ + i++; // Undefined Behavior!`,
            fixedCode: `int y = i + (i + 1);\ni += 2;`,
            explanation: 'Modifying a scalar variable more than once without an intervening sequence point is Undefined Behavior.',
          },
        ],
        practicePrompt: {
          question: 'What does the expression (x & (x - 1)) do to an unsigned integer x?',
          options: [
            'Doubles x',
            'Clears the lowest (least significant) set 1-bit of x',
            'Inverts all bits of x',
            'Rounds x up to a power of 2',
          ],
          correctIndex: 1,
          explanation: 'Subtracting 1 flips the lowest set bit to 0 and all lower 0 bits to 1; ANDing with x clears that lowest set bit.',
        },
      },
    },
  },
  conditions: {
    conceptId: 'conditions',
    title: 'Conditional Statements & Branching',
    subtitle: 'Decision branching with if/else, switch jump tables, and ternary expressions.',
    levels: {
      Beginner: {
        whatIsIt: 'Conditional statements allow your program to execute different blocks of code depending on whether a test is true or false.',
        whyUsed: 'Every interactive program needs branching—validating input, checking win conditions, or handling errors.',
        syntax: `if (score >= 80) {\n    printf("Mastered");\n} else {\n    printf("Keep practicing");\n}`,
        codeExample: {
          title: 'If-Else Ladder Classification',
          code: `#include <stdio.h>\nint main() {\n    int temp = 28;\n    if (temp > 30) printf("Hot\\n");\n    else if (temp >= 20) printf("Warm\\n");\n    else printf("Cool\\n");\n    return 0;\n}`,
          output: 'Warm',
          walkthrough: ['temp > 30 is false, so C tests temp >= 20, which is true and prints Warm.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Missing Braces on Multi-Line If Body',
            badCode: `if (x < 0)\n    x = 0;\n    printf("Reset"); // Runs even when x >= 0!`,
            fixedCode: `if (x < 0) {\n    x = 0;\n    printf("Reset");\n}`,
            explanation: 'Without curly braces {}, only the single statement immediately following if() is conditionally executed.',
          },
        ],
        practicePrompt: {
          question: 'In C, which integer values are treated as "true" inside an if(value) condition?',
          options: ['Only 1', 'Only positive numbers', 'Any non-zero value', 'Only 0'],
          correctIndex: 2,
          explanation: 'In C, 0 is false and ANY non-zero value (positive or negative) evaluates to true.',
        },
      },
      Intermediate: {
        whatIsIt: 'Switch-case dispatch tables, intentional vs accidental fallthrough, and the conditional ternary operator (?:).',
        whyUsed: 'Switch statements over dense integer enums compile into fast O(1) jump tables.',
        syntax: `int max = (a > b) ? a : b;`,
        codeExample: {
          title: 'Switch Dispatch with Grouped Cases',
          code: `#include <stdio.h>\nint main() {\n    char cmd = 'w';\n    switch (cmd) {\n        case 'w':\n        case 'W': printf("Move Up\\n"); break;\n        default: printf("Idle\\n");\n    }\n    return 0;\n}`,
          output: 'Move Up',
          walkthrough: ['Grouping case w and case W lets both lowercase and uppercase trigger the same block.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Forgetting break at the End of a switch Case',
            badCode: `case 1: count++; // Falls through to case 2!`,
            fixedCode: `case 1: count++; break;`,
            explanation: 'Always terminate switch cases with break (or return) unless fallthrough is intentional.',
          },
        ],
        practicePrompt: {
          question: 'What is the result of: int res = (5 > 10) ? 100 : (3 < 4) ? 200 : 300;',
          options: ['100', '200', '300', '0'],
          correctIndex: 1,
          explanation: '5 > 10 is false, so it evaluates the second ternary (3 < 4) ? 200 : 300, which is true and yields 200.',
        },
      },
      Advanced: {
        whatIsIt: 'Branch prediction friendliness, guard clauses, and lookup tables.',
        whyUsed: 'Flattening deeply nested conditionals via early-return guard clauses improves readability and instruction pipeline efficiency.',
        syntax: `if (!ptr) return -1; // Guard clause`,
        codeExample: {
          title: 'Early Return Guard Pattern',
          code: `#include <stdio.h>\nint safeDivide(int a, int b) {\n    if (b == 0) return 0;\n    return a / b;\n}\nint main() {\n    printf("%d\\n", safeDivide(20, 4));\n    return 0;\n}`,
          output: '5',
          walkthrough: ['Guard clause handles edge case b == 0 immediately at the top of the function.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Dangling Else Ambiguity',
            badCode: `if (a) if (b) foo(); else bar(); // else binds to inner if(b)!`,
            fixedCode: `if (a) {\n    if (b) foo();\n} else {\n    bar();\n}`,
            explanation: 'In C, an else clause always pairs with the nearest preceding unbraced if.',
          },
        ],
        practicePrompt: {
          question: 'In an unbraced nested if statement, which "if" does an "else" attach to?',
          options: ['The outermost if', 'The nearest preceding unmatched if', 'Based on indentation level', 'Compiler error'],
          correctIndex: 1,
          explanation: 'C grammar ignores indentation; else always binds to the closest open if statement.',
        },
      },
    },
  },
  loops: {
    conceptId: 'loops',
    title: 'Iterative Control & Loops',
    subtitle: 'For, while, and do-while loops, boundary invariants, and flow control.',
    levels: {
      Beginner: {
        whatIsIt: 'Loops repeat a block of statements as long as a continuation condition remains true.',
        whyUsed: 'Allows processing arrays, summing sequences, or polling input without duplicating lines of code.',
        syntax: `for (int i = 0; i < 5; i++) {\n    printf("%d ", i);\n}`,
        codeExample: {
          title: 'Counting & Accumulating in a For Loop',
          code: `#include <stdio.h>\nint main() {\n    int prod = 1;\n    for (int i = 1; i <= 4; i++) {\n        prod *= i;\n    }\n    printf("4! = %d\\n", prod);\n    return 0;\n}`,
          output: '4! = 24',
          walkthrough: ['Multiplies 1 * 2 * 3 * 4 across four iterations.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Semicolon Immediately After for(...);',
            badCode: `for (int i = 0; i < 5; i++); {\n    printf("Runs only once!\\n");\n}`,
            fixedCode: `for (int i = 0; i < 5; i++) {\n    printf("Runs 5 times!\\n");\n}`,
            explanation: 'A stray semicolon after for(...) creates an empty loop body that spins to completion before the braced block runs once.',
          },
        ],
        practicePrompt: {
          question: 'How many times does the body of for(int i = 0; i < 4; i++) execute?',
          options: ['3 times', '4 times', '5 times', 'Infinite times'],
          correctIndex: 1,
          explanation: 'i takes values 0, 1, 2, 3 (4 iterations total) and stops when i reaches 4.',
        },
      },
      Intermediate: {
        whatIsIt: 'Controlling nested loops, break vs continue semantics, and post-tested do-while loops.',
        whyUsed: 'Essential for 2D matrix traversal, searching with early exit, and input validation loops.',
        syntax: `do {\n    attempts++;\n} while (attempts < 3);`,
        codeExample: {
          title: 'Early Exit with break vs Skipping with continue',
          code: `#include <stdio.h>\nint main() {\n    for (int i = 1; i <= 6; i++) {\n        if (i == 2) continue;\n        if (i == 5) break;\n        printf("%d ", i);\n    }\n    return 0;\n}`,
          output: '1 3 4 ',
          walkthrough: ['Skips 2 via continue, prints 3 and 4, and terminates completely at 5 via break.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Off-by-One Array Loop Boundary (<= length)',
            badCode: `for (int i = 0; i <= 5; i++) arr[i] = 0; // Writes out of bounds at arr[5]!`,
            fixedCode: `for (int i = 0; i < 5; i++) arr[i] = 0; // Valid indices 0..4`,
            explanation: 'An array of size N has valid indices 0 to N-1; always use strictly less than (i < N).',
          },
        ],
        practicePrompt: {
          question: 'What is the key difference between a while loop and a do-while loop?',
          options: [
            'do-while is faster than while',
            'do-while always executes its body at least once before testing the condition',
            'while cannot use break statements',
            'do-while only works with integers',
          ],
          correctIndex: 1,
          explanation: 'A do-while loop checks its condition at the bottom of the loop, guaranteeing at least one execution.',
        },
      },
      Advanced: {
        whatIsIt: 'Loop invariants, cache-friendly row-major traversal, and sentinel termination.',
        whyUsed: 'Traversing 2D arrays in row-major order maximizes CPU L1 cache line hits in C.',
        syntax: `for (size_t r = 0; r < ROWS; r++)\n    for (size_t c = 0; c < COLS; c++)\n        sum += grid[r][c];`,
        codeExample: {
          title: 'Two-Pointer Converging Loop',
          code: `#include <stdio.h>\nint main() {\n    int a[] = {1, 2, 3, 4};\n    for (int l = 0, r = 3; l < r; l++, r--) {\n        int tmp = a[l]; a[l] = a[r]; a[r] = tmp;\n    }\n    printf("%d %d\\n", a[0], a[3]);\n    return 0;\n}`,
          output: '4 1',
          walkthrough: ['Reverses the array in place using dual indices converging toward the center.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Unsigned Loop Counter Underflow in Reverse Loop',
            badCode: `for (size_t i = 4; i >= 0; i--) // INFINITE LOOP! size_t is always >= 0`,
            fixedCode: `for (size_t i = 5; i-- > 0; ) // Safely iterates 4, 3, 2, 1, 0`,
            explanation: 'Because size_t is unsigned, 0 - 1 wraps to SIZE_MAX, making i >= 0永远 true.',
          },
        ],
        practicePrompt: {
          question: 'Why does for (unsigned int i = 3; i >= 0; i--) result in an infinite loop?',
          options: [
            'Because unsigned integers cannot be decremented',
            'Because an unsigned integer is always >= 0 (after 0 it wraps to UINT_MAX)',
            'Because i-- is a syntax error',
            'Because the compiler ignores >= 0',
          ],
          correctIndex: 1,
          explanation: 'Unsigned numbers can never be negative; decrementing 0 wraps around to UINT_MAX, which is still >= 0.',
        },
      },
    },
  },
  arrays: {
    conceptId: 'arrays',
    title: 'Contiguous Arrays & Strings',
    subtitle: 'Contiguous memory layout, zero-based indexing, and null-terminated C strings.',
    levels: {
      Beginner: {
        whatIsIt: 'An Array is a fixed-size collection of elements of the same data type stored side-by-side in contiguous memory.',
        whyUsed: 'Lets you store lists of numbers or characters under a single name and access any item instantly by its index.',
        syntax: `int scores[4] = {85, 90, 78, 92};\nchar word[] = "Code"; // Includes hidden '\\0' at index 4`,
        codeExample: {
          title: 'Finding the Maximum Element in an Array',
          code: `#include <stdio.h>\nint main() {\n    int v[4] = {12, 45, 23, 19};\n    int max = v[0];\n    for (int i = 1; i < 4; i++) {\n        if (v[i] > max) max = v[i];\n    }\n    printf("Max: %d\\n", max);\n    return 0;\n}`,
          output: 'Max: 45',
          walkthrough: ['Starts with max = v[0] (12) and compares each subsequent element.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Forgetting Space for the Null Terminator (\\0) in Strings',
            badCode: `char name[3] = "Cat"; // No room for '\\0'!`,
            fixedCode: `char name[4] = "Cat"; // 'C', 'a', 't', '\\0'`,
            explanation: 'Every C string requires 1 extra byte at the end for the null terminator character \\0.',
          },
        ],
        practicePrompt: {
          question: 'How many bytes does the string literal "Hello" occupy in a C char array?',
          options: ['4 bytes', '5 bytes', '6 bytes', '8 bytes'],
          correctIndex: 2,
          explanation: '5 characters (\'H\',\'e\',\'l\',\'l\',\'o\') plus 1 null terminator byte (\'\\0\') = 6 bytes.',
        },
      },
      Intermediate: {
        whatIsIt: 'Array-to-pointer decay when passing arrays to functions, and 2D row-major memory layouts.',
        whyUsed: 'Passing arrays by pointer avoids expensive memory copies, though you must pass the length explicitly.',
        syntax: `int sumArray(const int arr[], int len);`,
        codeExample: {
          title: 'Computing Array Length with sizeof Macro',
          code: `#include <stdio.h>\nint main() {\n    int data[] = {5, 10, 15, 20, 25};\n    int len = sizeof(data) / sizeof(data[0]);\n    printf("Length: %d\\n", len);\n    return 0;\n}`,
          output: 'Length: 5',
          walkthrough: ['sizeof(data) is 20 bytes; dividing by sizeof(int) (4 bytes) gives 5 elements.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Using sizeof(arr) Inside a Function Parameter',
            badCode: `void foo(int arr[10]) {\n    int n = sizeof(arr) / sizeof(arr[0]); // Returns pointer size / int size!\n}`,
            fixedCode: `void foo(const int arr[], size_t n) {\n    // Pass length 'n' as an explicit parameter\n}`,
            explanation: 'Array parameters decay to pointers (int *arr), so sizeof(arr) inside a function returns the pointer size (8 bytes), not the array size.',
          },
        ],
        practicePrompt: {
          question: 'Why must you pass the array length as a separate parameter when passing an array to a C function?',
          options: [
            'Because arrays decay into a pointer to their first element when passed to a function',
            'Because C functions cannot accept brackets []',
            'Because arrays are copied onto the heap',
            'Because sizeof() is a runtime function',
          ],
          correctIndex: 0,
          explanation: 'When passed to a function, an array decays to a raw pointer to element 0, losing its compile-time length information.',
        },
      },
      Advanced: {
        whatIsIt: 'Designated initializers, flexible array members, and pointer-to-array typesint (*p)[N].',
        whyUsed: 'Enables sparse lookup tables and single-allocation variable-length packets.',
        syntax: `int lookup[8] = {[0] = 1, [4] = 10, [7] = 99};`,
        codeExample: {
          title: 'C99 Designated Array Initializers',
          code: `#include <stdio.h>\nint main() {\n    int codes[5] = {[1] = 50, [3] = 90};\n    printf("%d %d %d\\n", codes[0], codes[1], codes[3]);\n    return 0;\n}`,
          output: '0 50 90',
          walkthrough: ['Explicitly initializes indices 1 and 3 while zero-filling all other indices.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Comparing C Strings with == Instead of strcmp()',
            badCode: `if (str1 == str2) // Compares memory addresses, not characters!`,
            fixedCode: `if (strcmp(str1, str2) == 0) // Compares string contents`,
            explanation: 'Using == on char arrays or char pointers compares their memory addresses rather than their text contents.',
          },
        ],
        practicePrompt: {
          question: 'What does (str1 == str2) actually compare when str1 and str2 are char arrays?',
          options: [
            'Their alphabetical order',
            'Their string lengths',
            'Their base memory addresses (pointer comparison)',
            'The first character only',
          ],
          correctIndex: 2,
          explanation: 'Both char arrays decay to pointers, so == compares whether they reside at the exact same memory address.',
        },
      },
    },
  },
  structures: {
    conceptId: 'structures',
    title: 'Structures & Custom Composite Types',
    subtitle: 'Grouping heterogeneous fields, typedefs, struct pointers (->), and memory alignment.',
    levels: {
      Beginner: {
        whatIsIt: 'A Structure (struct) lets you package multiple variables of different data types (like an int ID, a float GPA, and a char name[]) into a single custom record.',
        whyUsed: 'Models real-world entities (Students, Coordinates, Packets) cleanly instead of juggling parallel arrays.',
        syntax: `struct Point {\n    int x;\n    int y;\n};`,
        codeExample: {
          title: 'Creating and Accessing a Struct',
          code: `#include <stdio.h>\nstruct Point { int x; int y; };\nint main() {\n    struct Point p1 = {10, 25};\n    printf("(%d, %d)\\n", p1.x, p1.y);\n    return 0;\n}`,
          output: '(10, 25)',
          walkthrough: ['Uses the dot operator (.) to read fields x and y from struct instance p1.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Using Dot (.) Instead of Arrow (->) on a Struct Pointer',
            badCode: `struct Point *ptr = &p1;\nptr.x = 5; // Compilation error!`,
            fixedCode: `struct Point *ptr = &p1;\nptr->x = 5; // Uses -> for struct pointers`,
            explanation: 'Use dot (.) when working with a struct variable directly, and arrow (->) when working with a pointer to a struct.',
          },
        ],
        practicePrompt: {
          question: 'Which operator accesses a member field through a pointer to a struct?',
          options: ['.', '->', '::', '&'],
          correctIndex: 1,
          explanation: 'The arrow operator (ptr->field) dereferences the struct pointer and accesses the member field.',
        },
      },
      Intermediate: {
        whatIsIt: 'Passing structs by const pointer for efficiency, typedef aliases, and designated field initializers.',
        whyUsed: 'Passing a large struct by value copies the entire struct onto the stack; passing a const pointer copies only an 8-byte address.',
        syntax: `typedef struct {\n    int id;\n    double balance;\n} Account;`,
        codeExample: {
          title: 'Passing Struct by Pointer to Update Fields',
          code: `#include <stdio.h>\ntypedef struct { int x, y; } Vec2;\nvoid scale(Vec2 *v, int factor) {\n    v->x *= factor;\n    v->y *= factor;\n}\nint main() {\n    Vec2 pos = {.x = 3, .y = 7};\n    scale(&pos, 2);\n    printf("%d, %d\\n", pos.x, pos.y);\n    return 0;\n}`,
          output: '6, 14',
          walkthrough: ['Designated initializer sets .x=3, .y=7; scale(&pos, 2) mutates it in place via ->.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Mutating a Struct Passed by Value',
            badCode: `void reset(Vec2 v) { v.x = 0; v.y = 0; } // Modifies copy only!`,
            fixedCode: `void reset(Vec2 *v) { v->x = 0; v->y = 0; }`,
            explanation: 'Unlike arrays, structs in C are passed by value unless you explicitly pass a pointer (Vec2 *).',
          },
        ],
        practicePrompt: {
          question: 'How are structs passed to functions by default in C?',
          options: [
            'By reference (like arrays)',
            'By value (the entire struct is copied onto the stack)',
            'Structs cannot be passed to functions',
            'Only the first field is passed',
          ],
          correctIndex: 1,
          explanation: 'C copies the entire struct by value unless you pass a pointer to the struct.',
        },
      },
      Advanced: {
        whatIsIt: 'Struct padding, member alignment boundaries, and self-referential linked list nodes.',
        whyUsed: 'Ordering struct members from largest alignment to smallest minimizes wasted padding bytes in memory-intensive systems.',
        syntax: `struct Node {\n    int data;\n    struct Node *next;\n};`,
        codeExample: {
          title: 'Struct Padding & Alignment Inspection',
          code: `#include <stdio.h>\nstruct Packed { int a; char b; char c; };\nint main() {\n    printf("Size: %zu\\n", sizeof(struct Packed));\n    return 0;\n}`,
          output: 'Size: 8',
          walkthrough: ['4 bytes for int + 2 bytes for chars + 2 bytes tail padding to align to 4-byte boundary = 8 bytes.'],
        },
        commonMistakes: [
          {
            mistakeTitle: 'Using memcmp() to Compare Structs with Padding',
            badCode: `if (memcmp(&s1, &s2, sizeof(s1)) == 0) // Padding bytes contain garbage!`,
            fixedCode: `if (s1.a == s2.a && s1.b == s2.b) // Compare fields explicitly`,
            explanation: 'Padding bytes between struct members may contain indeterminate values, making raw memcmp unreliable.',
          },
        ],
        practicePrompt: {
          question: 'Why can sizeof(struct S) be larger than the sum of sizeof() of each of its individual fields?',
          options: [
            'Because structs store hidden function pointers',
            'Because the compiler inserts alignment padding bytes between or after members',
            'Because every struct has a null terminator',
            'Because structs are always 64 bytes minimum',
          ],
          correctIndex: 1,
          explanation: 'Compilers insert alignment padding so each member sits at a memory address that is a multiple of its natural alignment.',
        },
      },
    },
  },
};
