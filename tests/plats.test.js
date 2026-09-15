const request = require('supertest');
const app = require('../src/index');

describe('Tests Auth + CRUD Plats', () => {
    let token = '';
    const testUser = { username: `user_${Date.now()}`, password: 'password123' };
    let createdPlatId = null;

    test('1. Inscription utilisateur', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toEqual(201);
    });

    test('2. Connexion et récupération du Token JWT', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send(testUser);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    test('3. GET /api/plats sans être connecté (Doit réussir)', async () => {
        const res = await request(app).get('/api/plats?page=1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
    });

    test('4. POST /api/plats sans Token (Doit échouer - 401)', async () => {
        const res = await request(app)
            .post('/api/plats')
            .send({ nom: 'Plat Interdit', pays: 'France', ingredients: ['Sel'] });
        expect(res.statusCode).toEqual(401);
    });

    test('5. POST /api/plats avec Token (Doit réussir - 201)', async () => {
        const res = await request(app)
            .post('/api/plats')
            .set('Authorization', `Bearer ${token}`)
            .send({ nom: 'Plat de Test', pays: 'France', ingredients: ['Ingrédient 1'] });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        createdPlatId = res.body.id;
    });

    test('6. DELETE /api/plats/:id avec Token (Doit réussir - 200)', async () => {
        if (!createdPlatId) return;
        const res = await request(app)
            .delete(`/api/plats/${createdPlatId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});