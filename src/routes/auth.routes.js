const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findUserByUsername, validatePassword } = require('../services/users_service');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'v123456789AZERTY';

// Inscription
router.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ error: 'Champs username et password requis' });
        }

        const newUser = await createUser(username, password);
        return res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
    } catch (error) {
        if (error.message.includes('déjà utilisé')) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

// Connexion
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Champs username et password requis.' });
        }

        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const isMatch = await validatePassword(user, password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ token, message: 'Connexion réussie' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;