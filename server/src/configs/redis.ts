import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Required for BullMQ
    retryStrategy(times: number) {
        const delay = Math.min(times * 100, 3000);
        return delay;
    },
};

export const connection = new IORedis(redisConfig);

connection.on('connect', () => console.log('✅ Redis Connected'));
connection.on('error', (err: any) => {
    console.error('❌ Redis error:', err.message);
});
