import { Worker, Job, ConnectionOptions } from 'bullmq';
import { Assignment } from './models/Assignment';
import { QuestionPaper } from './models/QuestionPaper';
import { generateQuestionPaper } from './services/llm.service';
import { jobEmitter, JOB_EVENTS } from './events/emitter';
import { IJobData } from './types';
import { connectDB } from './config/db';
import { QUEUE_NAME } from './queue/queue';

async function processJob(job: Job<IJobData>): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`Processing job for assignment: ${assignmentId}`);

  jobEmitter.emit(JOB_EVENTS.PROGRESS, {
    assignmentId,
    progress: 10,
    message: 'Starting AI generation...',
  });

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  assignment.status = 'processing';
  await assignment.save();

  jobEmitter.emit(JOB_EVENTS.PROGRESS, {
    assignmentId,
    progress: 30,
    message: 'Building prompt and calling AI...',
  });

  const paperData = await generateQuestionPaper(assignment);

  jobEmitter.emit(JOB_EVENTS.PROGRESS, {
    assignmentId,
    progress: 75,
    message: 'AI generation complete. Saving results...',
  });

  const questionPaper = await QuestionPaper.findOneAndUpdate(
    { assignmentId: assignment._id },
    {
      assignmentId: assignment._id,
      sections: paperData.sections,
      generatedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  assignment.status = 'completed';
  await assignment.save();

  jobEmitter.emit(JOB_EVENTS.PROGRESS, {
    assignmentId,
    progress: 100,
    message: 'Done!',
  });

  jobEmitter.emit(JOB_EVENTS.COMPLETE, {
    assignmentId,
    questionPaper: questionPaper.toObject(),
  });

  console.log(`Job complete for assignment: ${assignmentId}`);
}

function getBullConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTLS = url.startsWith('rediss://');
  return {
    url,
    ...(isTLS ? { tls: {} } : {}),
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  } as ConnectionOptions;
}

export function startWorker(): Worker<IJobData> {
  const worker = new Worker<IJobData>(QUEUE_NAME, processJob, {
    connection: getBullConnection(),
    concurrency: 2,
  });

  worker.on('completed', (job) => {
    console.log(`Worker: job ${job.id} completed`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`Worker: job ${job?.id} failed:`, err.message);
    if (job?.data?.assignmentId) {
      try {
        await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
        jobEmitter.emit(JOB_EVENTS.ERROR, {
          assignmentId: job.data.assignmentId,
          error: err.message,
        });
      } catch (updateErr) {
        console.error('Failed to update assignment status:', updateErr);
      }
    }
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  console.log('BullMQ Worker started');
  return worker;
}

// only needed when running worker as a standalone process
if (require.main === module) {
  (async () => {
    await connectDB();
    startWorker();
  })();
}
