    require('dotenv').config();

    const express = require('express');
    const swaggerUi = require('swagger-ui-express');

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

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

    // const authRouter = loadRouter(['./routes/auth', './routes/authRoutes', './routes/auth.routes']);
    const platsRouter = loadRouter(['./routes/plats', './routes/platsRoutes', './routes/plats.routes']);

    // if (authRouter) app.use('/api/auth', authRouter);
    if (platsRouter) app.use('/api/plats', platsRouter);

    const swaggerDocument = {
        openapi: '3.0.0',
        info: { title: 'My API', version: '1.0.0' },
        paths: {}
    };
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });

    app.use((err, req, res, next) => {
        console.error(err);
        return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    });

    const start = async () => {
        try {
            if (process.env.REDIS_URL) {
                const { createClient } = require('redis');
                const redis = createClient({ url: process.env.REDIS_URL });
                redis.on('error', (error) => console.error('Redis error:', error));
                await redis.connect();
                app.locals.redis = redis;
            }
            app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
        } catch (error) {
            console.error('Unable to start server:', error);
            process.exitCode = 1;
        }
    };

    start();

    module.exports = app;
