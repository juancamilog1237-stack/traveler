# Traveler

Web estática de itinerarios y presupuestos de viaje. Sin base de datos: cada viaje es un archivo JSON en `src/content/viajes/`.

## Flujo para agregar un viaje

1. Copia el prompt de [`docs/PROMPT_IA.md`](docs/PROMPT_IA.md) en una IA con búsqueda web, junto con [`docs/viaje.schema.json`](docs/viaje.schema.json).
2. Guarda la respuesta como `src/content/viajes/<slug>.json`.
3. Descarga las fotos al proyecto:
   ```
   npm run imagenes -- <slug>
   ```
   Si alguna falla, busca un reemplazo con licencia libre:
   ```
   npm run buscar-imagen -- "Machu Picchu"
   ```
4. Valida contra el esquema (y actualiza `docs/viaje.schema.json`):
   ```
   npm run validar
   ```
5. Revisa en local con `npm run dev` (http://localhost:4321) y haz push a `main`: GitHub Actions publica el sitio.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local con recarga en caliente |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run validar` | Valida todos los viajes y exporta el JSON Schema |
| `npm run imagenes -- <slug>` | Descarga y localiza las fotos de un viaje |
| `npm run buscar-imagen -- "consulta"` | Busca fotos libres en Wikimedia Commons |

## Estructura

```
src/content.config.ts        esquema del viaje (fuente de verdad)
src/content/viajes/*.json    un archivo por viaje
src/assets/viajes/<slug>/    fotos descargadas (las optimiza el build)
src/pages/                   home, página de viaje, cómo funciona
src/components/viaje/        secciones de la página de un viaje
src/styles/global.css        tokens de diseño (colores, tipografía, espaciado)
design-system/traveler/      decisiones de diseño
scripts/                     imágenes, búsqueda y exportación del esquema
```

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube este proyecto a la rama `main`.
2. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
3. Cada push a `main` valida, compila y publica en `https://<usuario>.github.io/<repo>/`.
