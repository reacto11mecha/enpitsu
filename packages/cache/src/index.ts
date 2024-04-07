import { Redis } from "ioredis";

export const cache = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  commandTimeout: 1200,
});
