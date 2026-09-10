export interface DiagnosticQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  placedLevel: number;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag_1',
    question: 'What is the exact output of this code?',
    codeSnippet: 'x = "5"\ny = "10"\nprint(x + y)',
    options: ['15', '510', 'TypeError', 'SyntaxError'],
    correctAnswer: 1,
    placedLevel: 1,
  },
  {
    id: 'diag_2',
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
    question: 'What will this loop print?',
    codeSnippet: 'nums = [1, 2, 3]\nfor i in range(len(nums)):\n    print(i)',
    options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', 'IndexError'],
    correctAnswer: 1,
    placedLevel: 3,
  },
];

export class DiagnosticQuestions {
  public static QUESTIONS = DIAGNOSTIC_QUESTIONS;
}