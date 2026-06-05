'use client';

import dynamic from 'next/dynamic';
import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, ChevronDown, Download, RefreshCw, Loader2,
  AlertCircle, CheckCircle, Sparkles,
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignment, regenerateAssignment } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import QuestionPaperView from '@/components/QuestionPaperView';
import toast from 'react-hot-toast';

/* PDF button: client-only */
const PDFDownloadButton = dynamic(() => import('@/components/PDFDownloadButton'), {
  ssr: false,
  loading: () => (
    <button className="btn-secondary py-2 px-4 text-sm opacity-60" disabled>
      <Download className="w-4 h-4" /> PDF
    </button>
  ),
});

/* ── Top Bar ─────────────────────────────────────────── */
function TopBar({ title, status, completed }: {
  title: string; status: string; completed: boolean;
}) {
  return (
    <header className="top-bar no-print">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
          <span>←</span>
          <span>Assignment</span>
        </Link>
        {title && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{title}</span>
          </>
        )}
        {completed && (
          <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4 text-gray-500" />
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

/* ── Generating skeleton ─────────────────────────────── */
function GeneratingSkeleton({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 glow-pulse">
          <Sparkles className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">AI is crafting your question paper</h2>
        <p className="text-gray-400 text-sm mb-6">
          {message || 'Analyzing your requirements and generating questions…'}
        </p>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5 overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-animated transition-all duration-700"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{progress}% complete</p>
      </div>

      {/* Ghost paper preview */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden opacity-30">
        <div className="skeleton h-28" />
        <div className="p-8 space-y-4">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="skeleton h-3 w-4/6 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ── Failed state ────────────────────────────────────── */
function FailedState({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h2>
      <p className="text-gray-400 text-sm mb-6">
        Something went wrong while generating your question paper. Please try again.
      </p>
      <button onClick={onRetry} disabled={retrying} className="btn-primary mx-auto">
        {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {retrying ? 'Retrying…' : 'Try Again'}
      </button>
    </div>
  );
}

/* ── Main output page ────────────────────────────────── */
export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentAssignment, loading, setCurrentAssignment, setLoading, updateAssignment } =
    useAssignmentStore();

  const { progress, progressMessage } = useWebSocket({ assignmentId: id });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAssignment(id)
      .then(setCurrentAssignment)
      .catch(() => {
        toast.error('Failed to load assignment');
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [id, setCurrentAssignment, setLoading, router]);

  const handleRegenerate = useCallback(async () => {
    if (!currentAssignment) return;
    try {
      updateAssignment(id, { status: 'pending' });
      await regenerateAssignment(id);
      toast.success('Regeneration queued!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate');
      updateAssignment(id, { status: 'failed' });
    }
  }, [id, currentAssignment, updateAssignment]);

  const assignment = currentAssignment;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title={loading ? 'Loading…' : (assignment?.title ?? 'Assignment')}
        status={assignment?.status ?? ''}
        completed={assignment?.status === 'completed'}
      />

      {/* Action bar — only for completed */}
      {assignment?.status === 'completed' && assignment.questionPaper && (
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 no-print">
          <div className="flex-1">
            <p className="text-xs text-gray-400 leading-snug max-w-xl">
              Ganging, Lacerations are customised question repair for your class.
              Index a detailed dossier on the recent directions.
            </p>
          </div>
          <PDFDownloadButton assignment={assignment} questionPaper={assignment.questionPaper} />
          <button onClick={handleRegenerate} className="btn-secondary py-2 px-4 text-sm">
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      )}

      <main className="flex-1 p-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading assignment…</p>
          </div>
        )}

        {/* Pending / Processing */}
        {!loading && (assignment?.status === 'pending' || assignment?.status === 'processing') && (
          <GeneratingSkeleton
            progress={progress || (assignment.status === 'pending' ? 5 : 30)}
            message={progressMessage || 'Connecting to AI…'}
          />
        )}

        {/* Failed */}
        {!loading && assignment?.status === 'failed' && (
          <FailedState onRetry={handleRegenerate} retrying={false} />
        )}

        {/* Completed — question paper */}
        {!loading && assignment?.status === 'completed' && assignment.questionPaper && (
          <div className="animate-fade-in-up max-w-4xl mx-auto">
            <QuestionPaperView
              assignment={assignment}
              questionPaper={assignment.questionPaper}
            />
          </div>
        )}

        {/* Completed but paper not loaded yet */}
        {!loading && assignment?.status === 'completed' && !assignment.questionPaper && (
          <div className="text-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-sm">Loading question paper…</p>
          </div>
        )}
      </main>
    </div>
  );
}
