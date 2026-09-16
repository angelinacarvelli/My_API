require('dotenv').config();
const { createClient } = require('redis');

describe('Redis Connection Test', () => {
    let client;

    beforeAll(async () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        console.log(`Tentative de connexion à Redis sur : ${redisUrl}`);

        client = createClient({ url: redisUrl });
        client.on('error', (err) => console.error('Erreur Redis :', err));

        await client.connect();
        console.log(' Connexion à Redis réussie !');
    });

    afterAll(async () => {
        if (client && client.isOpen) {
            await client.disconnect();
            console.log(' Déconnexion propre de Redis.');
        }
    });

    it('should set and get a value in Redis', async () => {
        await client.set('test_key', 'Redis fonctionne correctement !', { EX: 10 });
        console.log(' Écriture de la clé "test_key" effectuée.');

        const value = await client.get('test_key');
        console.log(` Lecture de la clé "test_key" : "${value}"`);

        expect(value).toBe('Redis fonctionne correctement !');
    });
});