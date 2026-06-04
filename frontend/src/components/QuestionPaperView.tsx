'use client';

import { Assignment, QuestionPaper, QuestionDifficulty, Question } from '@/types';
import { format } from 'date-fns';

interface Props {
  assignment: Assignment;
  questionPaper: QuestionPaper;
}

function DifficultyBadge({ difficulty }: { difficulty: QuestionDifficulty }) {
  if (difficulty === 'Easy') return <span className="badge-easy">Easy</span>;
  if (difficulty === 'Moderate') return <span className="badge-moderate">Moderate</span>;
  return <span className="badge-hard">Hard</span>;
}

function QuestionItem({ question, index }: { question: Question; index: number }) {
  return (
    <div className="py-4 border-b border-[#F1F5F9] last:border-0">
      <div className="flex items-start gap-3">
        <span className="font-bold text-[#6C5CE7] text-sm mt-0.5 w-6 flex-shrink-0">{index}.</span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[#2D3748] text-sm leading-relaxed font-medium">{question.text}</p>
            <span className="text-xs text-[#718096] whitespace-nowrap font-semibold flex-shrink-0 bg-[#F8F9FE] px-2 py-1 rounded-lg border border-[#E2E8F0]">
              [{question.marks} Mark{question.marks !== 1 ? 's' : ''}]
            </span>
          </div>

          {/* MCQ Options */}
          {question.options && question.options.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {question.options.map((opt, oi) => (
                <div key={oi} className="flex items-start gap-2 text-sm text-[#4A5568]">
                  <span className="font-semibold text-[#6C5CE7] w-5 flex-shrink-0">
                    {String.fromCharCode(65 + oi)})
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2">
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionPaperView({ assignment, questionPaper }: Props) {
  const totalMarks = assignment.numQuestions * assignment.marksPerQuestion;
  let qCounter = 0;

  return (
    <div
      id="question-paper"
      className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] overflow-hidden max-w-4xl mx-auto print-paper"
    >
      {/* Exam Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white px-8 py-7">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C5CE7] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-[#a29bfe] font-semibold text-sm uppercase tracking-wider">VedaAI Assessment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
          <p className="text-[#94a3b8] text-sm mt-1">AI-Generated Examination Paper</p>
        </div>

        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[#94a3b8] text-xs uppercase tracking-wide">Date</p>
            <p className="font-semibold mt-0.5">{format(new Date(assignment.dueDate), 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs uppercase tracking-wide">Max Marks</p>
            <p className="font-semibold mt-0.5">{totalMarks}</p>
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs uppercase tracking-wide">Questions</p>
            <p className="font-semibold mt-0.5">{assignment.numQuestions}</p>
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs uppercase tracking-wide">Duration</p>
            <p className="font-semibold mt-0.5">As per schedule</p>
          </div>
        </div>
      </div>

      {/* Student Info Section */}
      <div className="px-8 py-5 bg-[#F8F9FE] border-b border-[#E2E8F0]">
        <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-4">Student Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Full Name', id: 'student-name' },
            { label: 'Roll Number', id: 'roll-number' },
            { label: 'Section', id: 'section' },
          ].map(({ label, id }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-xs font-medium text-[#718096] mb-1">{label}</label>
              <input
                id={id}
                type="text"
                className="w-full border-0 border-b-2 border-[#CBD5E0] bg-transparent py-1.5 text-sm font-medium text-[#2D3748] focus:outline-none focus:border-[#6C5CE7] transition-colors placeholder:text-[#CBD5E0]"
                placeholder={`Enter ${label}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* General Instructions */}
      <div className="px-8 py-4 bg-[#FFFBEB] border-b border-[#FDE68A]">
        <p className="text-xs font-semibold text-[#92400E] uppercase tracking-wider mb-2">General Instructions</p>
        <ul className="list-disc list-inside text-xs text-[#78350F] space-y-1">
          <li>All questions are compulsory unless stated otherwise.</li>
          <li>Write legibly. Marks may be deducted for illegible answers.</li>
          <li>Do not write anything on the question paper except where indicated.</li>
        </ul>
      </div>

      {/* Sections */}
      <div className="px-8 py-6 space-y-8">
        {questionPaper.sections.map((section) => (
          <div key={section.title}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#6C5CE7] to-[#a29bfe]" />
                <div>
                  <h2 className="font-bold text-[#2D3748] text-base uppercase tracking-wide">
                    {section.title}
                  </h2>
                  <p className="text-xs text-[#718096]">{section.instruction}</p>
                </div>
              </div>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <span className="text-xs text-[#A0AEC0] font-medium whitespace-nowrap">
                {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Questions */}
            <div className="pl-4">
              {section.questions.map((q) => {
                qCounter++;
                return <QuestionItem key={qCounter} question={q} index={qCounter} />;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-[#F8F9FE] border-t border-[#E2E8F0] text-center">
        <p className="text-xs text-[#A0AEC0]">
          Generated by VedaAI · {format(new Date(questionPaper.generatedAt), 'MMMM d, yyyy')} ·{' '}
          <span className="text-[#6C5CE7] font-medium">All the best!</span>
        </p>
      </div>
    </div>
  );
}
