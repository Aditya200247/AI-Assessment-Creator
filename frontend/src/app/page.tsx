'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Bell, ChevronDown, Plus, MoreVertical,
  Loader2, RefreshCw, Search, Filter,
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignments } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Assignment, AssignmentStatus } from '@/types';

/* ── Top Bar ─────────────────────────────────────────── */
function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 no-print flex-shrink-0">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-semibold">Assignment</span>
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

/* ── Status badge ─────────────────────────────────────── */
function StatusBadge({ status }: { status: AssignmentStatus }) {
  if (status === 'processing') return (
    <span className="status-processing">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
      Generating
    </span>
  );
  if (status === 'completed') return (
    <span className="status-completed">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Completed
    </span>
  );
  if (status === 'failed') return (
    <span className="status-failed">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Failed
    </span>
  );
  return (
    <span className="status-pending">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      Pending
    </span>
  );
}

/* ── Dot-menu ─────────────────────────────────────────── */
function DotMenu({ assignment }: { assignment: Assignment }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); setOpen(o => !o); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-36 text-sm">
            {assignment.status === 'completed' && (
              <Link href={`/assignment/${assignment._id}`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
                View Paper
              </Link>
            )}
            <button className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Assignment Card ──────────────────────────────────── */
function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const href = `/assignment/${assignment._id}`;
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-[16px] border border-gray-100 p-5 card-hover cursor-pointer animate-fade-in-up shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 flex-1">
            {assignment.title}
          </h3>
          <DotMenu assignment={assignment} />
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span>
            Assigned on:{' '}
            <span className="text-gray-600 font-medium">
              {format(new Date(assignment.createdAt), 'dd-MM-yyyy')}
            </span>
          </span>
          <span className="text-gray-200">|</span>
          <span>
            Due:{' '}
            <span className="text-gray-600 font-medium">
              {format(new Date(assignment.dueDate), 'dd-MM-yyyy')}
            </span>
          </span>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-150 rounded-lg px-2.5 py-0.5">
              {assignment.numQuestions} Qs · {assignment.numQuestions * assignment.marksPerQuestion} marks
            </span>
          </div>
          <StatusBadge status={assignment.status} />
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton card ────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="skeleton h-4 flex-1 rounded" />
        <div className="skeleton w-5 h-5 rounded" />
      </div>
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-24 rounded-lg" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center">
      <div className="animate-float mb-8">
        {/* Magnifying glass with X illustration */}
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="70" fill="#F4F5F7"/>
          {/* Magnifying glass */}
          <circle cx="58" cy="56" r="28" fill="white" stroke="#E8EAED" strokeWidth="3"/>
          <circle cx="58" cy="56" r="22" fill="#F9FAFB" stroke="#E8EAED" strokeWidth="2"/>
          {/* Handle */}
          <line x1="78" y1="76" x2="96" y2="96" stroke="#D1D5DB" strokeWidth="7" strokeLinecap="round"/>
          {/* X mark */}
          <circle cx="58" cy="56" r="13" fill="#FEE2E2"/>
          <line x1="52" y1="50" x2="64" y2="62" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          <line x1="64" y1="50" x2="52" y2="62" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No assignments yet</h2>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A2E] text-white rounded-[14px] text-sm font-semibold hover:bg-[#252550] transition-colors shadow-sm">
        <Plus className="w-4 h-4" />
        Create Your First Assignment
      </Link>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────── */
export default function DashboardPage() {
  const { assignments, loading, error, setAssignments, setLoading, setError } = useAssignmentStore();
  const [search, setSearch] = useState('');

  useWebSocket({});

  useEffect(() => {
    async function load() {
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
    load();
  }, [setAssignments, setLoading, setError]);

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <TopBar />

      <main className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Page header — only when there's content or loading */}
        {(loading || assignments.length > 0 || error) && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage and create assignments for your classes.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 mb-5 text-sm">
            {error}
          </div>
        )}

        {/* Filter + Search row */}
        {(loading || assignments.length > 0) && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[12px] text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer shadow-sm">
              <Filter className="w-4 h-4 text-gray-400" />
              <span>Filtering</span>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-white border border-gray-200 rounded-[12px] px-3.5 py-2 shadow-sm">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search assignment..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
              />
            </div>
            <div className="flex-1" />
            {!loading && (
              <button
                onClick={async () => {
                  setLoading(true);
                  try { const d = await getAssignments(); setAssignments(d); }
                  finally { setLoading(false); }
                }}
                className="btn-ghost p-2"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && assignments.length === 0 && <EmptyState />}

        {/* Grid and bottom center CTA */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col items-center gap-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {filtered.map(a => <AssignmentCard key={a._id} assignment={a} />)}
            </div>
            
            {/* Centered Pill Button matching Figma */}
            <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A2E] hover:bg-[#252550] text-white rounded-full text-sm font-semibold shadow-md transition-colors">
              <Plus className="w-4 h-4" />
              Create Assignment
            </Link>
          </div>
        )}

        {/* No search results */}
        {!loading && assignments.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No assignments match &ldquo;{search}&rdquo;
          </div>
        )}
      </main>
    </div>
  );
}
