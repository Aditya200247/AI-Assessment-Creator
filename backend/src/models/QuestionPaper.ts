import mongoose, { Document, Schema } from 'mongoose';
import { QuestionDifficulty } from '../types';

export interface IQuestionDoc {
  text: string;
  difficulty: QuestionDifficulty;
  marks: number;
  options?: string[];
}

export interface ISectionDoc {
  title: string;
  instruction: string;
  questions: IQuestionDoc[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISectionDoc[];
  generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestionDoc>({
  text: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Moderate', 'Hard'],
  },
  marks: { type: Number, required: true, min: 1 },
  options: { type: [String], default: undefined },
});

const SectionSchema = new Schema<ISectionDoc>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
});

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
    unique: true,
  },
  sections: { type: [SectionSchema], required: true },
  generatedAt: { type: Date, default: Date.now },
});

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  'QuestionPaper',
  QuestionPaperSchema
);
