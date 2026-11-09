const express = require('express');
const router = express.Router();

const { getCache, setCache, clearPlatsCache } = require('../config/cache.js');

const { getAllPlats, getPlatById, getPlatBySlug, createPlat, updatePlat, deletePlat } = require('../services/plats.service.js');
const auth = require('../middleware/auth.js');

function validatePlat(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: 'Le corps de la requête (body) est vide ou n\'est pas au format JSON.' 
    });
  }

  const nom = req.body.nom || req.body.title || req.body.name;
  if (typeof nom !== 'string' || nom.trim() === '') {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: 'Le champ "nom" est obligatoire et doit être un texte non vide.' 
    });
  }

  const pays = req.body.pays || req.body.country || req.body.origine;
  if (typeof pays !== 'string' || pays.trim() === '') {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: 'Le champ "pays" est obligatoire et doit être un texte non vide.' 
    });
  }

  let ingredients = req.body.ingredients;
  if (typeof ingredients === 'string') {
    ingredients = ingredients.includes('\n')
      ? ingredients.split('\n').map(i => i.trim()).filter(Boolean)
      : ingredients.split(',').map(i => i.trim()).filter(Boolean);
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ 
      error: 'Données invalides', 
      details: 'Le champ "ingredients" est obligatoire et doit contenir au moins un ingrédient (ex: ["tomate", "sel"]).' 
    });
  }

  req.body.nom = nom.trim();
  req.body.pays = pays.trim();
  req.body.ingredients = ingredients;
  next();
}

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
            console.error('ERREUR ROUTE / :', err);
            res.status(500).json({ error: 'Erreur serveur', details: err.message });
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
router.post('/', auth, validatePlat, async (req, res) => {
    try {
        const newPlat = await createPlat(req.body);
        await clearPlatsCache();
        res.status(201).json(newPlat);
    } catch (err) {
        console.error('Erreur POST /plats :', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const updatedPlat = await updatePlat(req.params.id, req.body);
        await clearPlatsCache();
        if (!updatedPlat) return res.status(404).json({ error: 'Plat non trouvé' });
        res.json(updatedPlat);
    } catch (err) {
        console.error('Erreur PUT /plats :', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
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