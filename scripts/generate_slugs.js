const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'plats.json');

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const plats = Array.isArray(data) ? data : data.plats;

if (!Array.isArray(plats)) {
  throw new TypeError('plats.json doit contenir un tableau de plats.');
}

for (const plat of plats) {
  if (typeof plat.nom !== 'string') {
    continue;
  }

  plat.slug = plat.nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

fs.writeFileSync(
  filePath,
  JSON.stringify(Array.isArray(data) ? plats : { ...data, plats }, null, 2) + '\n',
  'utf8'
);