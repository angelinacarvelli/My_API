const { getRedisClient } = require('./redis');
// j'ai mis RedisClient a la place de client car comme sa si la connexion est perdue, on peut se reconnecter sans avoir a relancer le serveur ou que sa crash
// si on perd le client 
async function getCache(key) {
    try {
        const client = await getRedisClient();
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.error('Erreur cache (lecture) :', err.message);
        return null;
    }
}

async function setCache(key, data, seconds = 60) {
    try {
        const client = await getRedisClient();
        await client.set(key, JSON.stringify(data), { EX: seconds });
    } catch (err) {
        console.error('Erreur cache (écriture) :', err.message);
    }
}

async function clearPlatsCache() {
    try {
        const client = await getRedisClient();
        if (!client.isOpen) return;
        for await (const key of client.scanIterator({ MATCH: 'plats:*' })) {
            await client.del(key);
        }
    } catch (err) {
        console.error('Erreur cache (invalidation) :', err.message);
    }
}

module.exports = { getCache, setCache, clearPlatsCache };