Lien de l'Application en Ligne
URL de l'API / Page d'accueil : http://recettedumonde.webhop.me:3000/Home_page.html
Documentation Postman : https://documenter.getpostman.com/view/58397556/2sBYB2rSqR

Stack Technique
Backend : Node.js, Express.js
Base de Données / Stockage : JSON (plats.json)
Cache : Redis (gestion du cache des requêtes GET et invalidation lors des modifications)
Sécurité & Authentification : JWT (JSON Web Tokens) & OAuth 2.0
Documentation : Swagger UI & Postman
Tests : Jest
DevOps / Cloud : Docker, AWS EC2

Fonctionnalités Principales
Routes Publiques (GET) :
accees libre au recette et catalogue de recette
Recherche par ID ou par Slug.
Routes Protégées (POST, PUT, DELETE) :
Réservées aux utilisateurs authentifiés via un token JWT valide.
Ajout, modification et suppression de recettes.
Mise en Cache (Redis) :
Optimisation des performances des requêtes GET paginées grâce à un stockage en mémoire Redis avec invalidation automatique en cas de mise à jour des données.

Documentation :
Interface Swagger intégrée et Postman complet.
Endpoints de l'API

Routes Publiques
GET /api/plats : Récupère la liste des plats (paramètre ?page=n disponible, max 20 par page).
GET /api/plats/:id : Récupère un plat spécifique par son identifiant.
GET /api/plats/slug/:slug : Récupère un plat via son slug textuel.

Routes Protégées
POST /api/plats : Crée une nouvelle recette.
PUT /api/plats/:id : Met à jour une recette existante.
DELETE /api/plats/:id : Supprime une recette.

Authentification
POST /api/auth/register : Inscription d'un nouvel administrateur.
POST /api/auth/login : Connexion et génération du token JWT.

Lancement Local avec Docker
Pour lancer le projet en local sur votre machine :

# 1. Cloner le projet
git clone git@github.com:angelinacarvelli/My_API.git

# 2. Lancer l'application et Redis via Docker Compose
docker-compose up --build
L'application sera accessible sur http://localhost:3000.

Tests Automatisés
Pour exécuter la suite de tests (Jest) :

Bash
npm test