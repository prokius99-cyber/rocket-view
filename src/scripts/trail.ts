/**
 * «Траектория» (DESIGN.md, С1): линия-хвост ракеты через точки секции, полёт ракеты один раз.
 *
 * Разметка:
 *   <section data-trail="load|view|static">        корень, position: relative
 *     <… data-trail-pt="1" data-trail-at="0.5 1">   точки пути по порядку; at — доля ширины/высоты (по умолчанию центр)
 *     <… data-trail-stop>                            ракета на загрузке останавливается перед этим элементом
 *     <… data-tone="poster">                         внутри плаката линия светлая, на бетоне — чернильная
 * Скрытые элементы (display: none) из пути выпадают — раскладку на каждой ширине решает CSS секции.
 * Анимируются только transform ракеты и opacity дыма. Без JS линии нет, вёрстка полная.
 */
type Pt = { x: number; y: number };
const NS = 'http://www.w3.org/2000/svg';

const ROCKET = `<svg viewBox="0 0 64 28" aria-hidden="true" focusable="false">
  <path d="M0 14 Q10 8 22 10 L22 18 Q10 20 0 14Z" style="fill:var(--c-accent)"/>
  <path d="M20 14 L16 4 L30 9 Z M20 14 L16 24 L30 19 Z" style="fill:var(--c-on-poster)"/>
  <path d="M22 6 H46 Q62 8 64 14 Q62 20 46 22 H22 Z" style="fill:var(--c-on-poster)"/>
  <circle cx="44" cy="14" r="4" style="fill:var(--c-poster)"/>
</svg>`;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string> = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** Catmull-Rom → кубические Безье, натяжение 0.28 (как в прототипе v3). */
function spline(p: Pt[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(p[0].x)} ${f(p[0].y)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i], b = p[i], c = p[i + 1], e = p[i + 2] ?? c, t = 0.28;
    d += ` C${f(b.x + (c.x - a.x) * t)} ${f(b.y + (c.y - a.y) * t)} ${f(c.x - (e.x - b.x) * t)} ${f(c.y - (e.y - b.y) * t)} ${f(c.x)} ${f(c.y)}`;
  }
  return d;
}

function setup(root: HTMLElement, calm: boolean) {
  const mode = root.dataset.trail as 'load' | 'view' | 'static';
  const uid = Math.random().toString(36).slice(2, 8);

  const svg = el('svg', { class: 'trail-svg', 'aria-hidden': 'true', focusable: 'false' });
  const defs = el('defs');
  const blur = el('filter', { id: `tb-${uid}`, x: '-50%', y: '-50%', width: '200%', height: '200%' });
  blur.appendChild(el('feGaussianBlur', { stdDeviation: '9' }));
  const clipIn = el('clipPath', { id: `ti-${uid}` });
  const clipOut = el('clipPath', { id: `to-${uid}` });
  const outPath = el('path', { 'clip-rule': 'evenodd' });
  clipOut.appendChild(outPath);
  defs.append(blur, clipIn, clipOut);
  const route = el('path');
  const lineIn = el('path', { class: 'trail-line trail-line--poster', 'clip-path': `url(#ti-${uid})` });
  const lineOut = el('path', { class: 'trail-line trail-line--ink', 'clip-path': `url(#to-${uid})` });
  const puffs = el('g', { class: 'trail-puffs', filter: `url(#tb-${uid})` });
  svg.append(defs, lineIn, lineOut, puffs);
  root.appendChild(svg);

  let rocket: HTMLElement | null = null;
  if (mode !== 'static') {
    rocket = document.createElement('div');
    rocket.className = 'trail-rocket';
    rocket.innerHTML = ROCKET;
    // До полёта по скроллу ракета не лежит на тексте первой наклейки.
    if (mode === 'view' && !calm) rocket.style.opacity = '0';
    root.appendChild(rocket);
  }

  let total = 0, stopLen = 0, played = false, flying = false;
  let puffAt: number[] = [];
  const at = (l: number) => route.getPointAtLength(Math.max(0, Math.min(total, l)));

  function place(l: number) {
    if (!rocket) return;
    const a = at(l - 4), b = at(l + 4), p = at(l);
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    rocket.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${ang}deg)`;
  }

  function build() {
    const R = root.getBoundingClientRect();
    if (!R.width || !R.height) return;
    svg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`);
    const rel = (node: Element) => {
      const r = node.getBoundingClientRect();
      return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height };
    };

    const pts = [...root.querySelectorAll<HTMLElement>('[data-trail-pt]')]
      .filter((n) => n.getClientRects().length > 0)
      .sort((a, b) => Number(a.dataset.trailPt) - Number(b.dataset.trailPt))
      .map((n) => {
        const r = rel(n);
        const [fx, fy] = (n.dataset.trailAt ?? '0.5 0.5').split(' ').map(Number);
        return { x: r.x + r.w * fx, y: r.y + r.h * fy };
      });
    if (pts.length < 2) return;

    const d = spline(pts);
    for (const p of [route, lineIn, lineOut]) p.setAttribute('d', d);
    total = route.getTotalLength();

    // Плакаты: светлая линия внутри, чернильная снаружи.
    clipIn.replaceChildren();
    let hole = '';
    for (const poster of root.querySelectorAll('[data-tone="poster"]')) {
      const r = rel(poster);
      clipIn.appendChild(el('rect', { x: String(r.x), y: String(r.y), width: String(r.w), height: String(r.h) }));
      hole += ` M${r.x} ${r.y}V${r.y + r.h}H${r.x + r.w}V${r.y}Z`;
    }
    outPath.setAttribute('d', `M0 0H${R.width}V${R.height}H0Z${hole}`);

    // Точка остановки: первое касание пути с элементом data-trail-stop.
    stopLen = total;
    const stop = root.querySelector('[data-trail-stop]');
    if (stop && stop.getClientRects().length) {
      const s = rel(stop);
      for (let l = 0; l <= total; l += 3) {
        const q = at(l);
        if (q.x > s.x - 6 && q.x < s.x + s.w + 6 && q.y > s.y - 6 && q.y < s.y + s.h + 6) {
          stopLen = Math.max(60, l - 34);
          break;
        }
      }
    }

    // Три клуба дыма позади ракеты на первом отрезке.
    puffs.replaceChildren();
    puffAt = [];
    if (rocket) {
      [0.3, 0.55, 0.8].forEach((k, i) => {
        const p = at(stopLen * k);
        const c = el('circle', {
          cx: String(p.x), cy: String(p.y + (i % 2 ? 10 : -10)), r: String([22, 30, 18][i]),
          class: played || calm ? 'trail-puff is-on' : 'trail-puff',
        });
        puffs.appendChild(c);
        puffAt.push(stopLen * k);
      });
    }
    // В покое (reduced-motion): на первом экране ракета у кнопки звонка, в финале — там, где кончается полёт.
    const rest = mode === 'load' ? Math.max(0, total - 34) : stopLen;
    if (!flying) place(calm ? rest : played ? stopLen : 0);
    root.classList.add('has-trail');
  }

  function fly() {
    if (played || !rocket) return;
    played = flying = true;
    rocket.style.opacity = '1';
    // Минификатор CSS переписывает 800ms в .8s — переводим в мс по единице.
    const raw = getComputedStyle(root).getPropertyValue('--d-enter').trim();
    const D = (raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000) || 800;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / D);
      const l = stopLen * (1 - Math.pow(1 - k, 3));
      place(l);
      puffAt.forEach((p, i) => { if (l >= p) puffs.children[i]?.classList.add('is-on'); });
      if (k < 1) requestAnimationFrame(step);
      else flying = false;
    };
    requestAnimationFrame(step);
  }

  let timer = 0;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(build, 150);
  }).observe(root);

  const ready = document.fonts?.ready ?? Promise.resolve();
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    build();
    if (calm || mode === 'static') return;
    if (mode === 'load') fly();
    else {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          build();
          fly();
        }
      }, { threshold: 0.4 });
      io.observe(root.querySelector('[data-tone="poster"]') ?? root);
    }
  };
  ready.then(() => requestAnimationFrame(start));
  window.setTimeout(start, 1500);
}

export function initTrails() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(saveData);
  document.querySelectorAll<HTMLElement>('[data-trail]').forEach((root) => setup(root, calm));
}
