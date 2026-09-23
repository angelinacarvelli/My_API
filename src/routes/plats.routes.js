const express = require('express');
const router = express.Router();
const { getAllPlats, getPlatById, getPlatBySlug, createPlat, updatePlat, deletePlat } = require('../services/plats.service.js');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const search = req.query.search || null;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

        const result = await getAllPlats(page, search, limit);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/slug/:slug', async (req, res) => {
    try {
        const plat = await getPlatBySlug(req.params.slug);
        if (!plat) return res.status(404).json({ error: 'Plat non trouvé' });
        res.json(plat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const plat = await getPlatById(req.params.id);
        if (!plat) return res.status(404).json({ error: 'Plat non trouvé' });
        res.json(plat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newPlat = await createPlat(req.body);
        res.status(201).json(newPlat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedPlat = await updatePlat(req.params.id, req.body);
        if (!updatedPlat) return res.status(404).json({ error: 'Plat non trouvé' });
        res.json(updatedPlat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedPlat = await deletePlat(req.params.id);
        if (!deletedPlat) return res.status(404).json({ error: 'Plat non trouvé' });
        res.json({ message: 'Plat supprimé avec succès', deletedPlat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;