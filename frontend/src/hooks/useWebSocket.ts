'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { useAssignmentStore } from '@/store/assignmentStore';
import { JobProgressEvent, JobCompleteEvent, JobErrorEvent } from '@/types';
import toast from 'react-hot-toast';

interface UseWebSocketOptions {
  assignmentId?: string;
}

interface UseWebSocketReturn {
  connected: boolean;
  progress: number;
  progressMessage: string;
}

export function useWebSocket({ assignmentId }: UseWebSocketOptions = {}): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const updateAssignment = useAssignmentStore((s) => s.updateAssignment);
  const joinedRoom = useRef(false);

  const joinRoom = useCallback((socket: ReturnType<typeof getSocket>, id: string) => {
    if (!joinedRoom.current) {
      socket.emit('join:assignment', id);
      joinedRoom.current = true;
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setConnected(true);
      if (assignmentId) joinRoom(socket, assignmentId);
    };

    const onDisconnect = () => setConnected(false);

    const onProgress = (data: JobProgressEvent) => {
      if (!assignmentId || data.assignmentId === assignmentId) {
        setProgress(data.progress);
        setProgressMessage(data.message);
        updateAssignment(data.assignmentId, { status: 'processing' });
      }
    };

    const onComplete = (data: JobCompleteEvent) => {
      if (!assignmentId || data.assignmentId === assignmentId) {
        setProgress(100);
        setProgressMessage('Question paper ready!');
        updateAssignment(data.assignmentId, {
          status: 'completed',
          questionPaper: data.questionPaper,
        });
        toast.success('Question paper generated!', { duration: 4000 });
      }
    };

    const onError = (data: JobErrorEvent) => {
      if (!assignmentId || data.assignmentId === assignmentId) {
        updateAssignment(data.assignmentId, { status: 'failed' });
        toast.error(`Generation failed: ${data.error}`, { duration: 5000 });
      }
    };

    const onAssignmentUpdated = (data: { assignmentId: string; status: string }) => {
      updateAssignment(data.assignmentId, { status: data.status as 'completed' | 'failed' });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('job:progress', onProgress);
    socket.on('job:complete', onComplete);
    socket.on('job:error', onError);
    socket.on('assignment:updated', onAssignmentUpdated);

    if (socket.connected) {
      setConnected(true);
      if (assignmentId) joinRoom(socket, assignmentId);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('job:progress', onProgress);
      socket.off('job:complete', onComplete);
      socket.off('job:error', onError);
      socket.off('assignment:updated', onAssignmentUpdated);
      joinedRoom.current = false;
    };
  }, [assignmentId, updateAssignment, joinRoom]);

  return { connected, progress, progressMessage };
}
