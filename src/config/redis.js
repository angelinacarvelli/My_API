require('dotenv').config();
const { createClient } = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_URL = process.env.REDIS_URL || `redis://${REDIS_HOST}:${REDIS_PORT}`;

const client = createClient({ url: REDIS_URL });

client.on('error', (err) => console.error('Redis Error:', err));

async function getRedisClient() {
    if (!client.isOpen) {
        await client.connect();
    }
    return client;
}

module.exports = { client, getRedisClient };