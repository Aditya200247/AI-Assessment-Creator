import { create } from 'zustand';
import { CreateAssignmentForm, QuestionType } from '@/types';

interface FormErrors {
  title?: string;
  dueDate?: string;
  questionTypes?: string;
  numQuestions?: string;
  marksPerQuestion?: string;
  difficulty?: string;
}

interface FormStore {
  form: CreateAssignmentForm;
  errors: FormErrors;
  isSubmitting: boolean;
  setField: <K extends keyof CreateAssignmentForm>(
    field: K,
    value: CreateAssignmentForm[K]
  ) => void;
  toggleQuestionType: (type: QuestionType) => void;
  setErrors: (errors: FormErrors) => void;
  setSubmitting: (v: boolean) => void;
  resetForm: () => void;
  validate: () => boolean;
}

const defaultForm: CreateAssignmentForm = {
  title: '',
  dueDate: '',
  questionTypes: [],
  numQuestions: '',
  marksPerQuestion: '',
  difficulty: { easy: 40, moderate: 40, hard: 20 },
  instructions: '',
  file: null,
};

export const useFormStore = create<FormStore>((set, get) => ({
  form: defaultForm,
  errors: {},
  isSubmitting: false,

  setField: (field, value) =>
    set((state) => ({ form: { ...state.form, [field]: value } })),

  toggleQuestionType: (type) =>
    set((state) => {
      const current = state.form.questionTypes;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { form: { ...state.form, questionTypes: updated } };
    }),

  setErrors: (errors) => set({ errors }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  resetForm: () => set({ form: defaultForm, errors: {} }),

  validate: () => {
    const { form } = get();
    const errors: FormErrors = {};

    if (!form.title.trim() || form.title.trim().length < 3)
      errors.title = 'Title must be at least 3 characters';

    if (!form.dueDate)
      errors.dueDate = 'Due date is required';
    else if (new Date(form.dueDate) <= new Date())
      errors.dueDate = 'Due date must be in the future';

    if (form.questionTypes.length === 0)
      errors.questionTypes = 'Select at least one question type';

    const nq = Number(form.numQuestions);
    if (!form.numQuestions || isNaN(nq) || nq < 1 || nq > 100)
      errors.numQuestions = 'Enter a number between 1 and 100';

    const mpq = Number(form.marksPerQuestion);
    if (!form.marksPerQuestion || isNaN(mpq) || mpq < 1 || mpq > 20)
      errors.marksPerQuestion = 'Enter a number between 1 and 20';

    const { easy, moderate, hard } = form.difficulty;
    if (easy + moderate + hard !== 100)
      errors.difficulty = 'Difficulty percentages must sum to 100';

    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));
