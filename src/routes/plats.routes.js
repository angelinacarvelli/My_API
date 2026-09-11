const express = require("express");

const {
    getAllPlats,
    getPlatById,
    getPlatBySlug
} = require("../services/plats.service");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        let page = Number(req.query.page) || 1;

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                message: "La page doit être un entier supérieur ou égal à 1"
            });
        }

        const result = await getAllPlats(page);

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});


router.get("/slug/:slug", async (req, res) => {
    try {
        const plat = await getPlatBySlug(req.params.slug);

        if (!plat) {
            return res.status(404).json({
                message: "Plat non trouvé"
            });
        }

        return res.status(200).json(plat);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const plat = await getPlatById(req.params.id);

        if (!plat) {
            return res.status(404).json({
                message: "Plat non trouvé"
            });
        }

        return res.status(200).json(plat);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;