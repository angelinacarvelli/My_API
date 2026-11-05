require('dotenv').config();
const { createClient } = require('redis');

describe('Redis Connection Test', () => {
    let client;

    beforeAll(async () => {
    const redisUrl =
        process.env.REDIS_URL || 'redis://localhost:6379';

        client = createClient({ url: redisUrl });

        client.on('error', (err) => {
            console.error('Erreur Redis :', err);
        });

        await client.connect();
        console.log('Connexion à Redis réussie !');
    });

    afterAll(async () => {
        if (client && client.isOpen) {
            await client.disconnect();
        }
    });

    it('should set and get a value in Redis', async () => {
        await client.set('test_key', 'Redis fonctionne !', {
            EX: 10
        });

        const value = await client.get('test_key');

        expect(value).toBe('Redis fonctionne !');
    });
});
