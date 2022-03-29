import Redis from 'ioredis';

const r = new Redis();

r.flushdb().then(() => r.disconnect());
