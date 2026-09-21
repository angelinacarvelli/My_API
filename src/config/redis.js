require('dotenv').config();
const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const client = createClient({ url: REDIS_URL });

client.on('error', (err) => console.error('Redis Error:', err));

async function getRedisClient() {
    if (!client.isOpen) {
        await client.connect();
    }
    return client;
}

module.exports = { client, getRedisClient };