import { Queue } from 'bullmq';
import { connection } from '../configs/redis';

export const JOB_QUEUE_NAME = 'job-import-queue';

export const jobQueue = new Queue(JOB_QUEUE_NAME, {
    connection: connection as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});
