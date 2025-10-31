const qs = encodeURIComponent('fotodetección');
const catalog = `https://www.datos.gov.co/api/views.json?search=${qs}`;

async function candidateIds() {
  const r = await fetch(catalog);
  const rows = await r.json();
  return rows.map(x => x.id);
}

async function hasGeo(id) {
  try {
    const r = await fetch(`https://www.datos.gov.co/resource/${id}.json?$limit=1`);
    const j = await r.json();
    if (!Array.isArray(j) || j.length === 0) return false;
    const keys = Object.keys(j[0] || {}).map(k => k.toLowerCase());
    return keys.includes('latitud') && keys.includes('longitud');
  } catch {
    return false;
  }
}

(async () => {
  const ids = await candidateIds();
  const results = [];
  for (const id of ids) {
    if (await hasGeo(id)) results.push(id);
  }
  console.log(JSON.stringify(results, null, 2));
})();
