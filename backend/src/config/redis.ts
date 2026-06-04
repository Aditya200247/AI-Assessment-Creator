import IORedis from 'ioredis';

let redisClient: IORedis | null = null;

export function getRedis(): IORedis {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTLS = redisUrl.startsWith('rediss://');

  redisClient = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(isTLS ? { tls: {} } : {}),
  });

  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.on('error', (err) => console.error('Redis error:', err));

  return redisClient;
}

export { redisClient };
