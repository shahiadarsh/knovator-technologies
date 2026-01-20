# ⚡ JobSync: High-Performance Job Pipeline

JobSync is a state-of-the-art, scalable job import system. It automates the process of fetching, cleaning, and synchronizing job data from multiple XML/RSS sources into a unified MongoDB database. It features a premium, real-time monitoring dashboard for system health and data auditing.

---

## � Key Features

- **🚀 Concurrent Processing**: Powered by BullMQ and Redis for non-blocking background imports.
- **🛠️ Self-Healing Parser**: Automatically escapes malformed XML (e.g., raw ampersands) to prevent pipeline crashes.
- **⚛️ Atomic Upserts**: Ensures zero duplicate records by updating existing jobs or creating new ones in a single DB operation.
- **🔍 Advanced Search**: Full-text search capability across titles, companies, and descriptions.
- **📱 Premium Admin UI**: A responsive, dark-themed dashboard built with Next.js 14 and Framer Motion.
- **🕒 Automated Scheduling**: Built-in cron system for hourly hands-free synchronization.

---

## 🏗️ Technical Architecture

### 1. Ingestion (The Producer)
The system fetches XML feeds using `axios` with a custom "XML Healer" layer. This layer pre-processes raw strings to fix common formatting errors before they reach the parser.

### 2. Messaging Queue (The Broker)
We use **BullMQ** to manage a distributed task queue. This allows the system to handle thousands of jobs without stalling the main API thread. If a database operation fails, the queue automatically retries with **Exponential Backoff**.

### 3. Worker (The Consumer)
A dedicated worker process consumes jobs from Redis. Each job is processed individually using an **Atomic Upsert** strategy in MongoDB, ensuring high data integrity.

### 4. API & UI (The Dashboard)
An Express.js REST API serves as the bridge between the database and the Next.js frontend, providing real-time telemetry on sync status, fetched items, and failure rates.

---

## � Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Cloud)
- [Redis](https://redis.io/) (Local or Cloud)

### 1. Setup the Server
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/job-importer
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
```
Run the server: `npm run dev`

### 2. Setup the Client
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | System health check. |
| `/api/import-history` | `GET` | Returns last 50 sync events. |
| `/api/jobs` | `GET` | Paginated jobs list with `search` and `feed` filters. |
| `/api/sync-now` | `POST` | Triggers an immediate manual sync. |

---

## � Project Structure

```text
/
├── client/                 # Next.js Frontend
│   ├── src/app/            # App Router pages (Dashboard & Jobs List)
│   ├── public/             # Static assets
│   └── tailwind.config.js  # Premium styling configuration
├── server/                 # Express Backend
│   ├── src/configs/        # Redis & DB configurations
│   ├── src/models/         # Mongoose Schemas (Job & ImportLog)
│   ├── src/queues/         # BullMQ Setup
│   ├── src/services/       # Feed Fetching & Sync Logic
│   └── src/workers/        # Background Job Processor
└── README.md
```

---

## 🔧 Troubleshooting (Windows Specific)

- **Redis `ECONNREFUSED`**: On Windows, always use `127.0.0.1` instead of `localhost` in your `.env` to avoid IPv6 resolution issues.
- **CSS Styles Not Showing**: Clear the Next.js cache using PowerShell:
  `Remove-Item -Recurse -Force .next`
- **Port 5000 in Use**: If the server fails to start, kill the existing process:
  `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force`

---

## � Assignment Requirements Met
- [x] Multi-source XML Parsing with Error Handling.
- [x] Redis + BullMQ Background Queueing.
- [x] Atomic MongoDB Upsert Logic.
- [x] Real-time Sync Telemetry Dashboard.
- [x] Fully Responsive Paginated Job Search Interface.
