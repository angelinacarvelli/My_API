require('dotenv').config();
const { createClient } = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

const REDIS_URL = process.env.REDIS_URL ||
    `redis://${REDIS_HOST}:${REDIS_PORT}`;


const client = createClient({
    url: REDIS_URL
});

client.on('error', (err) => {
    console.error('Erreur Redis :', err);
});

// Connexin à Redis
async function getRedisClient() {
    if (!client.isOpen) {
        await client.connect();
        console.log('Connexion à Redis réussie !');
    }

    return client;
}

async function disconnectRedis() {
    if (client.isOpen) {
        await client.quit();
        console.log('Déconnexion Redis réussie.');
    }
}

module.exports = {
    client,
    getRedisClient,
    disconnectRedis
};
