function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(base, plats, ignoreId = null) {
  let slug = base;
  let n = 2;
  while (plats.some((p) => p.slug === slug && String(p.id) !== String(ignoreId))) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

module.exports = { slugify, uniqueSlug };