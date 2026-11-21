#!/usr/bin/env node
/**
 * Descarga las imágenes remotas de un viaje y reescribe el JSON con rutas locales.
 *
 *   npm run imagenes -- <slug>        (o sin slug para todos los viajes)
 *
 * - Recorre TODOS los objetos imagen del JSON (portada, galería, días, actividades,
 *   alojamiento, comida) y descarga los que tienen url http(s).
 * - Guarda en src/assets/viajes/<slug>/ y cambia la url a "<slug>/<archivo>".
 * - Las URLs rotas se reportan al final y se ELIMINAN del JSON (las opcionales)
 *   para que el build no falle; la portada rota detiene el proceso.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const DIR_VIAJES = join(RAIZ, 'src/content/viajes');
const DIR_ASSETS = join(RAIZ, 'src/assets/viajes');
const UA = 'TravelerSiteBuilder/1.0 (static travel site; image fetch)';
const TIPOS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' };

const slugs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const archivos = slugs.length ? slugs.map((s) => `${s.replace(/\.json$/, '')}.json`) : (await readdir(DIR_VIAJES)).filter((f) => f.endsWith('.json'));

const esImagen = (o) => o && typeof o === 'object' && typeof o.url === 'string' && 'alt' in o && 'fuente' in o;

function nombreArchivo(img, tipo) {
  const base = (img.alt || 'foto').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/-$/, '');
  const hash = createHash('sha1').update(img.url).digest('hex').slice(0, 6);
  return `${base}-${hash}${TIPOS[tipo] ?? (extname(new URL(img.url).pathname) || '.jpg')}`;
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map(); // misma URL usada varias veces → un solo archivo

async function descargar(img, dir, slug) {
  if (cache.has(img.url)) return cache.get(img.url);
  let res;
  for (let intento = 0; intento < 4; intento++) {
    await esperar(400 + intento * 4000); // ritmo amable con Wikimedia/Unsplash
    res = await fetch(img.url, { headers: { 'User-Agent': UA, Accept: 'image/avif,image/webp,image/jpeg,image/png,*/*' }, redirect: 'follow' });
    if (res.status !== 429 && res.status < 500) break;
  }
  // Wikimedia limita los originales: probar miniaturas estándar del mismo archivo
  const m = !res.ok && img.url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/([^/?]+)$/);
  if (m) {
    for (const ancho of [1280, 960, 500]) {
      const url = `https://thumb.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${ancho}px-${m[2]}`;
      await esperar(400);
      res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
      if (res.ok) break;
    }
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const tipo = (res.headers.get('content-type') || '').split(';')[0].trim();
  if (!tipo.startsWith('image/') || tipo === 'image/svg+xml' || tipo === 'image/gif') throw new Error(`no es una foto (${tipo || 'sin tipo'})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5_000) throw new Error('archivo demasiado pequeño');
  const nombre = nombreArchivo(img, tipo);
  await writeFile(join(dir, nombre), buf);
  cache.set(img.url, `${slug}/${nombre}`);
  return `${slug}/${nombre}`;
}

let totalFallas = 0;
for (const archivo of archivos) {
  const slug = archivo.replace(/\.json$/, '');
  const ruta = join(DIR_VIAJES, archivo);
  if (!existsSync(ruta)) { console.error(`✗ No existe ${ruta}`); process.exitCode = 1; continue; }
  const datos = JSON.parse(await readFile(ruta, 'utf8'));
  const dir = join(DIR_ASSETS, slug);
  await mkdir(dir, { recursive: true });

  const fallas = [];
  let ok = 0;

  // Recorre el árbol y procesa cada imagen. `quitar` elimina la imagen del padre si falla.
  async function visitar(nodo, ruta, quitar) {
    if (Array.isArray(nodo)) {
      for (let i = nodo.length - 1; i >= 0; i--) {
        await visitar(nodo[i], `${ruta}[${i}]`, esImagen(nodo[i]) ? () => nodo.splice(i, 1) : null);
      }
      return;
    }
    if (!nodo || typeof nodo !== 'object') return;
    if (esImagen(nodo)) {
      if (!/^https?:\/\//.test(nodo.url)) return;
      try {
        nodo.url = await descargar(nodo, dir, slug);
        ok++;
        process.stdout.write('.');
      } catch (e) {
        fallas.push({ ruta, url: nodo.url, error: e.message });
        if (ruta === 'meta.portada') return;
        quitar?.();
      }
      return;
    }
    for (const [k, val] of Object.entries(nodo)) {
      await visitar(val, ruta ? `${ruta}.${k}` : k, esImagen(val) ? () => delete nodo[k] : null);
    }
  }

  await visitar(datos, '', null);
  await writeFile(ruta, JSON.stringify(datos, null, 2) + '\n');
  console.log(`\n${slug}: ${ok} descargadas, ${fallas.length} con error.`);
  for (const f of fallas) console.log(`  ✗ ${f.ruta}: ${f.error}\n    ${f.url}`);
  if (fallas.some((f) => f.ruta === 'meta.portada')) {
    console.error('  La PORTADA falló: reemplázala (npm run buscar-imagen -- "consulta") y vuelve a correr.');
    process.exitCode = 1;
  }
  totalFallas += fallas.length;
}
if (totalFallas) console.log('\nLas imágenes opcionales rotas se quitaron del JSON. Busca reemplazos con: npm run buscar-imagen -- "lugar"');
