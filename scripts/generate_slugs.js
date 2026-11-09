const fs = require('fs');
const { slugify } = require('../src/utils/slugify');
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

  plat.slug = slugify(plat.nom);
}

fs.writeFileSync(
  filePath,
  JSON.stringify(Array.isArray(data) ? plats : { ...data, plats }, null, 2) + '\n',
  'utf8'
);