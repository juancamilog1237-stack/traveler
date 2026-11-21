/**
 * Nivel de presupuesto global (economico | medio | alto).
 * Vive en <html data-nivel>; el CSS muestra solo los bloques [data-solo] de ese nivel.
 * Todos los controles [data-grupo="nivel"] quedan sincronizados.
 */
export type Nivel = 'economico' | 'medio' | 'alto';
const NIVELES: Nivel[] = ['economico', 'medio', 'alto'];

export const nivelActual = () => (document.documentElement.dataset.nivel as Nivel) || 'medio';

export function moverThumb(grupo: HTMLElement) {
  const activo = grupo.querySelector<HTMLElement>('button[aria-pressed="true"]');
  const thumb = grupo.querySelector<HTMLElement>('.thumb');
  if (!activo || !thumb) return;
  thumb.style.width = `${activo.offsetWidth}px`;
  thumb.style.transform = `translateX(${activo.offsetLeft}px)`;
}

function sincronizarControles(n: Nivel) {
  document.querySelectorAll<HTMLElement>('[data-grupo="nivel"]').forEach((g) => {
    g.querySelectorAll<HTMLButtonElement>('button[data-valor]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.valor === n)));
    moverThumb(g);
  });
}

export function cambiarNivel(n: Nivel) {
  if (!NIVELES.includes(n) || n === nivelActual()) return;
  const aplicar = () => {
    document.documentElement.dataset.nivel = n;
    sincronizarControles(n);
    document.dispatchEvent(new CustomEvent('nivel-cambio', { detail: n }));
  };
  const vt = (document as any).startViewTransition;
  if (vt && !matchMedia('(prefers-reduced-motion: reduce)').matches) vt.call(document, aplicar);
  else aplicar();
  try { localStorage.setItem('nivel', n); } catch {}
  const u = new URL(location.href);
  u.searchParams.set('nivel', n);
  history.replaceState(history.state, '', u);
}

export function iniciarNivel() {
  sincronizarControles(nivelActual());
  document.querySelectorAll<HTMLElement>('[data-grupo="nivel"]:not([data-ready])').forEach((g) => {
    g.dataset.ready = '1';
    g.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-valor]');
      if (b) cambiarNivel(b.dataset.valor as Nivel);
    });
  });
}
