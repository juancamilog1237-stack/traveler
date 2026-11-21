import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * ESQUEMA DE UN VIAJE — fuente de verdad.
 * Todos los precios están en MONEDA LOCAL del destino, por persona,
 * salvo donde se indique `moneda: "USD"`. El sitio calcula COP y USD.
 * Si un JSON no cumple este esquema, `npm run validar` y el build fallan.
 */

const imagen = z.object({
  url: z.string().min(1).describe('URL https de Wikimedia Commons/Unsplash/Pexels, o ruta local tras `npm run imagenes`'),
  alt: z.string().min(3).describe('Descripción de la foto para accesibilidad'),
  credito: z.string().describe('Autor de la foto'),
  licencia: z.string().describe('CC BY-SA 4.0, Unsplash License, etc.'),
  fuente: z.string().url().describe('Página de origen de la foto'),
});

const coords = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const nivel = z.enum(['economico', 'medio', 'alto']);

const actividad = z.object({
  niveles: z.array(nivel).optional().describe('Solo en estos niveles; si falta, aplica a todos'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  nombre: z.string(),
  descripcion: z.string(),
  duracion: z.string().describe('"2 h", "45 min"'),
  costo: z.number().nonnegative().describe('Moneda local por persona; 0 = gratis'),
  tipo: z.enum(['cultura', 'naturaleza', 'comida', 'compras', 'aventura', 'vida-nocturna', 'descanso', 'transporte']),
  coords: coords.optional(),
  link: z.string().url().optional(),
  imagen: imagen.optional(),
  consejo: z.string().optional(),
});

const traslado = z.object({
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  de: z.string(),
  a: z.string(),
  medio: z.string(),
  duracion: z.string(),
  costo: z.number().nonnegative(),
  niveles: z.array(nivel).optional().describe('Solo en estos niveles; si falta, aplica a todos'),
  consejo: z.string().optional(),
});

const comida = z.object({
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  momento: z.enum(['desayuno', 'almuerzo', 'cena', 'snack']),
  lugar: z.string(),
  plato: z.string(),
  costo: z.number().nonnegative().describe('Moneda local por persona; 0 si está incluida en el alojamiento'),
  link: z.string().url().optional(),
  coords: coords.optional(),
});

const dia = z.object({
  dia: z.number().int().positive(),
  titulo: z.string(),
  ciudad: z.string(),
  coords: coords,
  resumen: z.string(),
  imagenes: z.array(imagen).default([]),
  actividades: z.array(actividad).min(1),
  comidas: z.object({
    economico: z.array(comida).min(1),
    medio: z.array(comida).min(1),
    alto: z.array(comida).min(1),
  }).describe('Plan de comidas del día para cada nivel de presupuesto'),
  traslados: z.array(traslado).default([]).describe('TODOS los desplazamientos pagos del día (tren, metro, bus, taxi); son el presupuesto de transporte'),
  planB: z.string().optional().describe('Alternativa si llueve o algo está cerrado'),
});

const hotel = z.object({
  nombre: z.string(),
  zona: z.string(),
  tipo: z.string().describe('Hostal, hotel business, ryokan, hotel de lujo…'),
  precioNoche: z.number().nonnegative().describe('Moneda local, POR PERSONA (habitación compartida en doble)'),
  incluye: z.string().optional().describe('Desayuno, cena, onsen…'),
  descripcion: z.string(),
  link: z.string().url(),
  imagen: imagen.optional(),
});

// Categorías que la IA estima; alojamiento, comida, entradas y transporte se calculan del plan.
const categoriaPresupuesto = z.object({
  categoria: z.enum(['vuelos', 'seguro', 'visa', 'conectividad', 'compras', 'extras']),
  descripcion: z.string(),
  moneda: z.enum(['local', 'USD']).default('local'),
  economico: z.number().nonnegative(),
  medio: z.number().nonnegative(),
  alto: z.number().nonnegative(),
});

const viajes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/viajes' }),
  schema: z.object({
    meta: z.object({
      titulo: z.string(),
      resumen: z.string().describe('2-3 frases que venden el viaje'),
      destino: z.string(),
      pais: z.string(),
      region: z.enum(['Asia', 'Europa', 'Sudamérica', 'Centroamérica y Caribe', 'Norteamérica', 'África', 'Oceanía', 'Medio Oriente']),
      duracionDias: z.number().int().positive(),
      mesesIdeales: z.array(z.number().int().min(1).max(12)).min(1),
      temporadaRecomendada: z.string(),
      estilo: z.enum(['mochilero', 'medio', 'lujo']),
      dificultad: z.enum(['facil', 'moderada', 'exigente']),
      idealPara: z.array(z.string()).min(1),
      etiquetas: z.array(z.string()).default([]),
      fechaInvestigacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      colorAcento: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      portada: imagen,
      galeria: z.array(imagen).default([]),
    }),
    moneda: z.object({
      codigo: z.string().length(3).describe('ISO 4217, p. ej. JPY'),
      simbolo: z.string(),
      localPorUSD: z.number().positive().describe('Cuántas unidades locales vale 1 USD'),
      copPorUSD: z.number().positive().describe('Cuántos COP vale 1 USD'),
      fechaTasa: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    comoLlegar: z.object({
      resumen: z.string(),
      aeropuertoLlegada: z.string(),
      delAeropuertoAlCentro: z.string(),
      rutas: z.array(z.object({
        origen: z.string().describe('Ciudad de Colombia'),
        ruta: z.string().describe('BOG → MAD → NRT'),
        aerolineas: z.array(z.string()),
        duracion: z.string(),
        escalas: z.number().int().nonnegative(),
        precioUSD: z.object({ min: z.number(), max: z.number() }).describe('Ida y vuelta por persona'),
      })).min(1),
    }),
    itinerario: z.array(dia).min(1),
    presupuesto: z.object({
      notas: z.string(),
      categorias: z.array(categoriaPresupuesto).min(2),
    }),
    alojamiento: z.array(z.object({
      ciudad: z.string(),
      noches: z.array(z.number().int().positive()).min(1).describe('Días del itinerario en que se duerme aquí, p. ej. [1,2,3,4]'),
      economico: hotel,
      medio: hotel,
      alto: hotel,
    })).min(1).describe('Un alojamiento elegido por ciudad y por nivel; las noches cubren todo el viaje'),
    comida: z.object({
      platosTipicos: z.array(z.object({
        nombre: z.string(),
        descripcion: z.string(),
        precioAprox: z.number().nonnegative(),
        imagen: imagen.optional(),
      })).default([]),
    }),
    infoPractica: z.object({
      visa: z.object({
        requiere: z.boolean(),
        tipo: z.string(),
        detalle: z.string().describe('Para pasaporte colombiano'),
        link: z.string().url().optional(),
      }),
      clima: z.array(z.object({
        mes: z.number().int().min(1).max(12),
        tempMin: z.number(),
        tempMax: z.number(),
        lluviaMm: z.number().nonnegative(),
      })).length(12),
      vacunas: z.array(z.string()).default([]),
      seguridad: z.string(),
      enchufe: z.object({ tipo: z.string(), voltaje: z.string(), necesitaAdaptador: z.boolean() }),
      propinas: z.string(),
      idioma: z.string(),
      conectividad: z.string(),
      transporteLocal: z.string(),
      frases: z.array(z.object({ es: z.string(), local: z.string(), pronunciacion: z.string() })).default([]),
      apps: z.array(z.object({ nombre: z.string(), para: z.string() })).default([]),
      consejos: z.array(z.string()).default([]),
      estafas: z.array(z.string()).default([]),
      checklist: z.array(z.string()).default([]),
    }),
    fuentes: z.array(z.object({ titulo: z.string(), url: z.string().url() })).min(1),
  }),
});

export const collections = { viajes };
