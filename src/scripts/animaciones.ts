import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Al cambiar de nivel cambia la altura del contenido: recalcular los disparadores
document.addEventListener('nivel-cambio', () => requestAnimationFrame(() => ScrollTrigger.refresh()));

let observer: IntersectionObserver | null = null;
let ctx: gsap.Context | null = null;

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Envuelve cada palabra de un título para que suba desde una máscara, en cascada. */
function partirLineas(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  const texto = el.textContent?.trim() ?? '';
  el.setAttribute('aria-label', texto);
  el.innerHTML = texto
    .split(/\s+/)
    .map((p, i) => `<span class="split-line" aria-hidden="true" style="--i:${i}"><span>${p}</span></span>`)
    .join(' ');
  el.dataset.splitDone = '1';
}

export function iniciarAnimaciones() {
  observer?.disconnect();
  ctx?.revert();
  if (reducido()) return;

  // 1) Títulos que aparecen por líneas
  document.querySelectorAll<HTMLElement>('[data-split]').forEach(partirLineas);

  // 2) Revelado al entrar en pantalla, con escalonado dentro de cada grupo
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((grupo) => {
    [...grupo.querySelectorAll<HTMLElement>(':scope > [data-reveal]')].forEach((el, i) => el.style.setProperty('--delay', `${Math.min(i, 8) * 70}ms`));
  });
  observer = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); observer?.unobserve(e.target); }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  document.querySelectorAll('[data-reveal], [data-split]').forEach((el) => observer!.observe(el));

  ctx = gsap.context(() => {
    // 3) Parallax + Ken Burns en el hero
    const heroImg = document.querySelector<HTMLElement>('.hero .media img');
    if (heroImg) {
      gsap.fromTo(heroImg, { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
      gsap.to('.hero .media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-content', { yPercent: -25, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // 4) Línea de tiempo del itinerario que se "dibuja" al bajar
    document.querySelectorAll<HTMLElement>('.timeline').forEach((tl) => {
      const linea = tl.querySelector('.timeline-progress');
      if (!linea) return;
      gsap.fromTo(linea, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 } });
    });

  });
}

/** Anima el texto de un elemento desde `desde` hasta `hasta` con el formateador dado. */
export function animarNumero(el: HTMLElement, desde: number, hasta: number, fmt: (n: number) => string) {
  const previo = (el as any)._tween as gsap.core.Tween | undefined;
  previo?.kill();
  if (reducido()) { el.textContent = fmt(hasta); return; }
  const obj = { n: desde };
  (el as any)._tween = gsap.to(obj, { n: hasta, duration: 0.8, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(obj.n); } });
}
