const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findUserByUsername, validatePassword } = require('../services/users_service');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'v123456789AZERTY';

const REDIRECT_URI = process.env.CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

router.get('/google', (req, res) => {
    console.log("CLIENT ID UTILISÉ :", process.env.GOOGLE_CLIENT_ID);
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    const options = {
        redirect_uri: REDIRECT_URI, // Modifié ici
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options).toString();
    res.redirect(`${rootUrl}?${qs}`);
});

router.get('/google/callback', async (req, res, next) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Code d\'autorisation manquant');
    }

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI, // Modifié ici
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
            return res.status(401).json({ message: 'Échec de la récupération des jetons Google' });
        }

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const googleUser = await userResponse.json();

        let user = await findUserByUsername(googleUser.email);
        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-10);
            user = await createUser(googleUser.email, randomPassword);
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.redirect(`/catalogue.html?token=${token}`);

    } catch (error) {
        next(error);
    }
});

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