import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { initCronJobs } from './cron';
import './workers/jobWorker'; // Initialize worker
import ImportLog from './models/ImportLog';
import Job from './models/Job';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const allowedOrigins = [
    'http://localhost:3000',
    'https://knovator-technologies.vercel.app',
    'https://knovator-technologies-i6df.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback to true for now to avoid breaking things, but allowing specific list
        }
    },
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'UP', message: 'Scalable Job Importer API is running' });
});

app.get('/api/import-history', async (req, res) => {
    try {
        const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.get('/api/jobs', async (req, res) => {
    try {
        const { sourceFeed, page = 1, limit = 10, search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query: any = {};
        if (sourceFeed) query.sourceFeed = String(sourceFeed);
        if (search) {
            query.$text = { $search: String(search) };
        }

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .sort(search ? { score: { $meta: 'textScore' } } : { pubDate: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Job.countDocuments(query)
        ]);

        res.json({
            jobs,
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.post('/api/sync-now', async (req, res) => {
    try {
        const FEED_URLS = [
            'https://jobicy.com/?feed=job_feed',
            'https://www.higheredjobs.com/rss/articleFeed.cfm',
        ];

        // For demo, we just trigger a few
        const { ImportService } = await import('./services/importService');
        for (const url of FEED_URLS) {
            ImportService.runImport(url); // Run in background
        }

        res.json({ message: 'Sync started in background' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start sync' });
    }
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-importer';
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        initCronJobs();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('API is running but Database-dependent features will fail.');
    });

// Start Server (only if not running on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

export default app;
