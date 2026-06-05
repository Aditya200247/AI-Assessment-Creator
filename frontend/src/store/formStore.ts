import { create } from 'zustand';
import { QuestionType } from '@/types';

export interface QuestionTypeRow {
  id: string;
  label: string;
  backendType: QuestionType;
  count: number;
  marksPerQuestion: number;
}

export const QUESTION_TYPE_OPTIONS: { label: string; backendType: QuestionType }[] = [
  { label: 'Multiple Choice Questions', backendType: 'MCQ' },
  { label: 'Short Answer Questions',    backendType: 'Short Answer' },
  { label: 'Long Answer Questions',     backendType: 'Long Answer' },
  { label: 'True/False Questions',      backendType: 'True/False' },
  { label: 'Numerical Problems',        backendType: 'Short Answer' },
  { label: 'Diagram/Graph Questions',   backendType: 'Long Answer' },
  { label: 'Fill in the Blanks',        backendType: 'Short Answer' },
  { label: 'Match the Following',       backendType: 'Short Answer' },
];

interface FormState {
  title: string;
  dueDate: string;
  questionTypeRows: QuestionTypeRow[];
  instructions: string;
  file: File | null;
  difficulty: { easy: number; moderate: number; hard: number };
}

interface FormErrors {
  title?: string;
  dueDate?: string;
  questionTypeRows?: string;
  difficulty?: string;
}

const defaultRows: QuestionTypeRow[] = [
  { id: '1', label: 'Multiple Choice Questions', backendType: 'MCQ',         count: 4, marksPerQuestion: 1 },
  { id: '2', label: 'Short Answer Questions',    backendType: 'Short Answer', count: 3, marksPerQuestion: 2 },
];

const DEFAULT_FORM: FormState = {
  title: '',
  dueDate: '',
  questionTypeRows: defaultRows,
  instructions: '',
  file: null,
  difficulty: { easy: 40, moderate: 40, hard: 20 },
};

interface FormStore {
  form: FormState;
  errors: FormErrors;
  isSubmitting: boolean;

  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;

  // Row management
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, field: keyof QuestionTypeRow, value: string | number) => void;

  setSubmitting: (v: boolean) => void;
  validate: () => boolean;
  resetForm: () => void;

  // Derived — computed from rows
  getTotals: () => { totalQuestions: number; totalMarks: number };
  getSubmitPayload: () => {
    questionTypes: QuestionType[];
    numQuestions: number;
    marksPerQuestion: number;
  };
}

export const useFormStore = create<FormStore>((set, get) => ({
  form: { ...DEFAULT_FORM, questionTypeRows: defaultRows.map(r => ({ ...r })) },
  errors: {},
  isSubmitting: false,

  setField: (key, value) =>
    set(s => ({
      form: { ...s.form, [key]: value },
      errors: { ...s.errors, [key]: undefined },
    })),

  addRow: () =>
    set(s => ({
      form: {
        ...s.form,
        questionTypeRows: [
          ...s.form.questionTypeRows,
          {
            id: Date.now().toString(),
            label: 'Multiple Choice Questions',
            backendType: 'MCQ' as QuestionType,
            count: 4,
            marksPerQuestion: 1,
          },
        ],
      },
      errors: { ...s.errors, questionTypeRows: undefined },
    })),

  removeRow: (id) =>
    set(s => ({
      form: {
        ...s.form,
        questionTypeRows: s.form.questionTypeRows.filter(r => r.id !== id),
      },
    })),

  updateRow: (id, field, value) =>
    set(s => ({
      form: {
        ...s.form,
        questionTypeRows: s.form.questionTypeRows.map(r =>
          r.id === id ? { ...r, [field]: value } : r
        ),
      },
    })),

  setSubmitting: (v) => set({ isSubmitting: v }),

  validate: () => {
    const { form } = get();
    const errors: FormErrors = {};
    if (!form.title.trim())           errors.title = 'Assignment title is required';
    if (!form.dueDate)                errors.dueDate = 'Due date is required';
    if (form.questionTypeRows.length === 0)
      errors.questionTypeRows = 'Add at least one question type';
    if (form.questionTypeRows.some(r => r.count < 1))
      errors.questionTypeRows = 'Each question type must have at least 1 question';
    const diffTotal =
      form.difficulty.easy + form.difficulty.moderate + form.difficulty.hard;
    if (diffTotal !== 100) errors.difficulty = 'Difficulty must add up to 100%';
    set({ errors });
    return Object.keys(errors).length === 0;
  },

  resetForm: () =>
    set({
      form: { ...DEFAULT_FORM, questionTypeRows: defaultRows.map(r => ({ ...r })) },
      errors: {},
      isSubmitting: false,
    }),

  getTotals: () => {
    const { questionTypeRows } = get().form;
    const totalQuestions = questionTypeRows.reduce((s, r) => s + r.count, 0);
    const totalMarks     = questionTypeRows.reduce((s, r) => s + r.count * r.marksPerQuestion, 0);
    return { totalQuestions, totalMarks };
  },

  getSubmitPayload: () => {
    const { questionTypeRows } = get().form;
    const questionTypes = [...new Set(questionTypeRows.map(r => r.backendType))];
    const totalQuestions = questionTypeRows.reduce((s, r) => s + r.count, 0);
    const totalMarks     = questionTypeRows.reduce((s, r) => s + r.count * r.marksPerQuestion, 0);
    const marksPerQuestion = totalQuestions > 0 ? Math.round(totalMarks / totalQuestions) : 1;
    return { questionTypes, numQuestions: totalQuestions, marksPerQuestion };
  },
}));
