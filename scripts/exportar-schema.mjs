#!/usr/bin/env node
/**
 * Copia el JSON Schema que Astro genera desde src/content.config.ts
 * a docs/viaje.schema.json, para dárselo a la IA que investiga los viajes.
 * Se ejecuta después de `astro sync` (que además valida todos los viajes).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const origen = new URL('../.astro/collections/viajes.schema.json', import.meta.url);
const destino = new URL('../docs/viaje.schema.json', import.meta.url);

if (!existsSync(origen)) {
  console.error('No se encontró .astro/collections/viajes.schema.json. ¿Corrió `astro sync`?');
  process.exit(1);
}
const schema = JSON.parse(await readFile(origen, 'utf8'));
// Astro agrega $schema para el editor; quitamos lo que no aplica a la IA
delete schema.properties?.$schema;
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(destino, JSON.stringify(schema, null, 2) + '\n');
console.log('✓ Viajes válidos. Esquema exportado a docs/viaje.schema.json');
