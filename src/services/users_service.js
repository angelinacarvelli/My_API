const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const filePath = path.join(__dirname, '../../users.json');

async function readUsersFromFile() {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        // Si le fichier n'existe pas encore, on retourne un tableau vide
        return { users: [] };
    }
}

async function writeUsersToFile(data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function findUserByUsername(username) {
    const data = await readUsersFromFile();
    return (data.users || []).find((u) => u.username === username) || null;
}

async function createUser(username, password) {
    const data = await readUsersFromFile();
    const users = data.users || [];

    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
        throw new Error('Nom d\'utilisateur déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now(),
        username,
        password: hashedPassword
    };

    users.push(newUser);
    data.users = users;
    await writeUsersToFile(data);

    return { id: newUser.id, username: newUser.username };
}

async function validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
}

module.exports = {
    findUserByUsername,
    createUser,
    validatePassword
};