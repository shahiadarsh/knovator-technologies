import cron from 'node-cron';
import { ImportService } from './services/importService';

const FEED_URLS = [
    'https://jobicy.com/?feed=job_feed',
    'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
    'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
    'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
    'https://jobicy.com/?feed=job_feed&job_categories=data-science',
    'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
    'https://jobicy.com/?feed=job_feed&job_categories=business',
    'https://jobicy.com/?feed=job_feed&job_categories=management',
    'https://www.higheredjobs.com/rss/articleFeed.cfm',
];

export const initCronJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running scheduled Job Imports...');
        for (const url of FEED_URLS) {
            try {
                await ImportService.runImport(url);
            } catch (err) {
                console.error(`Cron failed for ${url}`);
            }
        }
    });

    console.log('✅ Cron Jobs Scheduled (Hourly)');
};
