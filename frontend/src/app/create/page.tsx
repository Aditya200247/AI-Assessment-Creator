'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Upload, X, Sparkles, Calendar, FileText,
  Hash, Star, BookOpen, ChevronRight, AlertCircle, Loader2, Zap
} from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import { createAssignment } from '@/lib/api';
import { QuestionType } from '@/types';
import toast from 'react-hot-toast';

const QUESTION_TYPES: { type: QuestionType; label: string; desc: string; icon: string }[] = [
  { type: 'MCQ', label: 'Multiple Choice', desc: '4 options per question', icon: '🔘' },
  { type: 'Short Answer', label: 'Short Answer', desc: '2-3 sentence responses', icon: '✏️' },
  { type: 'Long Answer', label: 'Long Answer', desc: 'Detailed explanations', icon: '📝' },
  { type: 'True/False', label: 'True / False', desc: 'Binary answer questions', icon: '⚖️' },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { form, errors, isSubmitting, setField, toggleQuestionType, setSubmitting, validate, resetForm } =
    useFormStore();
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) { setField('file', null); return; }
      const allowed = ['application/pdf', 'text/plain'];
      if (!allowed.includes(file.type)) {
        toast.error('Only PDF and .txt files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File must be under 10MB');
        return;
      }
      setField('file', file);
    },
    [setField]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFileChange(e.dataTransfer.files?.[0] ?? null);
    },
    [handleFileChange]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('dueDate', form.dueDate);
      fd.append('questionTypes', JSON.stringify(form.questionTypes));
      fd.append('numQuestions', String(form.numQuestions));
      fd.append('marksPerQuestion', String(form.marksPerQuestion));
      fd.append('difficulty', JSON.stringify(form.difficulty));
      fd.append('instructions', form.instructions);
      if (form.file) fd.append('file', form.file);

      const { assignmentId } = await createAssignment(fd);
      resetForm();
      toast.success('Assignment created! Generating your question paper...', { duration: 3000 });
      router.push(`/assignment/${assignmentId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create assignment');
      setSubmitting(false);
    }
  };

  const diffTotal = form.difficulty.easy + form.difficulty.moderate + form.difficulty.hard;

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-[#718096] hover:text-[#2D3748] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="w-px h-5 bg-[#E2E8F0]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-[#2D3748]">New Assignment</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-[#2D3748]">Create Assignment</h1>
          <p className="text-[#718096] mt-2">
            Fill in the details below and our AI will generate a structured question paper for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm animate-fade-in-up-delay-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#6C5CE7]" />
              </div>
              <h2 className="font-semibold text-[#2D3748] text-lg">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                  Assignment Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="e.g. Quiz on Electricity and Magnetism"
                  className={`input-base ${errors.title ? 'error' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.title}
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Due Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setField('dueDate', e.target.value)}
                  className={`input-base ${errors.dueDate ? 'error' : ''}`}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.dueDate}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Reference Material <span className="text-[#A0AEC0] font-normal">(optional)</span>
                </label>
                {form.file ? (
                  <div className="flex items-center gap-3 p-3 bg-[#6C5CE7]/5 border border-[#6C5CE7]/20 rounded-xl">
                    <FileText className="w-4 h-4 text-[#6C5CE7] flex-shrink-0" />
                    <span className="text-sm text-[#2D3748] flex-1 truncate">{form.file.name}</span>
                    <button type="button" onClick={() => setField('file', null)}
                      className="text-[#718096] hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200
                      ${dragActive ? 'border-[#6C5CE7] bg-[#6C5CE7]/5' : 'border-[#E2E8F0] hover:border-[#6C5CE7]/50 hover:bg-[#6C5CE7]/2'}`}
                  >
                    <Upload className="w-5 h-5 text-[#A0AEC0] mx-auto mb-1" />
                    <p className="text-xs text-[#718096]">Drop PDF or text file here</p>
                    <p className="text-xs text-[#A0AEC0]">or click to browse · max 10MB</p>
                    <input
                      id="file-input" type="file" accept=".pdf,.txt"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question settings */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm animate-fade-in-up-delay-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#00CEC9]/10 flex items-center justify-center">
                <Hash className="w-4 h-4 text-[#00CEC9]" />
              </div>
              <h2 className="font-semibold text-[#2D3748] text-lg">Question Settings</h2>
            </div>

            {/* Question Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2D3748] mb-3">
                Question Types <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUESTION_TYPES.map(({ type, label, desc, icon }) => {
                  const selected = form.questionTypes.includes(type);
                  return (
                    <button
                      key={type} type="button"
                      onClick={() => toggleQuestionType(type)}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200
                        ${selected
                          ? 'border-[#6C5CE7] bg-[#6C5CE7]/5'
                          : 'border-[#E2E8F0] hover:border-[#6C5CE7]/40'}`}
                    >
                      <span className="text-lg">{icon}</span>
                      <p className={`text-sm font-medium mt-1 ${selected ? 'text-[#6C5CE7]' : 'text-[#2D3748]'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-[#A0AEC0] mt-0.5">{desc}</p>
                    </button>
                  );
                })}
              </div>
              {errors.questionTypes && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.questionTypes}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Num Questions */}
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                  Number of Questions <span className="text-red-400">*</span>
                </label>
                <input
                  id="numQuestions" type="number" min={1} max={100}
                  value={form.numQuestions}
                  onChange={(e) => setField('numQuestions', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 20"
                  className={`input-base ${errors.numQuestions ? 'error' : ''}`}
                />
                {errors.numQuestions && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.numQuestions}
                  </p>
                )}
              </div>

              {/* Marks per Question */}
              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                  <Star className="w-3.5 h-3.5 inline mr-1" />
                  Marks per Question <span className="text-red-400">*</span>
                </label>
                <input
                  id="marksPerQuestion" type="number" min={1} max={20}
                  value={form.marksPerQuestion}
                  onChange={(e) => setField('marksPerQuestion', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 2"
                  className={`input-base ${errors.marksPerQuestion ? 'error' : ''}`}
                />
                {errors.marksPerQuestion && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.marksPerQuestion}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Difficulty & instructions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm animate-fade-in-up-delay-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#FDCB6E]/20 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-[#B7791F]" />
              </div>
              <h2 className="font-semibold text-[#2D3748] text-lg">Difficulty & Instructions</h2>
            </div>

            {/* Difficulty sliders */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[#2D3748]">Difficulty Distribution</label>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffTotal === 100 ? 'bg-[#00B894]/10 text-[#00875A]' : 'bg-red-50 text-red-500'}`}>
                  {diffTotal}% / 100%
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {([
                  { key: 'easy', label: 'Easy', color: '#00B894', bg: 'bg-[#00B894]' },
                  { key: 'moderate', label: 'Moderate', color: '#FDCB6E', bg: 'bg-[#FDCB6E]' },
                  { key: 'hard', label: 'Hard', color: '#E17055', bg: 'bg-[#E17055]' },
                ] as const).map(({ key, label, color, bg }) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm text-[#2D3748] w-16 font-medium">{label}</span>
                    <div className="flex-1 relative h-2 bg-[#F1F5F9] rounded-full">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all ${bg}`}
                        style={{ width: `${form.difficulty[key]}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} max={100}
                        value={form.difficulty[key]}
                        onChange={(e) =>
                          setField('difficulty', { ...form.difficulty, [key]: Number(e.target.value) })
                        }
                        className="w-14 text-center text-sm border border-[#E2E8F0] rounded-lg px-2 py-1 focus:outline-none focus:border-[#6C5CE7]"
                        style={{ color }}
                      />
                      <span className="text-[#A0AEC0] text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.difficulty && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.difficulty}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-[#2D3748] mb-1.5">
                Additional Instructions <span className="text-[#A0AEC0] font-normal">(optional)</span>
              </label>
              <textarea
                id="instructions"
                rows={4}
                value={form.instructions}
                onChange={(e) => setField('instructions', e.target.value)}
                placeholder="e.g. Focus on chapters 3-5, include real-world application questions, avoid repetition..."
                className="input-base resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 justify-end pb-6">
            <Link href="/" className="btn-secondary">Cancel</Link>
            <button
              type="submit"
              id="generate-btn"
              disabled={isSubmitting}
              className="btn-primary px-8 py-3.5 text-base"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-5 h-5" />Generate Question Paper</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
