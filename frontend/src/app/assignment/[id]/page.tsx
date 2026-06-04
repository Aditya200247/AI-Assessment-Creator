'use client';

import dynamic from 'next/dynamic';
import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Download, RefreshCw, Loader2,
  AlertCircle, CheckCircle, Zap, Sparkles
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignment, regenerateAssignment } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import QuestionPaperView from '@/components/QuestionPaperView';
import toast from 'react-hot-toast';

// PDF component loaded client-side only
const PDFDownloadButton = dynamic(() => import('@/components/PDFDownloadButton'), {
  ssr: false,
  loading: () => (
    <button className="btn-secondary py-2.5 px-4 text-sm opacity-60" disabled>
      <Download className="w-4 h-4" />
      PDF
    </button>
  ),
});

// Generating skeleton
function GeneratingSkeleton({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#6C5CE7]/10 flex items-center justify-center mx-auto mb-4 glow-pulse">
          <Sparkles className="w-8 h-8 text-[#6C5CE7]" />
        </div>
        <h2 className="text-xl font-bold text-[#2D3748] mb-2">AI is crafting your question paper</h2>
        <p className="text-[#718096] text-sm mb-6">{message || 'Analyzing your requirements and generating questions...'}</p>

        {/* Progress bar */}
        <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-animated transition-all duration-500"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
        <p className="text-xs text-[#A0AEC0]">{progress}% complete</p>
      </div>

      {/* Skeleton preview */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm opacity-40">
        <div className="skeleton h-36" />
        <div className="p-8 space-y-4">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-4/6" />
          <div className="mt-6 skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

// Failed state
function FailedState({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-[#2D3748] mb-2">Generation Failed</h2>
      <p className="text-[#718096] text-sm mb-6">
        Something went wrong while generating your question paper. This may be due to an API issue. Please try again.
      </p>
      <button onClick={onRetry} disabled={retrying} className="btn-primary mx-auto">
        {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {retrying ? 'Retrying...' : 'Try Again'}
      </button>
    </div>
  );
}

// Main Output Page
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
      .then((data) => {
        setCurrentAssignment(data);
      })
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
    <div className="min-h-screen bg-[#F8F9FE]">
      {/* Sticky action bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-[#718096] hover:text-[#2D3748] transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
          </Link>
          <div className="w-px h-5 bg-[#E2E8F0]" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-[#2D3748] truncate text-sm">
              {loading ? 'Loading...' : assignment?.title ?? 'Assignment'}
            </span>
            {assignment?.status === 'completed' && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-[#00875A] bg-[#00B894]/10 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                <CheckCircle className="w-3 h-3" />Completed
              </span>
            )}
          </div>

          {/* Action buttons */}
          {assignment?.status === 'completed' && assignment.questionPaper && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <PDFDownloadButton assignment={assignment} questionPaper={assignment.questionPaper} />
              <button onClick={handleRegenerate} className="btn-secondary py-2.5 px-4 text-sm">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            </div>
          )}

          {(assignment?.status === 'pending' || assignment?.status === 'processing') && (
            <button onClick={handleRegenerate} className="btn-secondary py-2 px-3 text-xs opacity-60" disabled>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#6C5CE7] animate-spin mb-3" />
            <p className="text-[#718096] text-sm">Loading assignment...</p>
          </div>
        )}

        {/* Pending / Processing */}
        {!loading && (assignment?.status === 'pending' || assignment?.status === 'processing') && (
          <GeneratingSkeleton
            progress={progress || (assignment.status === 'pending' ? 5 : 30)}
            message={progressMessage || 'Connecting to AI...'}
          />
        )}

        {/* Failed */}
        {!loading && assignment?.status === 'failed' && (
          <FailedState onRetry={handleRegenerate} retrying={false} />
        )}

        {/* Completed */}
        {!loading && assignment?.status === 'completed' && assignment.questionPaper && (
          <div className="animate-fade-in-up">
            <QuestionPaperView
              assignment={assignment}
              questionPaper={assignment.questionPaper}
            />
          </div>
        )}

        {/* Completed but no paper yet (race condition) */}
        {!loading && assignment?.status === 'completed' && !assignment.questionPaper && (
          <div className="text-center py-12 text-[#718096]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6C5CE7]" />
            <p className="text-sm">Loading question paper...</p>
          </div>
        )}
      </main>
    </div>
  );
}
