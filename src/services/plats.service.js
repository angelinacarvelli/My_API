    const fs = require("fs");
    const path = require("path");

    function getAllPlats() {
        const filePath = path.join(__dirname, "../../plats.json");
        const content = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(content);

        return data.plats;
    }

    module.exports = { getAllPlats };