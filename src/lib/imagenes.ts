import type { ImageMetadata } from 'astro';

/**
 * Las fotos descargadas viven en src/assets/viajes/<slug>/archivo.ext
 * y en el JSON se referencian como "<slug>/archivo.ext".
 * Las URLs https (aún sin descargar) se muestran directo como respaldo.
 */
const locales = import.meta.glob<{ default: ImageMetadata }>('/src/assets/viajes/**/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export function resolverImagen(url: string): ImageMetadata | string {
  if (/^https?:\/\//.test(url)) return url;
  const encontrada = locales[`/src/assets/viajes/${url}`];
  if (!encontrada) throw new Error(`Imagen local no encontrada: src/assets/viajes/${url}. Ejecuta "npm run imagenes".`);
  return encontrada.default;
}
