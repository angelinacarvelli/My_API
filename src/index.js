require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const { getRedisClient } = require('./config/redis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'GUI')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../GUI/Home_page.html'));
});

app.get('/recette/:nom', (req, res) => {
    res.sendFile(path.join(__dirname, '../GUI/recette.html'));
});

const loadRouter = (names) => {
    for (const name of names) {
        try {
            const router = require(name);
            return router.default || router;
        } catch (error) {
            if (error.code !== 'MODULE_NOT_FOUND' || !error.message.includes(name)) {
                throw error;
            }
        }
    }
    return null;
};

const authRouter = loadRouter(['./routes/auth.routes', './routes/auth']);
const platsRouter = loadRouter(['./routes/plats.routes', './routes/plats']);

if (authRouter) app.use('/api/auth', authRouter);
if (platsRouter) app.use('/api/plats', platsRouter);

const swaggerDocument = {
    openapi: '3.0.0',
    info: { 
      title: 'API Cuisine du Monde', 
      version: '1.0.0',
      description: 'API REST pour la gestion de recettes de cuisine (+1000 entrées) avec pagination, cache Redis, authentification JWT/OAuth2.'
    },
    servers: [
      {
        url: 'http://recettedumonde.webhop.me:3000',
        description: 'Serveur de Production (AWS EC2)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Serveur Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Saisissez votre token sous la forme : Bearer <votre_token>',
        },
      },
    },
    paths: {
      '/api/plats': {
        get: {
          tags: ['Plats'],
          summary: 'Récupérer la liste des plats (Public - Pagination)',
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Numéro de la page (max 20 plats par page)',
            },
          ],
          responses: {
            200: { description: 'Liste des plats récupérée avec succès' },
          },
        },
        post: {
          tags: ['Plats'],
          summary: 'Ajouter un nouveau plat (Protégé par Token)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nom', 'pays', 'ingredients'],
                  properties: {
                    nom: { type: 'string', example: 'Ratatouille' },
                    pays: { type: 'string', example: 'France' },
                    ingredients: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['aubergine', 'courgette', 'tomate', 'poivron'],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Plat créé avec succès' },
            401: { description: 'Non autorisé - Token manquant ou invalide' },
          },
        },
      },
      '/api/plats/slug/{slug}': {
        get: {
          tags: ['Plats'],
          summary: 'Obtenir un plat via son slug (Public)',
          parameters: [
            {
              in: 'path',
              name: 'slug',
              required: true,
              schema: { type: 'string' },
              description: 'Exemple: pizza-margherita',
            },
          ],
          responses: {
            200: { description: 'Détails du plat' },
            404: { description: 'Plat non trouvé' },
          },
        },
      },
      '/api/plats/{id}': {
        put: {
          tags: ['Plats'],
          summary: 'Modifier un plat (Protégé par Token)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'Identifiant unique du plat',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nom: { type: 'string' },
                    pays: { type: 'string' },
                    ingredients: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Plat mis à jour avec succès' },
            401: { description: 'Non autorisé' },
            404: { description: 'Plat non trouvé' },
          },
        },
        delete: {
          tags: ['Plats'],
          summary: 'Supprimer un plat (Protégé par Token)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: { description: 'Plat supprimé avec succès' },
            401: { description: 'Non autorisé' },
            404: { description: 'Plat non trouvé' },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Authentification'],
          summary: 'Inscription d\'un nouvel utilisateur',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'motdepasse123' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Utilisateur créé avec succès' },
            400: { description: 'Requête invalide' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentification'],
          summary: 'Connexion utilisateur et récupération du token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'motdepasse123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Connexion réussie, renvoie le token' },
            401: { description: 'Identifiants incorrects' },
          },
        },
      },
    },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const start = async () => {
    try {
        const redisClient = await getRedisClient();
        if (redisClient) {
            app.locals.redis = redisClient;
            console.log('Connecté à Redis avec succès !');
        }

        app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
    } catch (error) {
        console.error('Erreur démarrage serveur:', error);
        process.exitCode = 1;
    }
};

if (require.main === module) {
    start();
}

module.exports = app;