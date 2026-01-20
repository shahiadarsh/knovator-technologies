import { Worker, Job as BullJob } from 'bullmq';
import { connection } from '../configs/redis';
import Job from '../models/Job';
import { JOB_QUEUE_NAME } from '../queues/jobQueue';

export const jobWorker = new Worker(
    JOB_QUEUE_NAME,
    async (bullJob: BullJob) => {
        const { jobData, sourceFeed } = bullJob.data;

        try {
            // Helper to extract string content even if nested in objects (like <p> tags)
            const extractContent = (data: any): string => {
                if (!data) return '';
                if (typeof data === 'string') return data;
                if (Array.isArray(data)) return extractContent(data[0]);
                if (typeof data === 'object') {
                    // xml2js might put content in _ or in nested tags like p
                    return extractContent(data._ || data.p || Object.values(data)[0]);
                }
                return String(data);
            };

            const jobId = jobData.link?.[0] || jobData.guid?.[0]?._ || jobData.guid?.[0];

            if (!jobId) {
                throw new Error('No unique identifier (link/guid) found for job');
            }

            await Job.findOneAndUpdate(
                { jobId },
                {
                    title: extractContent(jobData.title),
                    company: extractContent(jobData.company_name) || 'N/A',
                    location: extractContent(jobData.location) || 'Remote',
                    description: extractContent(jobData.description),
                    category: extractContent(jobData.job_categories),
                    type: extractContent(jobData.job_types),
                    link: jobId,
                    pubDate: jobData.pubDate?.[0] ? new Date(jobData.pubDate[0]) : new Date(),
                    sourceFeed,
                },
                { upsert: true, new: true }
            );

            return { success: true, jobId };
        } catch (error: any) {
            console.error(`Worker error for job ${bullJob.id}:`, error.message);
            throw error;
        }
    },
    {
        connection: connection as any,
        concurrency: 10, // Adjust based on DB performance
    }
);

jobWorker.on('completed', (job: BullJob) => {
    // Optional: Log completion
});

jobWorker.on('failed', (job: BullJob | undefined, err: Error) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
});
