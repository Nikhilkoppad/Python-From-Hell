export interface DiagnosticQuestion {
  id: string;
  topic: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  placedLevel: number;
}

/**
 * Small placement bank used before the learner enters the curriculum.
 * The bank deliberately samples different Python skills instead of asking
 * three near-identical questions. Levels are capped by the actual curriculum
 * in HellGate rather than by this data file.
 */
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag_1',
    topic: 'strings',
    question: 'What is the exact output of this code?',
    codeSnippet: 'x = "5"\ny = "10"\nprint(x + y)',
    options: ['15', '510', 'TypeError', 'SyntaxError'],
    correctAnswer: 1,
    placedLevel: 1,
  },
  {
    id: 'diag_2',
    topic: 'functions',
    question: 'Find the bug in this Python snippet:',
    codeSnippet: 'def check_even(num)\n    return num % 2 == 0',
    options: [
      'Missing colon (:) after num',
      'Should use === instead of ==',
      'return statement is invalid',
      'Variables cannot start with num',
    ],
    correctAnswer: 0,
    placedLevel: 2,
  },
  {
    id: 'diag_3',
    topic: 'loops',
    question: 'What will this loop print?',
    codeSnippet: 'nums = [1, 2, 3]\nfor i in range(len(nums)):\n    print(i)',
    options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', 'IndexError'],
    correctAnswer: 1,
    placedLevel: 2,
  },
  {
    id: 'diag_4',
    topic: 'variables',
    question: 'What is the final value of score?',
    codeSnippet: 'score = 10\nscore = score + 5\nprint(score)',
    options: ['10', '15', '5', 'score + 5'],
    correctAnswer: 1,
    placedLevel: 1,
  },
  {
    id: 'diag_5',
    topic: 'conditionals',
    question: 'What does this program print?',
    codeSnippet: 'age = 20\nif age >= 18:\n    print("adult")\nelse:\n    print("minor")',
    options: ['adult', 'minor', '20', 'Nothing'],
    correctAnswer: 0,
    placedLevel: 2,
  },
  {
    id: 'diag_6',
    topic: 'lists',
    question: 'What is printed by this code?',
    codeSnippet: 'items = ["a", "b", "c"]\nprint(items[1])',
    options: ['a', 'b', 'c', 'IndexError'],
    correctAnswer: 1,
    placedLevel: 2,
  },
];

export class DiagnosticQuestions {
  public static QUESTIONS = DIAGNOSTIC_QUESTIONS;
}
