'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Plus, FileText, Calendar, Hash, Star,
  Loader2, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignments } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Assignment, AssignmentStatus } from '@/types';

// Status badge component
function StatusBadge({ status }: { status: AssignmentStatus }) {
  if (status === 'pending')
    return <span className="status-pending"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Pending</span>;
  if (status === 'processing')
    return (
      <span className="status-processing">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
        Generating...
      </span>
    );
  if (status === 'completed')
    return <span className="status-completed"><span className="w-1.5 h-1.5 rounded-full bg-[#00B894] inline-block" />Completed</span>;
  return <span className="status-failed"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Failed</span>;
}

const STATUS_BORDER: Record<AssignmentStatus, string> = {
  pending: 'border-l-gray-300',
  processing: 'border-l-blue-400',
  completed: 'border-l-[#00B894]',
  failed: 'border-l-red-400',
};

// Assignment card component
function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const totalMarks = assignment.numQuestions * assignment.marksPerQuestion;
  const borderColor = STATUS_BORDER[assignment.status];

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-[#E2E8F0] border-l-4 ${borderColor}
        card-hover p-6 flex flex-col gap-4 animate-fade-in-up`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#6C5CE7]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D3748] text-base leading-tight line-clamp-1">
              {assignment.title}
            </h3>
            <p className="text-xs text-[#718096] mt-0.5">
              {assignment.questionTypes.join(' · ')}
            </p>
          </div>
        </div>
        <StatusBadge status={assignment.status} />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-[#718096]">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
        </span>
        <span className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5" />
          {assignment.numQuestions} questions
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5" />
          {totalMarks} marks
        </span>
      </div>

      {/* Created */}
      <p className="text-xs text-[#A0AEC0]">
        Created {format(new Date(assignment.createdAt), 'MMM d, yyyy · h:mm a')}
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {assignment.status === 'completed' ? (
          <Link
            href={`/assignment/${assignment._id}`}
            className="btn-primary flex-1 justify-center text-sm py-2.5"
          >
            <FileText className="w-4 h-4" />
            View Paper
          </Link>
        ) : assignment.status === 'processing' ? (
          <Link
            href={`/assignment/${assignment._id}`}
            className="btn-outline flex-1 justify-center text-sm py-2.5"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            View Progress
          </Link>
        ) : assignment.status === 'failed' ? (
          <Link
            href={`/assignment/${assignment._id}`}
            className="btn-outline flex-1 justify-center text-sm py-2.5 border-red-300 text-red-500 hover:bg-red-50"
          >
            <AlertCircle className="w-4 h-4" />
            View Details
          </Link>
        ) : (
          <Link
            href={`/assignment/${assignment._id}`}
            className="btn-outline flex-1 justify-center text-sm py-2.5"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </Link>
        )}
      </div>
    </div>
  );
}

// Skeleton loading card
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-3 w-32 rounded" />
      <div className="skeleton h-9 w-full rounded-xl" />
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="animate-float mb-8">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="72" fill="#6C5CE7" fillOpacity="0.08" />
          <rect x="48" y="36" width="64" height="84" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
          <rect x="58" y="52" width="44" height="4" rx="2" fill="#E2E8F0"/>
          <rect x="58" y="64" width="36" height="4" rx="2" fill="#E2E8F0"/>
          <rect x="58" y="76" width="40" height="4" rx="2" fill="#E2E8F0"/>
          <rect x="58" y="88" width="28" height="4" rx="2" fill="#E2E8F0"/>
          <circle cx="112" cy="44" r="20" fill="#6C5CE7"/>
          <path d="M104 44l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="48" cy="112" r="8" fill="#00CEC9" fillOpacity="0.6"/>
          <circle cx="120" cy="100" r="5" fill="#FDCB6E" fillOpacity="0.8"/>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#2D3748] mb-3">No assignments yet</h2>
      <p className="text-[#718096] max-w-sm mb-8 leading-relaxed">
        Create your first AI-powered question paper in seconds. Just fill in the details and let the AI do the work.
      </p>
      <Link href="/create" className="btn-primary text-base px-8 py-3.5">
        <Plus className="w-5 h-5" />
        Create Assignment
      </Link>
    </div>
  );
}

// Dashboard
export default function DashboardPage() {
  const { assignments, loading, error, setAssignments, setLoading, setError } =
    useAssignmentStore();

  // Listen to global WS events for status updates
  useWebSocket({});

  useEffect(() => {
    async function loadAssignments() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAssignments();
        setAssignments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, [setAssignments, setLoading, setError]);

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] flex items-center justify-center shadow-lg shadow-[#6C5CE7]/25">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-bold text-[#2D3748] text-lg leading-none">VedaAI</span>
              <p className="text-[10px] text-[#718096] leading-none mt-0.5">AI Assessment Creator</p>
            </div>
          </div>
          <Link href="/create" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Assignment
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        {(loading || assignments.length > 0 || error) && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">My Assignments</h1>
              <p className="text-[#718096] text-sm mt-1">
                {assignments.length > 0
                  ? `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} created`
                  : 'Manage your AI-generated question papers'}
              </p>
            </div>
            {!loading && (
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await getAssignments();
                    setAssignments(data);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="btn-secondary py-2 px-4 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && assignments.length === 0 && <EmptyState />}

        {/* Assignment grid */}
        {!loading && assignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {assignments.map((a) => (
              <AssignmentCard key={a._id} assignment={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
