'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, ChevronDown, Upload, X, Plus, Minus,
  Calendar, AlertCircle, Loader2, Sparkles, CloudUpload, FileText,
} from 'lucide-react';
import { useFormStore, QUESTION_TYPE_OPTIONS, QuestionTypeRow } from '@/store/formStore';
import { createAssignment } from '@/lib/api';
import { QuestionType } from '@/types';
import toast from 'react-hot-toast';

/* ── Top Bar ─────────────────────────────────────────── */
function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 no-print flex-shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5 font-semibold">
          <span>←</span>
          <span>Assignment</span>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF5B35] rounded-full" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            J
          </div>
          <span className="text-sm font-medium text-gray-700">John Doe</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </header>
  );
}

/* ── Stepper control ─────────────────────────────────── */
function Stepper({ value, onChange, min = 1, max = 100 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="stepper-val">{value}</span>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ── Question Type Row ───────────────────────────────── */
function QuestionTypeRowItem({ row, onRemove, onUpdate }: {
  row: QuestionTypeRow;
  onRemove: () => void;
  onUpdate: (field: keyof QuestionTypeRow, value: string | number) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 animate-fade-in-up">
      {/* Type dropdown */}
      <div className="flex-1 min-w-0">
        <select
          value={row.label}
          onChange={e => {
            const opt = QUESTION_TYPE_OPTIONS.find(o => o.label === e.target.value);
            onUpdate('label', e.target.value);
            if (opt) onUpdate('backendType', opt.backendType as QuestionType);
          }}
          className="w-full text-sm text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#1A1A2E] transition-colors appearance-none cursor-pointer"
        >
          {QUESTION_TYPE_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.label}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* No. of Questions */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <span className="text-[10px] text-gray-400 font-medium">Questions</span>
        <Stepper value={row.count} onChange={v => onUpdate('count', v)} max={50} />
      </div>

      {/* Marks */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <span className="text-[10px] text-gray-400 font-medium">Marks</span>
        <Stepper value={row.marksPerQuestion} onChange={v => onUpdate('marksPerQuestion', v)} max={20} />
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────── */
export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    form, errors, isSubmitting,
    setField, addRow, removeRow, updateRow,
    setSubmitting, validate, resetForm,
    getTotals, getSubmitPayload,
  } = useFormStore();

  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) { setField('file', null); return; }
    const allowed = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, PNG, JPEG and .txt files are allowed');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File must be under 15 MB');
      return;
    }
    setField('file', file);
  }, [setField]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }, [handleFileChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const { questionTypes, numQuestions, marksPerQuestion } = getSubmitPayload();
      const fd = new FormData();
      fd.append('title',            form.title);
      fd.append('dueDate',          form.dueDate);
      fd.append('questionTypes',    JSON.stringify(questionTypes));
      fd.append('numQuestions',     String(numQuestions));
      fd.append('marksPerQuestion', String(marksPerQuestion));
      fd.append('difficulty',       JSON.stringify(form.difficulty));
      fd.append('instructions',     form.instructions);
      if (form.file) fd.append('file', form.file);

      const { assignmentId } = await createAssignment(fd);
      resetForm();
      toast.success('Assignment created! Generating your question paper…', { duration: 3000 });
      router.push(`/assignment/${assignmentId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create assignment');
      setSubmitting(false);
    }
  };

  const { totalQuestions, totalMarks } = getTotals();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Page heading */}
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Fill in the details to generate your custom question paper.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── Assignment Details card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up-delay-1">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Assignment Details</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Assignment Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Quiz on Electricity and Magnetism"
                className={`input-base ${errors.title ? 'error' : ''}`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.title}
                </p>
              )}
            </div>

            {/* File upload */}
            {form.file ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-4">
                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{form.file.name}</span>
                <button type="button" onClick={() => setField('file', null)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-4 ${
                  dragActive
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <CloudUpload className={`w-8 h-8 mx-auto mb-3 ${dragActive ? 'text-indigo-400' : 'text-gray-300'}`} />
                <p className="text-sm text-gray-500 font-medium">
                  Choose a file or drag &amp; drop it here
                </p>
                <p className="text-xs text-gray-400 mt-1 mb-3">
                  .PDF, .PNG, .JPEG &nbsp;|&nbsp; max 15 MB
                </p>
                <button
                  type="button"
                  className="px-4 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Browse Files
                </button>
                <input
                  id="file-input" type="file"
                  accept=".pdf,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </div>
            )}

            <p className="text-xs text-gray-400 text-center -mt-2 mb-4">
              Upload images of your preferred documents/design
            </p>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Due Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setField('dueDate', e.target.value)}
                  className={`input-base pr-10 ${errors.dueDate ? 'error' : ''}`}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* ── Question Types card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up-delay-2">
            {/* Column headers */}
            <div className="flex items-center gap-3 mb-1">
              <span className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Question Type
              </span>
              <span className="w-6" />
              <span className="w-[100px] text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                No of Questions
              </span>
              <span className="w-[100px] text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Marks
              </span>
            </div>

            {/* Rows */}
            <div>
              {form.questionTypeRows.map(row => (
                <QuestionTypeRowItem
                  key={row.id}
                  row={row}
                  onRemove={() => removeRow(row.id)}
                  onUpdate={(field, value) => updateRow(row.id, field, value)}
                />
              ))}
            </div>

            {errors.questionTypeRows && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.questionTypeRows}
              </p>
            )}

            {/* Add row */}
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium mt-3 hover:text-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question Type
            </button>

            {/* Totals */}
            <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-gray-50 text-sm">
              <span className="text-gray-400">
                Total Questions:{' '}
                <span className="font-semibold text-gray-800">{totalQuestions}</span>
              </span>
              <span className="text-gray-400">
                Total Marks:{' '}
                <span className="font-semibold text-gray-800">{totalMarks}</span>
              </span>
            </div>
          </div>

          {/* ── Additional Information card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up-delay-3">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Additional Information{' '}
              <span className="font-normal text-gray-400 text-xs">(For better output)</span>
            </label>
            <textarea
              id="instructions"
              rows={3}
              value={form.instructions}
              onChange={e => setField('instructions', e.target.value)}
              placeholder="e.g. Common questions that arise for your exam to select direction"
              className="input-base resize-none"
            />
          </div>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between pb-6 mt-4">
            <Link href="/" className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors duration-150">
              <span>←</span> Previous
            </Link>
            <button
              type="submit"
              id="generate-btn"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-8 py-2.5 bg-black hover:bg-gray-800 text-white rounded-[12px] text-sm font-semibold shadow-sm transition-colors duration-150 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Next →</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
