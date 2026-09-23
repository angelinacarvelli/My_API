const fs = require("fs").promises;
const path = require("path");
const filePath = path.join(__dirname, "../../plats.json");

async function readDataFromFile() {
    try {
        const content = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            return { plats: parsed };
        }
        return parsed || { plats: [] };
    } catch (err) {
        console.error("Erreur de lecture de plats.json :", err.message);
        return { plats: [] };
    }
}

async function writeDataToFile(data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function normalizeString(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

async function getAllPlats(page = 1, search = null, customLimit = null) {
    const data = await readDataFromFile();
    let plats = data.plats || [];
    
    if (search) {
        const queryNormalized = normalizeString(search);
        plats = plats.filter((item) => {
            const nom = normalizeString(item.nom || item.title || item.name);
            const slug = normalizeString(item.slug);
            const pays = normalizeString(item.pays || item.country);
            const matchText = nom.includes(queryNormalized) || slug.includes(queryNormalized) || pays.includes(queryNormalized);
            const matchIngredient = Array.isArray(item.ingredients) && item.ingredients.some((ing) =>
                normalizeString(ing).includes(queryNormalized)
            );
            return matchText || matchIngredient;
        });
    }

    const limit = customLimit ? parseInt(customLimit, 10) : 20;
    const totalPlats = plats.length;
    const totalPages = Math.ceil(totalPlats / limit) || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
        page,
        limit,
        totalPlats,
        totalPages,
        data: plats.slice(start, end)
    };
}

async function getPlatById(id) {
    const data = await readDataFromFile();
    return (data.plats || []).find((item) => String(item.id) === String(id)) || null;
}

async function getPlatBySlug(searchQuery) {
    const data = await readDataFromFile();
    const plats = data.plats || [];
    const normalizedQuery = normalizeString(searchQuery);
    if (!normalizedQuery) return null;
    const stopWords = ["et", "and", "avec", "de", "du", "la", "le", "des", "au", "aux", "with"];
    const queryKeywords = normalizedQuery
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.includes(word));
    let found = plats.find((item) => {
        const itemNom = normalizeString(item.nom || item.title || item.name);
        const itemSlug = normalizeString(item.slug);
        if (itemNom === normalizedQuery || itemSlug === normalizedQuery) {
            return true;
        }
        if (itemNom.includes(normalizedQuery)) {
            return true;
        }
        if (queryKeywords.length > 0) {
            return queryKeywords.every(keyword => itemNom.includes(keyword) || itemSlug.includes(keyword));
        }
        return false;
    });
    if (!found && queryKeywords.length > 0) {
        found = plats.find((item) => {
            const itemNom = normalizeString(item.nom || item.title || item.name);
            const itemSlug = normalizeString(item.slug);
            return queryKeywords.some(keyword => itemNom.includes(keyword) || itemSlug.includes(keyword));
        });
    }
    return found || null;
}

async function createPlat(platData) {
    const data = await readDataFromFile();
    const plats = data.plats || [];
    const maxId = plats.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    const newId = maxId + 1;
    const nomRef = platData.nom || platData.title || "";
    const slug = platData.slug || nomRef.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const newPlat = { id: newId, ...platData, slug };
    plats.push(newPlat);
    data.plats = plats;
    await writeDataToFile(data);
    return newPlat;
}

async function updatePlat(id, platData) {
    const data = await readDataFromFile();
    const plats = data.plats || [];
    const index = plats.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return null;
    const nomRef = platData.nom || platData.title || "";
    const slug = nomRef
        ? nomRef.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        : plats[index].slug;
    const updatedPlat = { ...plats[index], ...platData, id: plats[index].id, slug };
    plats[index] = updatedPlat;
    data.plats = plats;
    await writeDataToFile(data);
    return updatedPlat;
}

async function deletePlat(id) {
    const data = await readDataFromFile();
    const plats = data.plats || [];
    const index = plats.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return null;
    const deletedPlat = plats.splice(index, 1)[0];
    data.plats = plats;
    await writeDataToFile(data);
    return deletedPlat;
}

module.exports = {
    getAllPlats,
    getPlatById,
    getPlatBySlug,
    createPlat,
    updatePlat,
    deletePlat
};