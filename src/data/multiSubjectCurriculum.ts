import {
  ConceptId,
  ConceptLessonData,
  ConceptNodeDefinition,
  Difficulty,
  LessonSectionContent,
  QuestionMetadata,
} from '../types/learning';
import { EngineeringSubject } from '../services/SubjectManagement';
import {
  C_CONCEPT_DEFINITIONS,
  CONCEPT_LESSONS,
  INITIAL_BASELINE_SCORES,
  INITIAL_PREVIOUS_SCORES,
  QUESTION_BANK,
} from './curriculumData';

export const CONCEPT_SLOTS: ConceptId[] = [
  'variables',
  'datatypes',
  'operators',
  'conditions',
  'loops',
  'functions',
  'arrays',
  'pointers',
  'structures',
];

interface SubjectTopicSpec {
  slot: ConceptId;
  order: number;
  name: string;
  shortName: string;
  description: string;
  prerequisites: ConceptId[];
  dependents: ConceptId[];
  deficitLabel: string;
  estimatedMinutes: number;
  syntax: string;
  exampleTitle: string;
  exampleCode: string;
  exampleOutput: string;
  walkthrough: string[];
  mistakeTitle: string;
  badCode: string;
  fixedCode: string;
  mistakeExplanation: string;
  questions: {
    difficulty: Difficulty;
    topic: string;
    question: string;
    codeSnippet?: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    hints: {
      hint1: string;
      hint2: string;
      hint3: string;
    };
  }[];
}

const MA101_SPECS: SubjectTopicSpec[] = [
  {
    slot: 'variables',
    order: 1,
    name: 'Matrix Rank & Echelon Form',
    shortName: 'Matrix Rank',
    description: 'Elementary row operations, row echelon form (REF), and rank determination.',
    prerequisites: [],
    dependents: ['datatypes', 'operators'],
    deficitLabel: 'Row reduction arithmetic errors',
    estimatedMinutes: 20,
    syntax: 'rank(A) = Number of non-zero rows in Row Echelon Form (REF)',
    exampleTitle: 'Finding Rank via Row Operations',
    exampleCode: `A = [ 1  2  3 ]\n    [ 2  4  6 ]\n    [ 1  1  1 ]\n\nR2 -> R2 - 2*R1:\n    [ 1  2  3 ]\n    [ 0  0  0 ]\n    [ 1  1  1 ]\n\nR3 -> R3 - R1 & Swap R2, R3:\n    [ 1  2  3 ]\n    [ 0 -1 -2 ]\n    [ 0  0  0 ]`,
    exampleOutput: 'Non-zero rows = 2 => rank(A) = 2',
    walkthrough: [
      'Eliminate entries below the first pivot a11 = 1 using R2 -> R2 - 2R1 and R3 -> R3 - R1.',
      'Swap the zero row to the bottom of the matrix.',
      'Count remaining non-zero rows in echelon form: 2 pivots => rank(A) = 2.',
    ],
    mistakeTitle: 'Counting Zero Rows in Rank',
    badCode: 'rank(A) = 3 (counting all rows of 3x3 matrix)',
    fixedCode: 'rank(A) = 2 (count only non-zero rows after Gaussian elimination)',
    mistakeExplanation: 'Linearly dependent rows reduce to zero rows and do not contribute to matrix rank.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Matrix Rank & Row Reduction',
        question: 'What is the rank of the 3x3 matrix with rows [1, 2, 3], [2, 4, 6], and [3, 6, 9]?',
        codeSnippet: `A = [ 1  2  3 ]\n    [ 2  4  6 ]\n    [ 3  6  9 ]`,
        options: ['0', '1', '2', '3'],
        correctAnswerIndex: 1,
        explanation:
          'Row 2 is 2 * Row 1 and Row 3 is 3 * Row 1. Applying R2 -> R2 - 2R1 and R3 -> R3 - 3R1 leaves only 1 non-zero row, so rank(A) = 1.',
        hints: {
          hint1: 'Check whether Row 2 and Row 3 are scalar multiples of Row 1.',
          hint2: 'Apply elementary row operations R2 - 2R1 and R3 - 3R1.',
          hint3: 'Only one non-zero row remains in Row Echelon Form.',
        },
      },
      {
        difficulty: 'Medium',
        topic: 'Rank-Nullity Theorem',
        question: 'If A is a 4x6 matrix with rank(A) = 4, what is the nullity (dimension of null space) of A?',
        codeSnippet: `rank(A) + nullity(A) = n (number of columns)`,
        options: ['0', '2', '4', '6'],
        correctAnswerIndex: 1,
        explanation:
          'By the Rank-Nullity Theorem, rank(A) + nullity(A) = number of columns (6). Since rank(A) = 4, nullity(A) = 6 - 4 = 2.',
        hints: {
          hint1: 'Recall the Rank-Nullity Theorem relating rank, nullity, and number of columns.',
          hint2: 'Number of columns n = 6, not the number of rows.',
          hint3: 'nullity(A) = 6 - 4 = 2.',
        },
      },
    ],
  },
  {
    slot: 'datatypes',
    order: 2,
    name: 'System of Linear Equations (Ax = b)',
    shortName: 'Linear Systems',
    description: 'Consistency of non-homogeneous and homogeneous linear systems using Rouché–Capelli theorem.',
    prerequisites: ['variables'],
    dependents: ['operators'],
    deficitLabel: 'Augmented matrix consistency check',
    estimatedMinutes: 25,
    syntax: 'Consistent iff rank(A) == rank([A | b]); Unique if rank == n; Infinite if rank < n',
    exampleTitle: 'Testing System Consistency',
    exampleCode: `[A | b] = [ 1  1 | 2 ]\n          [ 2  2 | 5 ]\n\nR2 -> R2 - 2*R1:\n          [ 1  1 | 2 ]\n          [ 0  0 | 1 ]`,
    exampleOutput: 'rank(A) = 1, rank([A|b]) = 2 => Inconsistent (No Solution)',
    walkthrough: [
      'Form the augmented matrix [A | b].',
      'Reduce to echelon form and compare rank(A) with rank([A | b]).',
      'Since 0x + 0y = 1 is impossible, rank(A) != rank([A|b]) and no solution exists.',
    ],
    mistakeTitle: 'Confusing Infinite Solutions with No Solution',
    badCode: 'rank(A) < n => No solution',
    fixedCode: 'rank(A) == rank([A|b]) < n => Infinitely many solutions',
    mistakeExplanation: 'When rank(A) = rank([A|b]) < n, the system is consistent with n - rank(A) free variables.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Rouché–Capelli Consistency',
        question: 'A linear system Ax = b in 3 unknowns has infinitely many solutions when:',
        codeSnippet: `A is 3x3, [A | b] is the augmented matrix`,
        options: [
          'rank(A) = 3 and rank([A|b]) = 3',
          'rank(A) = 2 and rank([A|b]) = 3',
          'rank(A) = 2 and rank([A|b]) = 2',
          'det(A) != 0',
        ],
        correctAnswerIndex: 2,
        explanation:
          'For infinitely many solutions, the system must be consistent (rank(A) = rank([A|b])) and have fewer pivots than unknowns (rank < 3). Thus rank(A) = rank([A|b]) = 2.',
        hints: {
          hint1: 'First check what condition makes Ax = b consistent.',
          hint2: 'rank(A) must equal rank([A|b]).',
          hint3: 'For infinite solutions in 3 variables, the common rank must be strictly less than 3.',
        },
      },
    ],
  },
  {
    slot: 'operators',
    order: 3,
    name: 'Eigenvalues, Eigenvectors & Cayley-Hamilton',
    shortName: 'Eigenvalues',
    description: 'Characteristic equation det(A - λI) = 0, spectral properties, and Cayley-Hamilton theorem.',
    prerequisites: ['variables', 'datatypes'],
    dependents: ['conditions', 'arrays'],
    deficitLabel: 'Characteristic polynomial sign errors',
    estimatedMinutes: 30,
    syntax: 'det(A - λI) = 0  |  Sum(λ_i) = trace(A)  |  Product(λ_i) = det(A)',
    exampleTitle: 'Eigenvalues of a 2x2 Matrix',
    exampleCode: `A = [ 4  1 ]\n    [ 2  3 ]\n\ntrace(A) = 4 + 3 = 7\ndet(A)   = (4)(3) - (1)(2) = 10\nCharacteristic Eq: λ^2 - 7λ + 10 = 0\n(λ - 5)(λ - 2) = 0`,
    exampleOutput: 'Eigenvalues: λ1 = 5, λ2 = 2',
    walkthrough: [
      'Compute trace(A) = a11 + a22 = 7 and det(A) = 12 - 2 = 10.',
      'Form λ^2 - trace(A)λ + det(A) = 0 => λ^2 - 7λ + 10 = 0.',
      'Factor into (λ - 5)(λ - 2) = 0 to obtain λ = 5 and λ = 2.',
    ],
    mistakeTitle: 'Wrong Sign on Trace Term',
    badCode: 'λ^2 + trace(A)*λ + det(A) = 0',
    fixedCode: 'λ^2 - trace(A)*λ + det(A) = 0',
    mistakeExplanation: 'For a 2x2 matrix, the characteristic polynomial is always λ^2 - tr(A)λ + det(A) = 0.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Trace & Determinant Eigenvalue Properties',
        question: 'If the eigenvalues of a 3x3 matrix A are 2, 3, and 5, what are trace(A) and det(A)?',
        codeSnippet: `λ1 = 2, λ2 = 3, λ3 = 5`,
        options: [
          'trace = 10, det = 30',
          'trace = 30, det = 10',
          'trace = 10, det = 15',
          'trace = 8, det = 30',
        ],
        correctAnswerIndex: 0,
        explanation:
          'The sum of eigenvalues equals the trace (2 + 3 + 5 = 10) and the product of eigenvalues equals the determinant (2 * 3 * 5 = 30).',
        hints: {
          hint1: 'Recall how trace(A) relates to the sum of eigenvalues.',
          hint2: 'Recall how det(A) relates to the product of eigenvalues.',
          hint3: 'Sum = 2+3+5 = 10; Product = 2*3*5 = 30.',
        },
      },
      {
        difficulty: 'Hard',
        topic: 'Cayley-Hamilton Theorem',
        question: 'If matrix A satisfies its characteristic equation A^2 - 5A + 6I = 0, what is A^(-1)?',
        codeSnippet: `A^2 - 5A + 6I = 0  (Multiply by A^-1)`,
        options: [
          '(1/6)(5I - A)',
          '(1/6)(A - 5I)',
          '5I - 6A',
          '(1/5)(A + 6I)',
        ],
        correctAnswerIndex: 0,
        explanation:
          'Rearranging A^2 - 5A + 6I = 0 gives 6I = 5A - A^2. Multiplying both sides by A^(-1) yields 6A^(-1) = 5I - A, so A^(-1) = (1/6)(5I - A).',
        hints: {
          hint1: 'Isolate the identity term 6I on one side of the equation.',
          hint2: 'Multiply every term by A^(-1) using A * A^(-1) = I.',
          hint3: '6A^(-1) = 5I - A => A^(-1) = (1/6)(5I - A).',
        },
      },
    ],
  },
  {
    slot: 'conditions',
    order: 4,
    name: 'Limits, Continuity & Differentiability',
    shortName: 'Limits & Continuity',
    description: 'L’Hôpital’s rule, indeterminate forms (0/0, ∞/∞), and continuity conditions.',
    prerequisites: ['operators'],
    dependents: ['loops'],
    deficitLabel: 'Applying L’Hôpital to non-indeterminate forms',
    estimatedMinutes: 20,
    syntax: 'lim(x->a) f(x)/g(x) = lim(x->a) f\'(x)/g\'(x) when f(a) = g(a) = 0',
    exampleTitle: 'Evaluating a 0/0 Limit',
    exampleCode: `L = lim(x -> 0) (sin(3x)) / x\nForm is 0/0 -> Apply L'Hopital's Rule:\nL = lim(x -> 0) (3 * cos(3x)) / 1\nL = 3 * cos(0) = 3`,
    exampleOutput: 'Limit L = 3',
    walkthrough: [
      'Substitute x = 0 to verify the indeterminate 0/0 form.',
      'Differentiate numerator (3 cos 3x) and denominator (1) separately.',
      'Evaluate at x = 0 to get 3 * 1 = 3.',
    ],
    mistakeTitle: 'Using Quotient Rule Instead of L’Hôpital’s Rule',
    badCode: 'lim (f\'g - fg\') / g^2',
    fixedCode: 'lim f\'(x) / g\'(x)',
    mistakeExplanation: 'L’Hôpital’s rule differentiates the numerator and denominator independently, not via the quotient rule.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Indeterminate Limits',
        question: 'What is the value of lim(x -> 0) (e^(2x) - 1) / x?',
        codeSnippet: `lim_{x -> 0} (e^{2x} - 1) / x`,
        options: ['0', '1', '2', 'Infinity'],
        correctAnswerIndex: 2,
        explanation:
          'At x = 0, (e^0 - 1)/0 gives 0/0. Differentiating numerator (2e^(2x)) and denominator (1) gives 2e^0 / 1 = 2.',
        hints: {
          hint1: 'Check the form at x = 0: e^0 - 1 = 0.',
          hint2: 'Apply L’Hôpital’s Rule by differentiating numerator and denominator with respect to x.',
          hint3: 'Derivative of e^(2x) - 1 is 2e^(2x); at x = 0 this equals 2.',
        },
      },
    ],
  },
  {
    slot: 'loops',
    order: 5,
    name: 'Mean Value Theorems & Taylor Series',
    shortName: 'Taylor & MVT',
    description: 'Rolle’s theorem, Lagrange’s Mean Value Theorem, and Maclaurin/Taylor expansions.',
    prerequisites: ['conditions'],
    dependents: ['functions', 'arrays'],
    deficitLabel: 'Factorial denominator omission in Taylor series',
    estimatedMinutes: 25,
    syntax: 'f(x) = f(a) + f\'(a)(x-a) + f\'\'(a)(x-a)^2 / 2! + ...',
    exampleTitle: 'Maclaurin Series of e^x',
    exampleCode: `f(x) = e^x, f(0) = 1, f'(0) = 1, f''(0) = 1\ne^x = 1 + x + x^2/2! + x^3/3! + ...`,
    exampleOutput: '3rd degree approximation at x=0: 1 + x + x^2/2 + x^3/6',
    walkthrough: [
      'Evaluate f(0) and its derivatives at a = 0.',
      'Divide the n-th degree term by n!.',
      'Sum terms up to the required degree.',
    ],
    mistakeTitle: 'Forgetting n! in Taylor Coefficients',
    badCode: 'f(x) = f(0) + f\'(0)x + f\'\'(0)x^2',
    fixedCode: 'f(x) = f(0) + f\'(0)x + (f\'\'(0)/2!)x^2',
    mistakeExplanation: 'Each n-th order derivative term must be divided by n factorial (n!).',
    questions: [
      {
        difficulty: 'Medium',
        topic: 'Lagrange Mean Value Theorem',
        question: 'For f(x) = x^2 on [1, 3], what value of c in (1, 3) satisfies Lagrange’s Mean Value Theorem?',
        codeSnippet: `f'(c) = (f(b) - f(a)) / (b - a)`,
        options: ['1.5', '2.0', '2.5', 'sqrt(3)'],
        correctAnswerIndex: 1,
        explanation:
          'f\'(c) = 2c and (f(3) - f(1)) / (3 - 1) = (9 - 1) / 2 = 4. Solving 2c = 4 gives c = 2.0.',
        hints: {
          hint1: 'Compute (f(3) - f(1)) / (3 - 1).',
          hint2: 'Set the derivative f\'(c) = 2c equal to the average rate of change.',
          hint3: '2c = 4 => c = 2.',
        },
      },
    ],
  },
  {
    slot: 'functions',
    order: 6,
    name: 'Partial Derivatives & Euler’s Theorem',
    shortName: 'Partial Derivatives',
    description: 'First and higher-order partial derivatives, chain rule, and Euler’s theorem on homogeneous functions.',
    prerequisites: ['loops'],
    dependents: ['pointers'],
    deficitLabel: 'Treating second variable as non-constant',
    estimatedMinutes: 30,
    syntax: 'If u(tx, ty) = t^n u(x,y), then x(∂u/∂x) + y(∂u/∂y) = n*u',
    exampleTitle: 'Euler’s Theorem for Homogeneous Functions',
    exampleCode: `Let u(x, y) = x^3 + 3*x^2*y + y^3\nu(tx, ty) = t^3 * u(x, y)  => Homogeneous of degree n = 3\n\nBy Euler's Theorem:\nx*(∂u/∂x) + y*(∂u/∂y) = 3*u`,
    exampleOutput: 'x(∂u/∂x) + y(∂u/∂y) = 3u',
    walkthrough: [
      'Check homogeneity by substituting (tx, ty) and factoring out t^n.',
      'Identify degree n = 3.',
      'Apply Euler’s relation x(∂u/∂x) + y(∂u/∂y) = n*u.',
    ],
    mistakeTitle: 'Differentiating Both Variables Simultaneously',
    badCode: '∂/∂x (x^2 * y^3) = 2x * 3y^2',
    fixedCode: '∂/∂x (x^2 * y^3) = 2x * y^3',
    mistakeExplanation: 'When taking ∂/∂x, treat y (and y^3) as a constant multiplier.',
    questions: [
      {
        difficulty: 'Medium',
        topic: 'Partial Differentiation & Euler’s Theorem',
        question: 'If u(x, y) = x^4 + x^2*y^2 + y^4, what is the value of x(∂u/∂x) + y(∂u/∂y)?',
        codeSnippet: `u(x, y) is a homogeneous function of degree n`,
        options: ['u', '2u', '4u', '0'],
        correctAnswerIndex: 2,
        explanation:
          'Every term in u(x, y) has total degree 4, so u is homogeneous of degree n = 4. By Euler’s Theorem, x(∂u/∂x) + y(∂u/∂y) = 4u.',
        hints: {
          hint1: 'Determine the degree of homogeneity n of u(x, y).',
          hint2: 'Recall Euler’s Theorem: x(∂u/∂x) + y(∂u/∂y) = n * u.',
          hint3: 'Since n = 4, the expression equals 4u.',
        },
      },
    ],
  },
  {
    slot: 'arrays',
    order: 7,
    name: 'Jacobians & Multivariable Extrema',
    shortName: 'Jacobians',
    description: 'Jacobian determinant ∂(u,v)/∂(x,y) and Hessian test (rt - s^2) for maxima, minima, and saddle points.',
    prerequisites: ['operators', 'loops'],
    dependents: ['pointers', 'structures'],
    deficitLabel: 'Jacobian determinant order & saddle condition',
    estimatedMinutes: 25,
    syntax: 'J = det([∂u/∂x, ∂u/∂y; ∂v/∂x, ∂v/∂y])  |  D = r*t - s^2',
    exampleTitle: 'Polar Coordinate Jacobian',
    exampleCode: `x = r*cos(θ), y = r*sin(θ)\n\nJ = | ∂x/∂r  ∂x/∂θ | = | cos(θ)  -r*sin(θ) |\n    | ∂y/∂r  ∂y/∂θ |   | sin(θ)   r*cos(θ) |\n\nJ = r*cos^2(θ) + r*sin^2(θ) = r`,
    exampleOutput: '∂(x, y) / ∂(r, θ) = r',
    walkthrough: [
      'Compute first-row partials of x with respect to r and θ.',
      'Compute second-row partials of y with respect to r and θ.',
      'Use cos^2(θ) + sin^2(θ) = 1 to simplify the determinant to r.',
    ],
    mistakeTitle: 'Omitting the Jacobian Factor in Coordinate Transforms',
    badCode: 'dx dy = dr dθ',
    fixedCode: 'dx dy = r dr dθ',
    mistakeExplanation: 'Area element transformation requires multiplying by |J| = r.',
    questions: [
      {
        difficulty: 'Medium',
        topic: 'Jacobian Determinant',
        question: 'What is the Jacobian J = ∂(x, y)/∂(r, θ) when transforming from Cartesian (x, y) to Polar (r, θ)?',
        codeSnippet: `x = r cos(θ),  y = r sin(θ)`,
        options: ['1', 'r', 'r^2', 'cos(θ)sin(θ)'],
        correctAnswerIndex: 1,
        explanation:
          'The determinant is (cos θ)(r cos θ) - (-r sin θ)(sin θ) = r(cos^2 θ + sin^2 θ) = r.',
        hints: {
          hint1: 'Set up the 2x2 determinant with partials of x and y.',
          hint2: 'Compute (∂x/∂r)(∂y/∂θ) - (∂x/∂θ)(∂y/∂r).',
          hint3: 'Apply the identity cos^2(θ) + sin^2(θ) = 1.',
        },
      },
    ],
  },
  {
    slot: 'pointers',
    order: 8,
    name: 'Double & Triple Multiple Integrals',
    shortName: 'Multiple Integrals',
    description: 'Iterated integration, changing order of integration, and volume evaluation.',
    prerequisites: ['functions', 'arrays'],
    dependents: ['structures'],
    deficitLabel: 'Inner vs outer integration bounds',
    estimatedMinutes: 35,
    syntax: '∬_R f(x,y) dA = ∫_{x=a}^{b} [ ∫_{y=g1(x)}^{g2(x)} f(x,y) dy ] dx',
    exampleTitle: 'Evaluating a Double Integral',
    exampleCode: `I = ∫_{0}^{1} ∫_{0}^{2} (x * y) dy dx\nInner integral wrt y:\n  ∫_{0}^{2} x*y dy = x * [y^2 / 2]_{0}^{2} = 2x\nOuter integral wrt x:\n  ∫_{0}^{1} 2x dx = [x^2]_{0}^{1} = 1`,
    exampleOutput: 'Integral Value I = 1',
    walkthrough: [
      'Integrate the inner integral with respect to y while holding x constant.',
      'Substitute y = 2 and y = 0 to get 2x.',
      'Integrate 2x from x = 0 to x = 1 to obtain 1.',
    ],
    mistakeTitle: 'Swapping Limits Without Sketching the Region',
    badCode: '∫_0^1 ∫_0^x f(x,y) dy dx = ∫_0^x ∫_0^1 f(x,y) dx dy',
    fixedCode: '∫_0^1 ∫_0^x f(x,y) dy dx = ∫_0^1 ∫_y^1 f(x,y) dx dy',
    mistakeExplanation: 'Outer integral limits must always be constants; for 0 <= y <= x <= 1, x ranges from y to 1.',
    questions: [
      {
        difficulty: 'Hard',
        topic: 'Changing Order of Integration',
        question: 'When reversing the order of integration for ∫_{0}^{1} ∫_{0}^{x} f(x,y) dy dx, what are the new limits?',
        codeSnippet: `Region R: 0 <= x <= 1  and  0 <= y <= x`,
        options: [
          '∫_{0}^{1} ∫_{y}^{1} f(x,y) dx dy',
          '∫_{0}^{1} ∫_{0}^{y} f(x,y) dx dy',
          '∫_{0}^{x} ∫_{0}^{1} f(x,y) dx dy',
          '∫_{0}^{1} ∫_{0}^{1} f(x,y) dx dy',
        ],
        correctAnswerIndex: 0,
        explanation:
          'In the region 0 <= y <= x <= 1, y ranges from 0 to 1, and for a fixed y, x ranges horizontally from x = y to x = 1.',
        hints: {
          hint1: 'Sketch the triangle bounded by y = 0, y = x, and x = 1.',
          hint2: 'The outer integral with respect to y must have constant bounds 0 to 1.',
          hint3: 'A horizontal slice at height y starts on the line x = y and ends at x = 1.',
        },
      },
    ],
  },
  {
    slot: 'structures',
    order: 9,
    name: 'Vector Calculus: Grad, Div & Curl',
    shortName: 'Vector Calculus',
    description: 'Gradient (∇φ), Divergence (∇·F), Curl (∇×F), solenoidal/irrotational fields, and Gauss/Green/Stokes theorems.',
    prerequisites: ['pointers', 'arrays'],
    dependents: [],
    deficitLabel: 'Solenoidal vs irrotational vector conditions',
    estimatedMinutes: 30,
    syntax: 'div(F) = ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z  (Solenoidal if div(F) == 0)',
    exampleTitle: 'Divergence of a Vector Field',
    exampleCode: `F = (2*x)i + (3*y)j + (4*z)k\ndiv(F) = ∇ · F = ∂(2x)/∂x + ∂(3y)/∂y + ∂(4z)/∂z\ndiv(F) = 2 + 3 + 4 = 9`,
    exampleOutput: 'div(F) = 9',
    walkthrough: [
      'Differentiate the i-component with respect to x (2).',
      'Differentiate the j-component with respect to y (3) and k-component with respect to z (4).',
      'Sum the scalar partials: 2 + 3 + 4 = 9.',
    ],
    mistakeTitle: 'Treating Divergence as a Vector',
    badCode: '∇ · F = 2i + 3j + 4k',
    fixedCode: '∇ · F = 2 + 3 + 4 = 9 (Scalar)',
    mistakeExplanation: 'Divergence is a dot product and always produces a scalar quantity, whereas Gradient and Curl produce vectors.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Solenoidal Vector Fields',
        question: 'For what value of constant a is the vector field F = (x + 3y)i + (y - 2z)j + (x + a*z)k solenoidal?',
        codeSnippet: `A vector field F is solenoidal if div(F) = ∇ · F = 0`,
        options: ['a = 0', 'a = 2', 'a = -2', 'a = -1'],
        correctAnswerIndex: 2,
        explanation:
          'div(F) = ∂(x+3y)/∂x + ∂(y-2z)/∂y + ∂(x+az)/∂z = 1 + 1 + a = 2 + a. Setting 2 + a = 0 gives a = -2.',
        hints: {
          hint1: 'Compute div(F) = ∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z.',
          hint2: '∂Fx/∂x = 1, ∂Fy/∂y = 1, and ∂Fz/∂z = a.',
          hint3: 'Set 1 + 1 + a = 0 => a = -2.',
        },
      },
    ],
  },
];

const CS201_SPECS: SubjectTopicSpec[] = [
  {
    slot: 'variables',
    order: 1,
    name: 'Asymptotic Complexity (Big-O, Ω, Θ)',
    shortName: 'Time Complexity',
    description: 'Best, average, and worst-case growth rates, Big-O upper bounds, and space-time trade-offs.',
    prerequisites: [],
    dependents: ['datatypes', 'operators'],
    deficitLabel: 'Nested loop logarithmic vs linear growth',
    estimatedMinutes: 20,
    syntax: 'T(n) = O(f(n)) iff T(n) <= c * f(n) for all n >= n0',
    exampleTitle: 'Halving Loop Complexity',
    exampleCode: `for (int i = n; i > 1; i = i / 2) {\n    sum += i;\n}`,
    exampleOutput: 'Time Complexity: O(log2 n), Space: O(1)',
    walkthrough: [
      'Notice the loop counter i is divided by 2 on every iteration.',
      'After k steps, i = n / (2^k). Loop stops when n / 2^k <= 1.',
      'Solving 2^k = n gives k = log2(n) iterations => O(log n).',
    ],
    mistakeTitle: 'Assuming Every Single Loop is O(n)',
    badCode: 'for (i = 1; i < n; i *= 2) -> O(n)',
    fixedCode: 'for (i = 1; i < n; i *= 2) -> O(log n)',
    mistakeExplanation: 'When the loop variable multiplies or divides by a constant factor > 1, the iteration count is logarithmic.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Asymptotic Analysis',
        question: 'What is the time complexity of a loop where index i starts at 1 and doubles (i = i * 2) until i >= n?',
        codeSnippet: `for (int i = 1; i < n; i = i * 2) {\n    count++;\n}`,
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswerIndex: 1,
        explanation:
          'Since i doubles each step (1, 2, 4, 8, ..., 2^k), it reaches n in k = log2(n) iterations, giving O(log n).',
        hints: {
          hint1: 'Write down the values of i for the first few iterations: 1, 2, 4, 8...',
          hint2: 'At step k, i = 2^k. Set 2^k = n.',
          hint3: 'Solving 2^k = n gives k = log2(n) -> O(log n).',
        },
      },
    ],
  },
  {
    slot: 'datatypes',
    order: 2,
    name: 'Dynamic Arrays & Amortized Analysis',
    shortName: 'Dynamic Arrays',
    description: 'Contiguous memory indexing, geometric resizing, and O(1) amortized append.',
    prerequisites: ['variables'],
    dependents: ['operators', 'conditions'],
    deficitLabel: 'Shifting cost during middle insertion',
    estimatedMinutes: 22,
    syntax: 'Access: O(1) | Insert/Delete at Middle: O(n) | Amortized Push: O(1)',
    exampleTitle: 'Inserting at Index k in an Array',
    exampleCode: `// Shift elements right from n-1 down to k\nfor (int i = n; i > k; i--) {\n    arr[i] = arr[i - 1];\n}\narr[k] = newValue;`,
    exampleOutput: 'Worst-case shifts = n - k => O(n) time',
    walkthrough: [
      'Start from the end of the array so existing elements are not overwritten.',
      'Shift each element one index to the right.',
      'Write newValue at index k.',
    ],
    mistakeTitle: 'Shifting Left-to-Right Overwriting Elements',
    badCode: 'for (int i = k; i < n; i++) arr[i+1] = arr[i];',
    fixedCode: 'for (int i = n; i > k; i--) arr[i] = arr[i-1];',
    mistakeExplanation: 'Shifting forward overwrites arr[k+1] with arr[k] before arr[k+1] is saved.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Array Operations',
        question: 'What is the worst-case time complexity of inserting a new element at index 0 of an array of size n?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctAnswerIndex: 2,
        explanation: 'Inserting at index 0 requires shifting all n existing elements one position to the right, taking O(n) time.',
        hints: {
          hint1: 'Array elements are stored contiguously in memory.',
          hint2: 'To free index 0, how many elements must move to index i+1?',
          hint3: 'All n elements must shift -> O(n).',
        },
      },
    ],
  },
  {
    slot: 'operators',
    order: 3,
    name: 'Singly, Doubly & Circular Linked Lists',
    shortName: 'Linked Lists',
    description: 'Pointer-based node chains, head/tail insertion, cycle detection (Floyd’s tortoise and hare), and list reversal.',
    prerequisites: ['variables', 'datatypes'],
    dependents: ['conditions', 'functions'],
    deficitLabel: 'Losing next pointer during pointer reassignment',
    estimatedMinutes: 28,
    syntax: 'struct Node { int data; struct Node* next; };',
    exampleTitle: 'In-Place Singly Linked List Reversal',
    exampleCode: `Node *prev = NULL, *curr = head, *next = NULL;\nwhile (curr != NULL) {\n    next = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = next;\n}\nhead = prev;`,
    exampleOutput: '1 -> 2 -> 3 -> NULL  becomes  3 -> 2 -> 1 -> NULL in O(n) time, O(1) space',
    walkthrough: [
      'Save curr->next in a temporary pointer before modifying curr->next.',
      'Reverse the link by pointing curr->next to prev.',
      'Advance prev = curr and curr = next until curr reaches NULL.',
    ],
    mistakeTitle: 'Overwriting curr->next Before Saving It',
    badCode: 'curr->next = prev; curr = curr->next;',
    fixedCode: 'next = curr->next; curr->next = prev; curr = next;',
    mistakeExplanation: 'Once curr->next is set to prev, the rest of the linked list is lost unless saved in next first.',
    questions: [
      {
        difficulty: 'Medium',
        topic: 'Linked List Pointer Manipulation',
        question: 'When inserting a new node X immediately after node P in a singly linked list, which order of assignments is correct?',
        codeSnippet: `// Node P is currently in the list; X is the new node`,
        options: [
          'P->next = X; X->next = P->next;',
          'X->next = P->next; P->next = X;',
          'X->next = P; P->next = X;',
          'P = X->next; X->next = P;',
        ],
        correctAnswerIndex: 1,
        explanation:
          'First link X->next to P->next so the remainder of the list is preserved, then update P->next = X.',
        hints: {
          hint1: 'What happens to the rest of the list if you overwrite P->next first?',
          hint2: 'Attach the new node X to P’s successor before changing P->next.',
          hint3: 'X->next = P->next; followed by P->next = X;.',
        },
      },
    ],
  },
  {
    slot: 'conditions',
    order: 4,
    name: 'Stacks (LIFO) & Queues (FIFO)',
    shortName: 'Stacks & Queues',
    description: 'Stack push/pop, balanced parentheses, infix-to-postfix conversion, and circular array queues.',
    prerequisites: ['datatypes', 'operators'],
    dependents: ['loops', 'arrays'],
    deficitLabel: 'Circular queue modulo wrap-around',
    estimatedMinutes: 25,
    syntax: 'Circular Queue Next Index: rear = (rear + 1) % capacity',
    exampleTitle: 'Evaluating Postfix Expression with a Stack',
    exampleCode: `Expression: "5 3 + 2 *"\n1. Push 5, Push 3\n2. Read '+': Pop 3, Pop 5 -> Push (5 + 3 = 8)\n3. Push 2\n4. Read '*': Pop 2, Pop 8 -> Push (8 * 2 = 16)`,
    exampleOutput: 'Final Stack Top = 16',
    walkthrough: [
      'Scan tokens left to right; push operands onto the stack.',
      'When an operator appears, pop the top two operands (second operand first, then first operand).',
      'Push the result back onto the stack.',
    ],
    mistakeTitle: 'Linear Queue False Overflow',
    badCode: 'rear = rear + 1; // Fails when rear == capacity - 1 even if front > 0',
    fixedCode: 'rear = (rear + 1) % capacity;',
    mistakeExplanation: 'Using modulo arithmetic wraps rear around to reuse vacated slots at the front of the array.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'Postfix Evaluation',
        question: 'What is the result of evaluating the postfix (Reverse Polish) expression: 6 2 / 3 + ?',
        codeSnippet: `Tokens: 6, 2, /, 3, +`,
        options: ['1', '4', '6', '9'],
        correctAnswerIndex: 2,
        explanation:
          'Push 6 and 2. "/" pops 2 and 6, computes 6 / 2 = 3, and pushes 3. Push 3. "+" pops 3 and 3, computing 3 + 3 = 6.',
        hints: {
          hint1: 'Push numbers onto a stack; apply operators to the top two numbers.',
          hint2: '6 2 / evaluates 6 / 2 = 3.',
          hint3: 'Then 3 3 + evaluates 3 + 3 = 6.',
        },
      },
    ],
  },
  {
    slot: 'loops',
    order: 5,
    name: 'Recursion & Divide-and-Conquer Recurrences',
    shortName: 'Master Theorem',
    description: 'Recursion trees, call stack depth, and solving T(n) = aT(n/b) + f(n) via the Master Theorem.',
    prerequisites: ['conditions'],
    dependents: ['functions', 'structures'],
    deficitLabel: 'Comparing f(n) against n^(log_b a)',
    estimatedMinutes: 25,
    syntax: 'T(n) = aT(n/b) + Θ(n^k): Compare k with log_b(a)',
    exampleTitle: 'Merge Sort Recurrence Analysis',
    exampleCode: `T(n) = 2 * T(n / 2) + Θ(n)\na = 2, b = 2 => n^(log_b a) = n^(log_2 2) = n^1\nf(n) = Θ(n) matches n^(log_b a) -> Case 2 of Master Theorem`,
    exampleOutput: 'T(n) = Θ(n log n)',
    walkthrough: [
      'Identify a = 2 subproblems, each of size n/b with b = 2.',
      'Compute critical exponent log_b(a) = log_2(2) = 1.',
      'Since f(n) = Θ(n^1), Case 2 applies: multiply by log n to get Θ(n log n).',
    ],
    mistakeTitle: 'Forgetting the log n Factor in Master Theorem Case 2',
    badCode: 'T(n) = 2T(n/2) + n => Θ(n)',
    fixedCode: 'T(n) = 2T(n/2) + n => Θ(n log n)',
    mistakeExplanation: 'Each of the log2(n) levels of the recursion tree performs Θ(n) merge work.',
    questions: [
      {
        difficulty: 'Medium',
        topic: 'Master Theorem',
        question: 'What is the asymptotic solution to the recurrence T(n) = 2T(n/2) + n?',
        codeSnippet: `T(n) = 2T(n/2) + n,  T(1) = 1`,
        options: ['Θ(n)', 'Θ(log n)', 'Θ(n log n)', 'Θ(n^2)'],
        correctAnswerIndex: 2,
        explanation:
          'Here a = 2, b = 2, so n^(log_2 2) = n. Since f(n) = n matches n^(log_b a), Case 2 of the Master Theorem yields Θ(n log n).',
        hints: {
          hint1: 'Identify a = 2, b = 2, and f(n) = n.',
          hint2: 'Compare f(n) = n with n^(log_2 2) = n^1.',
          hint3: 'Equal growth rates correspond to Case 2: Θ(n log n).',
        },
      },
    ],
  },
  {
    slot: 'functions',
    order: 6,
    name: 'Binary Trees & Binary Search Trees (BST)',
    shortName: 'Binary Search Trees',
    description: 'Inorder/Preorder/Postorder traversals, BST search/insert/delete invariants, and height analysis.',
    prerequisites: ['operators', 'loops'],
    dependents: ['arrays', 'pointers'],
    deficitLabel: 'BST global subtree bound vs local parent check',
    estimatedMinutes: 30,
    syntax: 'BST Invariant: max(LeftSubtree) < node.key < min(RightSubtree)',
    exampleTitle: 'Inorder Traversal of a BST',
    exampleCode: `void inorder(Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    printf("%d ", root->key);\n    inorder(root->right);\n}`,
    exampleOutput: 'Prints all BST keys in strictly non-decreasing sorted order in O(n) time.',
    walkthrough: [
      'Recursively visit all smaller keys in the left subtree.',
      'Visit and print the current root key.',
      'Recursively visit all larger keys in the right subtree.',
    ],
    mistakeTitle: 'Checking Only Immediate Children for BST Validity',
    badCode: 'if (root->left->key < root->key && root->right->key > root->key) return true;',
    fixedCode: 'isValidBST(node, minVal, maxVal)',
    mistakeExplanation: 'Every node in the left subtree—not just the direct child—must be strictly less than the ancestor.',
    questions: [
      {
        difficulty: 'Easy',
        topic: 'BST Traversals',
        question: 'Which traversal of a Binary Search Tree (BST) always produces the node keys in sorted ascending order?',
        options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
        correctAnswerIndex: 1,
        explanation:
          'Inorder traversal visits Left -> Root -> Right. By the BST property (Left < Root < Right), this outputs keys in sorted ascending order.',
        hints: {
          hint1: 'In a BST, all keys in the left subtree are smaller and all keys in the right subtree are larger.',
          hint2: 'Which traversal visits Left before Root and Right after Root?',
          hint3: 'Inorder traversal (Left, Root, Right).',
        },
      },
    ],
  },
  {
    slot: 'arrays',
    order: 7,
    name: 'AVL Self-Balancing Trees & Binary Heaps',
    shortName: 'AVL & Heaps',
    description: 'Balance factors, LL/RR/LR/RL rotations, array-backed priority heaps, and O(n) build-heap.',
    prerequisites: ['functions'],
    dependents: ['pointers', 'structures'],
    deficitLabel: 'AVL balance factor threshold & LR double rotation',
    estimatedMinutes: 30,
    syntax: 'Balance Factor BF(node) = height(Left) - height(Right) in {-1, 0, +1}',
    exampleTitle: 'Array Indexing of a Binary Heap',
    exampleCode: `Parent(i)     = (i - 1) / 2\nLeftChild(i)  = 2 * i + 1\nRightChild(i) = 2 * i + 2`,
    exampleOutput: 'Complete binary tree stored compactly in an array with zero pointer overhead.',
    walkthrough: [
      'Place the root at index 0.',
      'For any node at index i, its children reside at 2i+1 and 2i+2.',
      'Heapify-up or heapify-down restores the heap property in O(log n) time.',
    ],
    mistakeTitle: 'Assuming Build-Heap Takes O(n log n)',
    badCode: 'Build-Max-Heap on n elements -> O(n log n)',
    fixedCode: 'Bottom-up Build-Max-Heap -> O(n) linear time',
    mistakeExplanation: 'Most nodes in a complete binary tree are near the leaves and travel only O(1) levels during bottom-up heapify.',
    questions: [
      {
        difficulty: 'Medium',
        topic: 'AVL Tree Balance Factor',
        question: 'In an AVL tree, a node is considered height-balanced if its balance factor (height(Left) - height(Right)) belongs to which set?',
        options: ['{0}', '{-1, 0, +1}', '{-2, -1, 0, 1, 2}', 'Any positive integer'],
        correctAnswerIndex: 1,
        explanation:
          'An AVL tree enforces |height(Left) - height(Right)| <= 1 for every node, so valid balance factors are -1, 0, and +1.',
        hints: {
          hint1: 'AVL trees allow left and right subtrees to differ in height by at most 1.',
          hint2: 'Compute height(Left) - height(Right) when heights differ by at most 1.',
          hint3: 'The allowed values are {-1, 0, +1}.',
        },
      },
    ],
  },
  {
    slot: 'pointers',
    order: 8,
    name: 'Graphs: BFS, DFS & Shortest Paths',
    shortName: 'Graph Algorithms',
    description: 'Adjacency lists vs matrices, Breadth-First Search (queue), Depth-First Search (stack), and Dijkstra’s algorithm.',
    prerequisites: ['functions', 'arrays'],
    dependents: ['structures'],
    deficitLabel: 'Dijkstra failure on negative edge weights',
    estimatedMinutes: 35,
    syntax: 'BFS / DFS Time Complexity (Adjacency List): O(V + E)',
    exampleTitle: 'BFS Level-Order Shortest Unweighted Path',
    exampleCode: `queue.push(start); visited[start] = true;\nwhile (!queue.empty()) {\n    int u = queue.pop();\n    for (int v : adj[u]) {\n        if (!visited[v]) {\n            visited[v] = true;\n            dist[v] = dist[u] + 1;\n            queue.push(v);\n        }\n    }\n}`,
    exampleOutput: 'Computes shortest path distances from start to all vertices in O(V + E) time.',
    walkthrough: [
      'Mark the source vertex visited and enqueue it.',
      'Dequeue vertex u and inspect all unvisited neighbors v.',
      'Set dist[v] = dist[u] + 1 and enqueue v.',
    ],
    mistakeTitle: 'Marking Visited Only When Dequeuing',
    badCode: 'int u = queue.pop(); visited[u] = true;',
    fixedCode: 'visited[v] = true; queue.push(v); // Mark when enqueuing!',
    mistakeExplanation: 'Marking visited upon enqueue prevents the same vertex from being pushed into the queue multiple times.',
    questions: [
      {
        difficulty: 'Hard',
        topic: 'Graph Shortest Paths',
        question: 'Why can Dijkstra’s greedy algorithm fail to find the correct shortest path if a graph contains negative-weight edges?',
        options: [
          'It uses a stack instead of a priority queue',
          'It assumes adding an edge to a path can never decrease its total weight',
          'It only works on trees',
          'It has O(V^3) space complexity',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Dijkstra’s algorithm finalizes the shortest distance to the minimum-distance unvisited vertex under the assumption that future edges are non-negative and cannot reduce path cost later.',
        hints: {
          hint1: 'Consider what happens after Dijkstra marks a vertex u as finalized.',
          hint2: 'Dijkstra assumes any detour through a longer path can only add >= 0 weight.',
          hint3: 'A negative edge later could make a previously longer path shorter than the finalized distance.',
        },
      },
    ],
  },
  {
    slot: 'structures',
    order: 9,
    name: 'Sorting Algorithms & Hash Tables',
    shortName: 'Sorting & Hashing',
    description: 'QuickSort, MergeSort, HeapSort stability and complexity, hash functions, chaining, and open addressing.',
    prerequisites: ['pointers', 'arrays'],
    dependents: [],
    deficitLabel: 'QuickSort worst-case pivot selection & hash collisions',
    estimatedMinutes: 30,
    syntax: 'Hash Load Factor α = n / m  |  Expected O(1 + α) lookup with uniform hashing',
    exampleTitle: 'Hash Table Separate Chaining Lookup',
    exampleCode: `int bucket = hash(key) % TABLE_SIZE;\nfor (Node* cur = table[bucket]; cur != NULL; cur = cur->next) {\n    if (cur->key == key) return cur->value;\n}`,
    exampleOutput: 'Average O(1) lookup; Worst-case O(n) if all keys collide in one bucket.',
    walkthrough: [
      'Compute the bucket index using hash(key) % TABLE_SIZE.',
      'Traverse the linked list at that bucket.',
      'Return the matching value or NOT_FOUND.',
    ],
    mistakeTitle: 'Unbalanced QuickSort Pivot on Already-Sorted Input',
    badCode: 'pivot = arr[low]; // O(n^2) on sorted array',
    fixedCode: 'pivot = medianOfThree(low, mid, high); // Keeps O(n log n)',
    mistakeExplanation: 'Picking the first or last element as pivot on a sorted array creates partitions of size 0 and n-1, degrading to O(n^2).',
    questions: [
      {
        difficulty: 'Medium',
        topic: 'Sorting Comparison',
        question: 'Which of the following sorting algorithms guarantees O(n log n) time complexity in the worst case and is also stable?',
        options: ['QuickSort', 'MergeSort', 'HeapSort', 'Insertion Sort'],
        correctAnswerIndex: 1,
        explanation:
          'MergeSort guarantees O(n log n) in best, average, and worst cases and preserves the relative order of equal keys (stable).',
        hints: {
          hint1: 'QuickSort has an O(n^2) worst case, and HeapSort is not stable.',
          hint2: 'Which divide-and-conquer sort splits the array in half and merges stably?',
          hint3: 'MergeSort.',
        },
      },
    ],
  },
];

// Helper to build ConceptNodeDefinition[], QuestionMetadata[], and ConceptLessonData from SubjectTopicSpec[]
function compileSubjectCurriculum(
  subjectId: string,
  subjectName: string,
  specs: SubjectTopicSpec[]
): {
  concepts: ConceptNodeDefinition[];
  questions: QuestionMetadata[];
  lessons: Record<ConceptId, ConceptLessonData>;
} {
  const concepts: ConceptNodeDefinition[] = specs.map((s) => ({
    id: s.slot,
    name: s.name,
    shortName: s.shortName,
    order: s.order,
    description: s.description,
    prerequisites: s.prerequisites,
    dependents: s.dependents,
    deficitLabel: s.deficitLabel,
    estimatedMinutes: s.estimatedMinutes,
  }));

  const questions: QuestionMetadata[] = [];
  specs.forEach((s, idx) => {
    s.questions.forEach((q, qIdx) => {
      questions.push({
        id: `${subjectId}_${s.slot}_q${qIdx + 1}`,
        topic: q.topic,
        conceptId: s.slot,
        conceptName: s.shortName,
        difficulty: q.difficulty,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        prerequisiteConceptId: s.prerequisites[0],
        hints: q.hints,
      });
    });

    // Ensure every concept has Easy, Medium, and Hard coverage for Adaptive Quiz
    const existingDiffs = new Set(s.questions.map((q) => q.difficulty));
    (['Easy', 'Medium', 'Hard'] as Difficulty[]).forEach((diff) => {
      if (!existingDiffs.has(diff)) {
        const baseQ = s.questions[0];
        questions.push({
          id: `${subjectId}_${s.slot}_auto_${diff.toLowerCase()}`,
          topic: `${s.shortName} (${diff})`,
          conceptId: s.slot,
          conceptName: s.shortName,
          difficulty: diff,
          question: `[${subjectName} · ${diff}] ${baseQ.question}`,
          codeSnippet: baseQ.codeSnippet || s.syntax,
          options: baseQ.options,
          correctAnswerIndex: baseQ.correctAnswerIndex,
          explanation: baseQ.explanation,
          prerequisiteConceptId: s.prerequisites[0],
          hints: baseQ.hints,
        });
      }
    });
  });

  const lessons = {} as Record<ConceptId, ConceptLessonData>;
  specs.forEach((s) => {
    const primaryQ = s.questions[0];
    const baseSection: LessonSectionContent = {
      whatIsIt: `${s.name} in ${subjectName}: ${s.description}`,
      whyUsed: `Mastering ${s.shortName} is essential in ${subjectName} because it provides the foundation for ${
        s.dependents.length > 0 ? 'advanced dependent modules' : 'system-level engineering problem solving'
      } and avoids common pitfalls like ${s.deficitLabel.toLowerCase()}.`,
      syntax: s.syntax,
      codeExample: {
        title: s.exampleTitle,
        code: s.exampleCode,
        output: s.exampleOutput,
        walkthrough: s.walkthrough,
      },
      commonMistakes: [
        {
          mistakeTitle: s.mistakeTitle,
          badCode: s.badCode,
          fixedCode: s.fixedCode,
          explanation: s.mistakeExplanation,
        },
      ],
      practicePrompt: {
        question: primaryQ.question,
        code: primaryQ.codeSnippet,
        options: primaryQ.options,
        correctIndex: primaryQ.correctAnswerIndex,
        explanation: primaryQ.explanation,
      },
    };

    lessons[s.slot] = {
      conceptId: s.slot,
      title: s.name,
      subtitle: `${subjectName} · Topic 0${s.order}: ${s.description}`,
      levels: {
        Beginner: baseSection,
        Intermediate: {
          ...baseSection,
          whatIsIt: `[Intermediate Analysis] ${s.name}: ${s.description} Focus on formal properties, edge cases, and step-by-step verification.`,
        },
        Advanced: {
          ...baseSection,
          whatIsIt: `[Advanced Engineering Depth] ${s.name}: Rigorous formulation, performance/complexity trade-offs, and exam/interview edge cases.`,
        },
      },
    };
  });

  return { concepts, questions, lessons };
}

/**
 * Dynamically generates a full 9-concept interactive curriculum, question bank, and 3-level lessons
 * for ANY EngineeringSubject (including EC202, CS301, CS302, and any user-created subject in SubjectManagement).
 */
function generateCurriculumFromSyllabus(subject: EngineeringSubject): {
  concepts: ConceptNodeDefinition[];
  questions: QuestionMetadata[];
  lessons: Record<ConceptId, ConceptLessonData>;
} {
  // Flatten all topics from the subject's syllabus
  const flatTopics: {
    title: string;
    unitTitle: string;
    unitSummary: string;
    difficulty: Difficulty;
    estimatedMinutes: number;
    outcome: string;
  }[] = [];

  subject.syllabus.forEach((unit) => {
    unit.topics.forEach((t, idx) => {
      flatTopics.push({
        title: t.title,
        unitTitle: unit.title,
        unitSummary: unit.summary,
        difficulty: t.difficulty,
        estimatedMinutes: t.estimatedMinutes || 25,
        outcome:
          unit.learningOutcomes[idx % Math.max(1, unit.learningOutcomes.length)] ||
          `Apply ${t.title} accurately in ${subject.name}`,
      });
    });
  });

  // Pad or slice to 9 concept slots so the 9-node dependency graph always works cleanly
  while (flatTopics.length < 9) {
    const idx = flatTopics.length + 1;
    flatTopics.push({
      title: `${subject.name} Module ${idx}`,
      unitTitle: `Unit ${Math.ceil(idx / 2)}: Core ${subject.name}`,
      unitSummary: subject.description || `Core engineering concepts for ${subject.name}.`,
      difficulty: idx <= 3 ? 'Easy' : idx <= 6 ? 'Medium' : 'Hard',
      estimatedMinutes: 25,
      outcome: `Master ${subject.name} Module ${idx} principles and problem-solving`,
    });
  }

  const dependencyGraph: Record<
    number,
    { prerequisites: ConceptId[]; dependents: ConceptId[] }
  > = {
    0: { prerequisites: [], dependents: ['datatypes', 'operators'] },
    1: { prerequisites: ['variables'], dependents: ['operators', 'conditions'] },
    2: { prerequisites: ['variables', 'datatypes'], dependents: ['conditions'] },
    3: { prerequisites: ['operators'], dependents: ['loops'] },
    4: { prerequisites: ['conditions'], dependents: ['functions', 'arrays'] },
    5: { prerequisites: ['loops'], dependents: ['pointers'] },
    6: { prerequisites: ['loops'], dependents: ['pointers', 'structures'] },
    7: { prerequisites: ['functions', 'arrays'], dependents: ['structures'] },
    8: { prerequisites: ['pointers', 'arrays'], dependents: [] },
  };

  const specs: SubjectTopicSpec[] = CONCEPT_SLOTS.map((slot, idx) => {
    const item = flatTopics[idx];
    const shortName =
      item.title.length > 24 ? item.title.split('(')[0].trim().slice(0, 22) : item.title;
    const prevTopicName = idx > 0 ? flatTopics[idx - 1].title : 'Foundational Principles';

    return {
      slot,
      order: idx + 1,
      name: item.title,
      shortName,
      description: `${item.unitTitle} — ${item.unitSummary}`,
      prerequisites: dependencyGraph[idx].prerequisites,
      dependents: dependencyGraph[idx].dependents,
      deficitLabel: `Misconceptions in ${shortName}`,
      estimatedMinutes: item.estimatedMinutes,
      syntax: `// ${subject.code}: ${item.title}\n// Core Principle: ${item.outcome}`,
      exampleTitle: `Worked Engineering Example: ${item.title}`,
      exampleCode: `Subject: ${subject.name} (${subject.code})\nModule : ${item.unitTitle}\nTopic  : ${item.title}\n\nStep 1 : Identify given parameters and system constraints.\nStep 2 : Apply ${shortName} governing formulation.\nStep 3 : Verify boundary conditions & outcome: ${item.outcome}.`,
      exampleOutput: `Verified Outcome: ${item.outcome}`,
      walkthrough: [
        `Review the core definition of ${item.title} within ${item.unitTitle}.`,
        `Check prerequisite assumptions from ${prevTopicName}.`,
        `Apply the step-by-step formulation to verify: ${item.outcome}.`,
      ],
      mistakeTitle: `Skipping Prerequisite Constraints in ${shortName}`,
      badCode: `Applying ${shortName} formula without checking ${prevTopicName} boundary conditions`,
      fixedCode: `Validate ${prevTopicName} invariants first, then evaluate ${shortName}`,
      mistakeExplanation: `In ${subject.name}, ${shortName} depends directly on ${prevTopicName}; verifying boundary conditions prevents invalid results.`,
      questions: [
        {
          difficulty: 'Easy',
          topic: item.title,
          question: `In ${subject.name} (${subject.code}), what is the primary objective and core principle of "${item.title}"?`,
          codeSnippet: `${item.unitTitle}\nTopic: ${item.title}`,
          options: [
            item.outcome,
            'Ignoring system constraints and bypassing prerequisite checks',
            'Replacing all deterministic verification with random guessing',
            'Using unrelated hardware interrupts without state tracking',
          ],
          correctAnswerIndex: 0,
          explanation: `In ${subject.name} (${item.unitTitle}), "${item.title}" specifically focuses on: ${item.outcome}.`,
          hints: {
            hint1: `Consider how ${item.title} fits into ${item.unitTitle}.`,
            hint2: `Focus on the core learning outcome of ${subject.code}.`,
            hint3: `The correct engineering objective is: "${item.outcome}".`,
          },
        },
        {
          difficulty: 'Medium',
          topic: item.title,
          question: `When solving an engineering problem on "${item.title}" in ${subject.name}, which step ensures valid results?`,
          codeSnippet: `Module: ${item.unitTitle}\nSummary: ${item.unitSummary}`,
          options: [
            'Skipping boundary conditions to save time',
            `Verifying ${prevTopicName} invariants and applying ${shortName} systematically`,
            'Assuming all variables are zero regardless of input',
            'Discarding unit consistency checks',
          ],
          correctAnswerIndex: 1,
          explanation: `Accurate analysis in ${item.title} requires verifying prerequisite invariants (${prevTopicName}) and systematically applying ${shortName} principles.`,
          hints: {
            hint1: `Think about the prerequisite relationship between ${prevTopicName} and ${shortName}.`,
            hint2: `Eliminate options that ignore constraints or boundary conditions.`,
            hint3: `Select the option that verifies ${prevTopicName} invariants and applies ${shortName} systematically.`,
          },
        },
        {
          difficulty: 'Hard',
          topic: item.title,
          question: `In an advanced ${subject.code} scenario involving "${item.title}", what happens if prerequisite "${prevTopicName}" constraints are violated?`,
          codeSnippet: `Dependency: ${prevTopicName} --> ${item.title}`,
          options: [
            'Execution always remains optimal with zero error',
            `System invariants break due to ${shortName} boundary violations`,
            'Complexity automatically reduces to O(1)',
            'No effect on downstream modules',
          ],
          correctAnswerIndex: 1,
          explanation: `Because "${item.title}" builds upon "${prevTopicName}", violating prerequisite constraints causes boundary violations and invalidates the ${shortName} model.`,
          hints: {
            hint1: `Examine the dependency chain in ${subject.name}.`,
            hint2: `Can an advanced module function properly if its prerequisite invariants fail?`,
            hint3: `Violating ${prevTopicName} breaks system invariants in ${shortName}.`,
          },
        },
      ],
    };
  });

  return compileSubjectCurriculum(subject.id, subject.name, specs);
}

const MA101_COMPILED = compileSubjectCurriculum(
  'subj_ma101',
  'Engineering Mathematics I',
  MA101_SPECS
);

const CS201_COMPILED = compileSubjectCurriculum(
  'subj_cs201',
  'Data Structures & Algorithms',
  CS201_SPECS
);

export function getSubjectCurriculumBundle(subject: EngineeringSubject): {
  concepts: ConceptNodeDefinition[];
  questions: QuestionMetadata[];
  lessons: Record<ConceptId, ConceptLessonData>;
} {
  if (subject.id === 'subj_cs101') {
    return {
      concepts: C_CONCEPT_DEFINITIONS,
      questions: QUESTION_BANK,
      lessons: CONCEPT_LESSONS,
    };
  }
  if (subject.id === 'subj_ma101') {
    return MA101_COMPILED;
  }
  if (subject.id === 'subj_cs201') {
    return CS201_COMPILED;
  }
  return generateCurriculumFromSyllabus(subject);
}

export function getInitialSubjectBaselineScores(subjectId: string): Record<ConceptId, number> {
  if (subjectId === 'subj_cs101') {
    return { ...INITIAL_BASELINE_SCORES };
  }
  // Deterministic varied baseline scores per subject so every subject has realistic initial mastery, weak areas, and locked topics
  const seed = subjectId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const offset = (seed % 9) - 4;
  return {
    variables: Math.min(95, Math.max(75, 89 + offset)),
    datatypes: Math.min(92, Math.max(72, 84 + offset)),
    operators: Math.min(90, Math.max(70, 80 + offset)),
    conditions: Math.min(85, Math.max(65, 74 + offset)),
    loops: Math.min(82, Math.max(62, 71 + offset)),
    functions: Math.min(58, Math.max(46, 53 + Math.floor(offset / 2))),
    arrays: Math.min(75, Math.max(60, 64 + offset)),
    pointers: Math.min(39, Math.max(25, 33 + Math.floor(offset / 2))),
    structures: Math.min(38, Math.max(22, 29 + Math.floor(offset / 2))),
  };
}

export function getInitialSubjectPreviousScores(subjectId: string): Record<ConceptId, number> {
  if (subjectId === 'subj_cs101') {
    return { ...INITIAL_PREVIOUS_SCORES };
  }
  const base = getInitialSubjectBaselineScores(subjectId);
  return {
    variables: Math.max(10, base.variables - 4),
    datatypes: Math.max(10, base.datatypes - 4),
    operators: Math.max(10, base.operators - 3),
    conditions: Math.max(10, base.conditions - 3),
    loops: Math.max(10, base.loops - 3),
    functions: Math.max(10, base.functions - 6),
    arrays: Math.max(10, base.arrays - 3),
    pointers: Math.max(10, base.pointers - 6),
    structures: Math.max(10, base.structures - 4),
  };
}
