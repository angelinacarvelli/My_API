const fs = require("fs").promises;
const path = require("path");
const { slugify, uniqueSlug } = require("../utils/slugify");
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

async function getAllPlats(page = Math.max(1, parseInt(page, 10) || 1), search = null, customLimit = null) {
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

    const limit = Math.min(parseInt(customLimit, 10) || 20, 20);
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

async function getPlatBySlug(slug) {
  const data = await readDataFromFile();
  return (data.plats || []).find((item) => item.slug === slug) || null;
}

async function createPlat(platData) {
    const data = await readDataFromFile();
    const plats = data.plats || [];
    const maxId = plats.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    const newId = maxId + 1;
    const nomRef = platData.nom || platData.title || "";
    const slug = uniqueSlug(slugify(nomRef), plats);
    const newPlat = { ...platData, id: newId, slug };
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
      ? uniqueSlug(slugify(nomRef), plats, plats[index].id)
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