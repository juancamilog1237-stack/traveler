#!/usr/bin/env node
/**
 * Busca fotos con licencia libre en Wikimedia Commons y las imprime
 * ya en el formato de imagen del esquema, listas para pegar en el JSON.
 *
 *   npm run buscar-imagen -- "Fushimi Inari" [cantidad]
 */
const [consulta, cantidad = '5'] = process.argv.slice(2);
if (!consulta) {
  console.error('Uso: npm run buscar-imagen -- "lugar o plato" [cantidad]');
  process.exit(1);
}
const UA = 'TravelerSiteBuilder/1.0 (static travel site; image search)';
const params = new URLSearchParams({
  action: 'query', format: 'json', origin: '*', generator: 'search', gsrnamespace: '6',
  gsrsearch: `${consulta} filetype:bitmap`, gsrlimit: String(Number(cantidad) * 3),
  prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1920',
});
const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
const data = await res.json();
const limpiar = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const resultados = Object.values(data.query?.pages ?? {})
  .sort((a, b) => a.index - b.index)
  .map((p) => ({ p, info: p.imageinfo?.[0] }))
  .filter(({ info }) => info && /jpeg|png|webp/.test(info.mime) && info.width >= 1000 && info.width >= info.height * 0.6)
  .slice(0, Number(cantidad))
  .map(({ p, info }) => {
    const m = info.extmetadata ?? {};
    return {
      url: (info.thumburl ?? info.url).split('?')[0],
      alt: limpiar(m.ImageDescription?.value).slice(0, 140) || p.title.replace(/^File:|\.\w+$/g, ''),
      credito: limpiar(m.Artist?.value) || 'Wikimedia Commons',
      licencia: limpiar(m.LicenseShortName?.value) || 'Ver fuente',
      fuente: info.descriptionurl,
    };
  });

if (!resultados.length) {
  console.log('Sin resultados. Prueba con el nombre en inglés o más general.');
} else {
  console.log(JSON.stringify(resultados, null, 2));
  console.log('\nRevisa el "alt" (escríbelo en español) antes de pegarlo.');
}
