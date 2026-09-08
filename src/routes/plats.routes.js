const express = require("express");
const { getAllPlats } = require("../services/plats.service");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const plats = await getAllPlats();
        res.json(plats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;