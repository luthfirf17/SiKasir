import Redis from 'ioredis';
import { config } from './index';

// Redis connection for session management
export const sessionRedis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: 0, // Database 0 for sessions
  lazyConnect: true,
  keyPrefix: 'kasir:session:',
});

// Redis connection for caching
export const cacheRedis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: 1, // Database 1 for caching
  lazyConnect: true,
  keyPrefix: 'kasir:cache:',
});

// Redis connection for real-time features
export const realtimeRedis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: 2, // Database 2 for real-time
  lazyConnect: true,
  keyPrefix: 'kasir:realtime:',
});

// Redis connection for queues
export const queueRedis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: 3, // Database 3 for queues
  lazyConnect: true,
  keyPrefix: 'kasir:queue:',
});

// Initialize Redis connections
export const initializeRedis = async () => {
  try {
    console.log('🔄 Connecting to Redis...');
    
    await Promise.all([
      sessionRedis.connect(),
      cacheRedis.connect(),
      realtimeRedis.connect(),
      queueRedis.connect()
    ]);

    console.log('✅ Redis connections established successfully');
    
    // Set up event listeners
    setupRedisEventListeners();
    
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};

// Setup Redis event listeners
const setupRedisEventListeners = () => {
  const connections = [
    { name: 'Session', client: sessionRedis },
    { name: 'Cache', client: cacheRedis },
    { name: 'Realtime', client: realtimeRedis },
    { name: 'Queue', client: queueRedis }
  ];

  connections.forEach(({ name, client }) => {
    client.on('connect', () => {
      console.log(`✅ Redis ${name} connected`);
    });

    client.on('ready', () => {
      console.log(`🎯 Redis ${name} ready`);
    });

    client.on('error', (error) => {
      console.error(`❌ Redis ${name} error:`, error);
    });

    client.on('close', () => {
      console.log(`🔐 Redis ${name} connection closed`);
    });

    client.on('reconnecting', () => {
      console.log(`🔄 Redis ${name} reconnecting...`);
    });
  });
};

// Redis utility functions
export class RedisService {
  // Session management
  static async setSession(sessionId: string, data: any, ttl: number = 86400) {
    return await sessionRedis.setex(sessionId, ttl, JSON.stringify(data));
  }

  static async getSession(sessionId: string) {
    const data = await sessionRedis.get(sessionId);
    return data ? JSON.parse(data) : null;
  }

  static async deleteSession(sessionId: string) {
    return await sessionRedis.del(sessionId);
  }

  // Caching
  static async setCache(key: string, data: any, ttl: number = 3600) {
    return await cacheRedis.setex(key, ttl, JSON.stringify(data));
  }

  static async getCache(key: string) {
    const data = await cacheRedis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async deleteCache(key: string) {
    return await cacheRedis.del(key);
  }

  static async deleteCachePattern(pattern: string) {
    const keys = await cacheRedis.keys(pattern);
    if (keys.length > 0) {
      return await cacheRedis.del(...keys);
    }
    return 0;
  }

  // Real-time data
  static async publishRealtime(channel: string, data: any) {
    return await realtimeRedis.publish(channel, JSON.stringify(data));
  }

  static async subscribeRealtime(channel: string, callback: (message: any) => void) {
    const subscriber = realtimeRedis.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(JSON.parse(message));
      }
    });
    return subscriber;
  }

  // Order status tracking
  static async setOrderStatus(orderId: string, status: string) {
    return await realtimeRedis.hset('orders:status', orderId, status);
  }

  static async getOrderStatus(orderId: string) {
    return await realtimeRedis.hget('orders:status', orderId);
  }

  static async getAllOrderStatuses() {
    return await realtimeRedis.hgetall('orders:status');
  }

  // Table status tracking
  static async setTableStatus(tableId: string, status: string) {
    return await realtimeRedis.hset('tables:status', tableId, status);
  }

  static async getTableStatus(tableId: string) {
    return await realtimeRedis.hget('tables:status', tableId);
  }

  static async getAllTableStatuses() {
    return await realtimeRedis.hgetall('tables:status');
  }

  // User online status
  static async setUserOnline(userId: string, socketId: string) {
    await realtimeRedis.hset('users:online', userId, socketId);
    await realtimeRedis.sadd('online:users', userId);
  }

  static async setUserOffline(userId: string) {
    await realtimeRedis.hdel('users:online', userId);
    await realtimeRedis.srem('online:users', userId);
  }

  static async getOnlineUsers() {
    return await realtimeRedis.smembers('online:users');
  }

  static async getUserSocketId(userId: string) {
    return await realtimeRedis.hget('users:online', userId);
  }

  // Queue management
  static async addToQueue(queueName: string, data: any, priority: number = 0) {
    return await queueRedis.zadd(`queue:${queueName}`, priority, JSON.stringify(data));
  }

  static async getFromQueue(queueName: string) {
    const result = await queueRedis.zpopmax(`queue:${queueName}`);
    return result.length > 0 ? JSON.parse(result[0]) : null;
  }

  static async getQueueLength(queueName: string) {
    return await queueRedis.zcard(`queue:${queueName}`);
  }

  // Rate limiting
  static async checkRateLimit(key: string, limit: number, windowSizeInSeconds: number) {
    const current = await cacheRedis.incr(key);
    if (current === 1) {
      await cacheRedis.expire(key, windowSizeInSeconds);
    }
    return current <= limit;
  }

  // Distributed lock
  static async acquireLock(lockKey: string, ttl: number = 30) {
    const result = await cacheRedis.set(lockKey, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  static async releaseLock(lockKey: string) {
    return await cacheRedis.del(lockKey);
  }

  // Metrics and counters
  static async incrementCounter(key: string, increment: number = 1) {
    return await cacheRedis.incrby(key, increment);
  }

  static async getCounter(key: string) {
    const value = await cacheRedis.get(key);
    return value ? parseInt(value) : 0;
  }

  static async setMetric(key: string, value: number, ttl: number = 3600) {
    return await cacheRedis.setex(key, ttl, value.toString());
  }

  static async getMetric(key: string) {
    const value = await cacheRedis.get(key);
    return value ? parseFloat(value) : 0;
  }
}

// Close Redis connections
export const closeRedisConnections = async () => {
  try {
    await Promise.all([
      sessionRedis.disconnect(),
      cacheRedis.disconnect(),
      realtimeRedis.disconnect(),
      queueRedis.disconnect()
    ]);
    console.log('✅ All Redis connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing Redis connections:', error);
  }
};
