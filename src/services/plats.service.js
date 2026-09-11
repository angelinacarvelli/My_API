const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "../../plats.json");

async function readDataFromFile() {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
}

async function getAllPlats(page = 1) {
    const data = await readDataFromFile();

    const plats = data.plats || [];

    const limit = 20;

    const totalPlats = plats.length;
    const totalPages = Math.ceil(totalPlats / limit);

    const start = (page - 1) * limit;
    const end = start + limit;

    const platsDeLaPage = plats.slice(start, end);

    return {
        page,
        limit,
        totalPlats,
        totalPages,
        data: platsDeLaPage
    };
}

async function getPlatById(id) {
    const data = await readDataFromFile();

    const plat = (data.plats || []).find(
        (item) => String(item.id) === String(id)
    );

    return plat || null;
}

async function getPlatBySlug(slug) {
    const data = await readDataFromFile();

    const plat = (data.plats || []).find(
        (item) => item.slug === slug
    );

    return plat || null;
}

module.exports = {
    getAllPlats,
    getPlatById,
    getPlatBySlug
};