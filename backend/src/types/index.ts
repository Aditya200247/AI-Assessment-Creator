export type QuestionDifficulty = 'Easy' | 'Moderate' | 'Hard';
export type QuestionType = 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IQuestion {
  text: string;
  difficulty: QuestionDifficulty;
  marks: number;
  options?: string[];
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaperData {
  sections: ISection[];
}

export interface ICreateAssignmentDto {
  title: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numQuestions: number;
  marksPerQuestion: number;
  difficulty: {
    easy: number;
    moderate: number;
    hard: number;
  };
  instructions?: string;
  fileContent?: string;
}

export interface IJobData {
  assignmentId: string;
}
