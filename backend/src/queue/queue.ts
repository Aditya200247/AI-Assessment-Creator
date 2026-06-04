import { Queue, ConnectionOptions } from 'bullmq';
import { IJobData } from '../types';

export const QUEUE_NAME = 'question-generation';

function getConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTLS = url.startsWith('rediss://');
  return {
    url,
    ...(isTLS ? { tls: {} } : {}),
    enableOfflineQueue: false,
    maxRetriesPerRequest: null,
  } as ConnectionOptions;
}

let generationQueue: Queue | null = null;

export function getQueue(): Queue {
  if (generationQueue) return generationQueue;
  generationQueue = new Queue(QUEUE_NAME, {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
  return generationQueue;
}

export async function addGenerationJob(assignmentId: string): Promise<void> {
  const queue = getQueue();
  await queue.add(
    'generate',
    { assignmentId } as IJobData,
    { jobId: `gen-${assignmentId}-${Date.now()}` }
  );
  console.log(`Job queued for assignment: ${assignmentId}`);
}
