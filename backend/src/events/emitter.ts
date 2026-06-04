import { EventEmitter } from 'events';

class JobEmitter extends EventEmitter {}

export const jobEmitter = new JobEmitter();

export const JOB_EVENTS = {
  PROGRESS: 'job:progress',
  COMPLETE: 'job:complete',
  ERROR: 'job:error',
} as const;
