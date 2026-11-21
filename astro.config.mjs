import { defineConfig } from 'astro/config';

// En GitHub Pages el sitio vive en https://<usuario>.github.io/<repo>/
// El workflow de deploy define SITE y BASE; en local quedan vacíos.
export default defineConfig({
  site: process.env.SITE || 'http://localhost:4321',
  base: process.env.BASE || '/',
  trailingSlash: 'ignore',
  image: {
    responsiveStyles: true,
  },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Pre-empaqueta las librerías de entrada: evita que el mapa falle en desarrollo cuando Vite re-optimiza
  vite: { optimizeDeps: { include: ['leaflet', 'gsap', 'gsap/ScrollTrigger'] } },
});
