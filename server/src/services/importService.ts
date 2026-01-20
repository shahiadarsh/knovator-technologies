import { jobQueue } from '../queues/jobQueue';
import { FeedService } from './feedService';
import ImportLog from '../models/ImportLog';
import Job from '../models/Job';

export class ImportService {
    static async runImport(url: string) {
        console.log(`🚀 Starting import for: ${url}`);
        const timestamp = new Date();

        try {
            const feedItems = await FeedService.fetchAndParse(url);
            const totalFetched = feedItems.length;

            // Create initial log entry
            const log = new ImportLog({
                feedUrl: url,
                timestamp,
                totalFetched,
            });
            await log.save();

            let newJobs = 0;
            let updatedJobs = 0;
            let failedJobs = 0;

            // To handle "1 million" records efficiently, we should batch these
            // For this assignment, we'll queue each item
            for (const item of feedItems) {
                const jobId = item.link?.[0] || item.guid?.[0]?._ || item.guid?.[0];

                if (!jobId) {
                    failedJobs++;
                    log.syncErrors.push({ reason: 'Missing jobId' });
                    continue;
                }

                // Check if job exists to track New vs Updated
                const existingJob = await Job.findOne({ jobId }).select('_id');
                if (existingJob) {
                    updatedJobs++;
                } else {
                    newJobs++;
                }

                // Push to BullMQ for background processing
                await jobQueue.add('import-item', {
                    jobData: item,
                    sourceFeed: url,
                });
            }

            // Update log with final counts
            log.totalImported = newJobs + updatedJobs;
            log.newJobs = newJobs;
            log.updatedJobs = updatedJobs;
            log.failedJobs = failedJobs;
            await log.save();

            return log;
        } catch (error: any) {
            console.error(`Import failed for ${url}:`, error.message);
            throw error;
        }
    }
}
