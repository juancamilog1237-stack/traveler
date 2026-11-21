# Traveler — Design system (MASTER)

Fuente de verdad visual. Los tokens viven en `src/styles/global.css`; los componentes nunca usan hex sueltos.

## Dirección
Editorial / revista de viajes. La foto real del destino es la protagonista; serif en titulares, mucho aire, movimiento suave.

## Color
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | #FAF6EF | #14110F | Fondo arena |
| `--surface` | #FFFFFF | #1F1B18 | Tarjetas |
| `--surface-2` | #F3EDE3 | #2A2521 | Secciones alternas |
| `--fg` | #1C1917 | #F5F0E8 | Texto |
| `--muted-fg` | #57534E | #A8A29E | Texto secundario (≥ 4.5:1) |
| `--border` | #E7DFD2 | #3A332D | Bordes |
| `--accent` | #C2410C | #FB923C | Precios, CTA, nivel activo |
| `--secondary` | #0F766E | #2DD4BF | Links, mapas |
| `--trip` | `meta.colorAcento` o `--secondary` | mezcla 50 % con blanco | Línea de tiempo, eyebrows, pines |

## Tipografía
- Titulares: **Newsreader** 400–600 (serif editorial).
- Texto y UI: **Public Sans** 400–600.
- Escala fluida `--step--1 … --step-4`; cuerpo 16–18 px, interlineado 1.6; cifras tabulares en precios.

## Forma y espacio
- Radios: 10 px (controles), 18 px (tarjetas), píldora para chips y botones.
- Espaciado en múltiplos de 4 px (`--space-1 … --space-9`); secciones de 72 px.
- Contenedor máx. 1200 px con 16 px de margen lateral.

## Movimiento
- Curva `--ease-out: cubic-bezier(.16,1,.3,1)`; 160 / 320 / 700 ms.
- Títulos: palabras que suben desde una máscara (55 ms de cascada).
- Bloques: fade + 24 px hacia arriba, cascada de 70 ms dentro de un grupo.
- Hero: Ken Burns de entrada + parallax con el scroll (GSAP ScrollTrigger).
- Línea de tiempo del itinerario que se dibuja con el scroll.
- Transiciones entre páginas (View Transitions): foto de la tarjeta → hero del viaje.
- Solo `transform` y `opacity`. Con `prefers-reduced-motion`, todo aparece en su estado final.

## Íconos
Lucide en SVG inline (`src/components/Icon.astro`), trazo de 1.6 px. Nunca emojis.

## Accesibilidad
Contraste AA en ambos temas, foco visible (`--accent`), `alt` en todas las fotos, objetivos ≥ 44 px, visor de fotos con teclado (←, →, Esc), skip link.
