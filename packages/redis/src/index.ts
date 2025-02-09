import { Queue } from "bullmq";
import { Redis } from "ioredis";

export const QUEUE_KEY = "correction_queue";

export const cache = new Redis(process.env.REDIS_URL!, {
  showFriendlyErrorStack: true,
  lazyConnect: true,
  commandTimeout: 1200,
});

export interface QueueValue {
  questionId: number;
}

export const correctionQueue = new Queue<QueueValue>(QUEUE_KEY, {
  connection: cache,
});
