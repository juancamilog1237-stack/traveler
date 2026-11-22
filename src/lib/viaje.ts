import type { CollectionEntry } from 'astro:content';

export type Viaje = CollectionEntry<'viajes'>['data'];
export type Nivel = 'economico' | 'medio' | 'alto';
export type Moneda = 'COP' | 'USD' | 'local';

export const NIVELES: { id: Nivel; label: string }[] = [
  { id: 'economico', label: 'Económico' },
  { id: 'medio', label: 'Medio' },
  { id: 'alto', label: 'Alto' },
];

export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const CATEGORIAS: Record<string, string> = {
  vuelos: 'Vuelos',
  alojamiento: 'Alojamiento',
  comida: 'Comida',
  transporte: 'Transporte',
  entradas: 'Entradas y tours',
  seguro: 'Seguro de viaje',
  visa: 'Visa y trámites',
  conectividad: 'SIM y datos',
  compras: 'Compras',
  extras: 'Extras e imprevistos',
};

/** Convierte un monto a USD según su moneda de origen. */
export function aUSD(monto: number, origen: 'local' | 'USD', v: Viaje) {
  return origen === 'USD' ? monto : monto / v.moneda.localPorUSD;
}

/** Convierte un monto de cualquier origen a la moneda de destino. */
export function convertir(monto: number, origen: 'local' | 'USD', destino: Moneda, v: Viaje) {
  const usd = aUSD(monto, origen, v);
  if (destino === 'USD') return usd;
  if (destino === 'COP') return usd * v.moneda.copPorUSD;
  return usd * v.moneda.localPorUSD;
}

export function formato(monto: number, moneda: Moneda, v: Viaje, compacto = false) {
  const codigo = moneda === 'local' ? v.moneda.codigo : moneda;
  const decimales = codigo === 'USD' || codigo === 'EUR' || codigo === 'GBP' ? (monto < 100 ? 2 : 0) : 0;
  if (compacto && codigo === 'COP' && monto >= 1_000_000) {
    return `$${(monto / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} millones`;
  }
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: codigo, maximumFractionDigits: decimales, minimumFractionDigits: 0, currencyDisplay: codigo === 'USD' ? 'symbol' : 'narrowSymbol' }).format(monto) + (codigo === 'COP' ? ' COP' : '');
}

type Dia = Viaje['itinerario'][number];
const aplica = (x: { niveles?: Nivel[] }, nivel: Nivel) => !x.niveles || x.niveles.includes(nivel);

export const actividadesDe = (d: Dia, nivel: Nivel) => d.actividades.filter((a) => aplica(a, nivel));
export const trasladosDe = (d: Dia, nivel: Nivel) => d.traslados.filter((t) => aplica(t, nivel));

type Actividad = Dia['actividades'][number];
type Comida = Dia['comidas']['medio'][number];
type Traslado = Dia['traslados'][number];
export type Paso =
  | { tipo: 'actividad'; hora: string; a: Actividad }
  | { tipo: 'comida'; hora: string; c: Comida }
  | { tipo: 'traslado'; hora: string; t: Traslado };

/** Todo el día de un nivel en orden cronológico: actividades, comidas y traslados. */
export function agendaDe(d: Dia, nivel: Nivel): Paso[] {
  const orden = { traslado: 0, actividad: 1, comida: 2 };
  return [
    ...trasladosDe(d, nivel).map((t) => ({ tipo: 'traslado' as const, hora: t.hora, t })),
    ...actividadesDe(d, nivel).map((a) => ({ tipo: 'actividad' as const, hora: a.hora, a })),
    ...d.comidas[nivel].map((c) => ({ tipo: 'comida' as const, hora: c.hora, c })),
  ].sort((x, y) => x.hora.localeCompare(y.hora) || orden[x.tipo] - orden[y.tipo]);
}

/** Alojamiento donde se duerme la noche del día `dia` (o undefined el último día). */
export function estanciaDe(v: Viaje, dia: number) {
  return v.alojamiento.find((e) => e.noches.includes(dia));
}

/** Costos del día en moneda local, por persona, para un nivel. */
export function costoDia(v: Viaje, d: Dia, nivel: Nivel) {
  const actividades = actividadesDe(d, nivel).reduce((s, a) => s + a.costo, 0);
  const comidas = d.comidas[nivel].reduce((s, c) => s + c.costo, 0);
  const traslados = trasladosDe(d, nivel).reduce((s, t) => s + t.costo, 0);
  const noche = estanciaDe(v, d.dia)?.[nivel].precioNoche ?? 0;
  return { actividades, comidas, traslados, noche, total: actividades + comidas + traslados + noche };
}

export type Categoria = { categoria: string; descripcion: string; moneda: 'local' | 'USD'; economico: number; medio: number; alto: number };

/** Categorías del presupuesto: las del plan (calculadas) + las estimadas por la IA. */
export function categorias(v: Viaje): Categoria[] {
  const porNivel = (fn: (n: Nivel) => number) => ({ economico: fn('economico'), medio: fn('medio'), alto: fn('alto') });
  const sumaDias = (campo: 'comidas' | 'actividades' | 'traslados' | 'noche') => porNivel((n) => v.itinerario.reduce((s, d) => s + costoDia(v, d, n)[campo], 0));
  const ciudades = v.alojamiento.map((e) => e.ciudad).join(', ');
  const calculadas: Categoria[] = [
    { categoria: 'alojamiento', descripcion: `${v.alojamiento.reduce((s, e) => s + e.noches.length, 0)} noches en ${ciudades}.`, moneda: 'local', ...sumaDias('noche') },
    { categoria: 'comida', descripcion: 'Todas las comidas del plan día a día.', moneda: 'local', ...sumaDias('comidas') },
    { categoria: 'transporte', descripcion: 'Todos los traslados del plan día a día.', moneda: 'local', ...sumaDias('traslados') },
    { categoria: 'entradas', descripcion: 'Entradas y tours del itinerario.', moneda: 'local', ...sumaDias('actividades') },
  ];
  const estimadas = v.presupuesto.categorias;
  const vuelos = estimadas.filter((c) => c.categoria === 'vuelos');
  return [...vuelos, ...calculadas, ...estimadas.filter((c) => c.categoria !== 'vuelos')];
}

/** Total del viaje por persona en la moneda pedida. */
export function totalViaje(v: Viaje, nivel: Nivel, destino: Moneda) {
  return categorias(v).reduce((s, c) => s + convertir(c[nivel], c.moneda, destino, v), 0);
}

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function url(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

/** [3,4,10,11] → "Mar–Abr, Oct–Nov" (agrupa meses seguidos, incluido dic→ene). */
export function rangoMeses(meses: number[]) {
  const set = new Set(meses);
  if (set.size === 12) return 'Todo el año';
  // Empieza a recorrer desde un mes que no esté incluido para no partir rangos como Dic–Feb
  const inicio = [...Array(12).keys()].map((i) => i + 1).find((m) => !set.has(m))!;
  const grupos: number[][] = [];
  for (let k = 1; k <= 12; k++) {
    const m = ((inicio - 1 + k) % 12) + 1;
    if (!set.has(m)) continue;
    const ult = grupos[grupos.length - 1];
    if (ult && ult[ult.length - 1] % 12 === m - 1) ult.push(m);
    else grupos.push([m]);
  }
  return grupos.map((g) => (g.length === 1 ? MESES[g[0] - 1] : `${MESES[g[0] - 1]}–${MESES[g[g.length - 1] - 1]}`)).join(', ');
}
