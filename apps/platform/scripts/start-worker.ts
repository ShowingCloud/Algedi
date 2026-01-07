#!/usr/bin/env node

/**
 * Worker Startup Script
 * Runs the AI Editor worker in a separate process
 * 
 * Usage: npm run worker
 * Or: node scripts/start-worker.js
 */

import { createAIWorker } from '@repo/ai-editor/worker';
import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('🚀 Starting AI Editor Worker...');
console.log(`📡 Redis URL: ${redisUrl.replace(/:[^:@]+@/, ':****@')}`); // Hide password

// Create Redis connection
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Create and start the worker
const worker = createAIWorker({ connection } as any);

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down worker gracefully...`);
  
  try {
    await worker.close();
    await connection.quit();
    console.log('✅ Worker shut down successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

console.log('✅ Worker started and ready to process jobs');
console.log('Press Ctrl+C to stop\n');

