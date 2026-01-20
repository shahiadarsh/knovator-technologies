# Architecture Design: Scalable Job Importer

## System Components

### 1. Ingestion Layer (Producer)
- **FeedService**: Uses `axios` and `xml2js` to fetch and parse external RSS feeds.
- **ImportService**: Orchestrates the import by creating a log entry and adding jobs to the queue.

### 2. Messaging Layer (Queue)
- **BullMQ**: Backed by **Redis**, it stores pending job imports. This ensures that even if the server crashes, No data is lost.
- **Retry Logic**: Exponential backoff is configured for failed jobs (e.g., if a DB connection is lost temporarily).

### 3. Processing Layer (Worker)
- **JobWorker**: A dedicated process that consumes the `job-import-queue`.
- **Atomic Upserts**: To handle 1 million+ records safely, it uses:
  ```javascript
  Job.findOneAndUpdate({ jobId }, { ...data }, { upsert: true })
  ```
  This prevents race conditions and ensures "Job Created" vs "Job Updated" status is accurately tracked.

### 4. UI/Monitoring Layer
- **Next.js Dashboard**: Fetches data from `ImportLog` collection.
- **Polling**: Real-time status updates via 10s interval polling (SSE/Socket.io can be added for even tighter integration).

## Data Schema Design
- **Job Collection**: Indexed on `jobId` and `sourceFeed`. Text indexes on `title` and `company` for basic search capability.
- **ImportLog Collection**: Tracks time, success/fail counts, and specific error messages.

## Scalability Considerations
- **Concurrency**: The worker can be scaled up by changing the `concurrency` parameter in `jobWorker.ts`.
- **Memory**: For extremely large files (GBs), the `FeedService` can be refactored to use a streaming XML parser (like `sax`) instead of `xml2js` to avoid loading the entire file into memory.
