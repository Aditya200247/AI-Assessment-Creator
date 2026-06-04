export type QuestionDifficulty = 'Easy' | 'Moderate' | 'Hard';
export type QuestionType = 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  text: string;
  difficulty: QuestionDifficulty;
  marks: number;
  options?: string[];
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  sections: Section[];
  generatedAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numQuestions: number;
  marksPerQuestion: number;
  difficulty: { easy: number; moderate: number; hard: number };
  instructions?: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  questionPaper?: QuestionPaper | null;
}

export interface CreateAssignmentForm {
  title: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numQuestions: number | '';
  marksPerQuestion: number | '';
  difficulty: { easy: number; moderate: number; hard: number };
  instructions: string;
  file: File | null;
}

export interface JobProgressEvent {
  assignmentId: string;
  progress: number;
  message: string;
}

export interface JobCompleteEvent {
  assignmentId: string;
  questionPaper: QuestionPaper;
}

export interface JobErrorEvent {
  assignmentId: string;
  error: string;
}
