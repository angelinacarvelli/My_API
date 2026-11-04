const express = require('express');
const router = express.Router();

const { getAllPlats, getPlatById, getPlatBySlug, createPlat, updatePlat, deletePlat } = require('../services/plats.service.js');
const auth = require('../middleware/auth.js');

router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 20);
        const search = req.query.search || '';
        const key = `plats:list:page=${page}:limit=${limit}:search=${search}`;

        const cached = await getCache(key);
        if (cached) {
            console.log('CACHE HIT', key);
            return res.json(cached);
        }
        console.log('CACHE MISS', key);
        const result = await getAllPlats(page, search || null, limit);
        await setCache(key, result, 60);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.get('/slug/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const key = `plats:slug:${slug}`;

        const cached = await getCache(key);
        if (cached) {
            console.log('CACHE HIT', key);
            return res.json(cached);
        }
        console.log('CACHE MISS', key);

        const plat = await getPlatBySlug(slug);
        if (!plat) return res.status(404).json({ error: 'Plat non trouvé' });

        await setCache(key, plat, 60);
        res.json(plat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const key = `plats:id:${id}`;

        const cached = await getCache(key);
        if (cached) {
            console.log('CACHE HIT', key);
            return res.json(cached);
        }
        console.log('CACHE MISS', key);

        const plat = await getPlatById(id);
        if (!plat) return res.status(404).json({ error: 'Plat non trouvé' });

        await setCache(key, plat, 60);
        res.json(plat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', auth, async (req, res) => {
    try {
        const newPlat = await createPlat(req.body);
        await clearPlatsCache();
        res.status(201).json(newPlat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const updatedPlat = await updatePlat(req.params.id, req.body);
        await clearPlatsCache();
        if (!updatedPlat) return res.status(404).json({ error: 'Plat non trouvé' });
        res.json(updatedPlat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedPlat = await deletePlat(req.params.id);
        await clearPlatsCache();
        if (!deletedPlat) return res.status(404).json({ error: 'Plat non trouvé' });
        res.json({ message: 'Plat supprimé avec succès', deletedPlat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;