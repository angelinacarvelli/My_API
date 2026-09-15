const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    getAllPlats,
    getPlatById,
    getPlatBySlug,
    createPlat,
    updatePlat,
    deletePlat
} = require('../services/plats.service');

const router = express.Router();

// GET public (Accessibles sans être connecté)
router.get('/', async (req, res, next) => {
    try {
        let page = Number(req.query.page) || 1;
        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({ message: "La page doit être un entier supérieur ou égal à 1" });
        }

        // Utilisation du cache Redis si disponible
        const redis = req.app.locals.redis;
        const cacheKey = `plats:page:${page}`;
        if (redis) {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }
        }

        const result = await getAllPlats(page);

        if (redis) {
            await redis.set(cacheKey, JSON.stringify(result), { EX: 60 }); // Cache 60 sec
        }

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/slug/:slug', async (req, res, next) => {
    try {
        const plat = await getPlatBySlug(req.params.slug);
        if (!plat) return res.status(404).json({ message: 'Plat non trouvé' });
        return res.status(200).json(plat);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const plat = await getPlatById(req.params.id);
        if (!plat) return res.status(404).json({ message: 'Plat non trouvé' });
        return res.status(200).json(plat);
    } catch (error) {
        next(error);
    }
});

// --- ROUTES PROTÉGÉES (Nécessitent un token Bearer JWT) ---

router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { nom } = req.body;
        if (!nom) return res.status(400).json({ message: "Le champ 'nom' est obligatoire." });

        const newPlat = await createPlat(req.body);

        // Invalidation du cache
        if (req.app.locals.redis) {
            const keys = await req.app.locals.redis.keys('plats:page:*');
            if (keys.length) await req.app.locals.redis.del(keys);
        }

        return res.status(201).json(newPlat);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const updated = await updatePlat(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Plat non trouvé' });

        if (req.app.locals.redis) {
            const keys = await req.app.locals.redis.keys('plats:page:*');
            if (keys.length) await req.app.locals.redis.del(keys);
        }

        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const deleted = await deletePlat(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Plat non trouvé' });

        if (req.app.locals.redis) {
            const keys = await req.app.locals.redis.keys('plats:page:*');
            if (keys.length) await req.app.locals.redis.del(keys);
        }

        return res.status(200).json({ message: 'Plat supprimé avec succès' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;