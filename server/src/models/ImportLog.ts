import mongoose, { Schema, Document } from 'mongoose';

export interface IImportLog extends Document {
    feedUrl: string;
    timestamp: Date;
    totalFetched: number;
    totalImported: number;
    newJobs: number;
    updatedJobs: number;
    failedJobs: number;
    syncErrors: Array<{
        jobId?: string;
        reason: string;
    }>;
}

const ImportLogSchema: Schema = new Schema(
    {
        feedUrl: { type: String, required: true, index: true },
        timestamp: { type: Date, default: Date.now },
        totalFetched: { type: Number, default: 0 },
        totalImported: { type: Number, default: 0 },
        newJobs: { type: Number, default: 0 },
        updatedJobs: { type: Number, default: 0 },
        failedJobs: { type: Number, default: 0 },
        syncErrors: [
            {
                jobId: String,
                reason: String,
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IImportLog>('ImportLog', ImportLogSchema);
