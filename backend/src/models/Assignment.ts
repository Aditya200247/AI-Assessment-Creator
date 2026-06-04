import mongoose, { Document, Schema } from 'mongoose';
import { AssignmentStatus, QuestionType } from '../types';

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
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
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [String],
      required: true,
      enum: ['MCQ', 'Short Answer', 'Long Answer', 'True/False'],
    },
    numQuestions: { type: Number, required: true, min: 1, max: 100 },
    marksPerQuestion: { type: Number, required: true, min: 1, max: 20 },
    difficulty: {
      easy: { type: Number, default: 40, min: 0, max: 100 },
      moderate: { type: Number, default: 40, min: 0, max: 100 },
      hard: { type: Number, default: 20, min: 0, max: 100 },
    },
    instructions: { type: String, default: '' },
    fileContent: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
