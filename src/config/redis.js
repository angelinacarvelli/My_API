require('dotenv').config();
const { createClient } = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_URL = process.env.REDIS_URL || `redis://${REDIS_HOST}:${REDIS_PORT}`;
console.log(`Tentative de connexion à Redis sur : ${REDIS_URL}`);

const client = createClient({ url: REDIS_URL });

client.on('error', (err) => console.error('Erreur Redis :', err));

async function getRedisClient() {
    if (!client.isOpen) {
        await client.connect();
    }
    return client;
}

module.exports = { client, getRedisClient };