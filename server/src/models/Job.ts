import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    jobId: string; // From the feed, usually URL
    title: string;
    company: string;
    location: string;
    description: string;
    category: string;
    type: string;
    link: string;
    pubDate: Date;
    sourceFeed: string;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema(
    {
        jobId: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        company: { type: String, default: 'N/A' },
        location: { type: String, default: 'Remote' },
        description: { type: String },
        category: { type: String },
        type: { type: String },
        link: { type: String, required: true },
        pubDate: { type: Date },
        sourceFeed: { type: String, required: true, index: true },
    },
    { timestamps: true }
);

// Index for faster searching and filtering
JobSchema.index({ title: 'text', company: 'text' });

// Text indexes for search
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

export default mongoose.model<IJob>('Job', JobSchema);
