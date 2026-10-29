// Can Ferron · «Compartim?»
// La portada se parte en dos por el eje, como la palmera de su reel: al bajar o al estirarla con el dedo o el ratón.
// El pan de trigo sarraceno se corta con el scroll (48 fotogramas de su reel). Horario en directo con la hora de Lloret
// y el próximo jueves de pan de fajol con el último momento para encargarlo.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const T = (es, ca, en, fr) => (window.I18N ? I18N.t(es, ca, en, fr) : es);
  const lang = () => document.documentElement.lang || 'es';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const inOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const LOC = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB', fr: 'fr-FR' };
  const ticker = (fn) => (window.gsap ? gsap.ticker.add(fn) : (function loop() { fn(); requestAnimationFrame(loop); })());

  /* ---------- horario con la hora de Lloret ---------- */
  const WD = [[540, 870], [990, 1200]], FS = [[540, 900], [990, 1200]];
  const WEEK = [[], WD, WD, WD, WD, FS, FS]; // 0 = domingo; minutos desde medianoche
  const DAY = {
    es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    ca: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  };
  function now() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: (+p.hour % 24) * 60 + +p.minute, y: +p.year, m: +p.month, d: +p.day };
  }
  const hm = (m) => { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return lang() === 'fr' ? `${h} h${mm === '00' ? '' : ' ' + mm}` : `${h}:${mm}`; };

  function status() {
    const n = now(), today = WEEK[n.dow];
    const cur = today.find(([a, b]) => n.min >= a && n.min < b);
    let long;
    if (cur) long = T(`Abierto ahora · hasta las ${hm(cur[1])}`, `Obert ara · fins a les ${hm(cur[1])}`, `Open now · until ${hm(cur[1])}`, `Ouvert · jusqu’à ${hm(cur[1])}`);
    else {
      const later = today.find(([a]) => a > n.min);
      if (later) long = T(`Cerrado · abrimos a las ${hm(later[0])}`, `Tancat · obrim a les ${hm(later[0])}`, `Closed · opens at ${hm(later[0])}`, `Fermé · ouvre à ${hm(later[0])}`);
      else {
        let k = 1; while (!WEEK[(n.dow + k) % 7].length) k++;
        const dd = (n.dow + k) % 7, t = hm(WEEK[dd][0][0]), day = DAY[lang()][dd];
        long = k === 1
          ? T(`Cerrado · mañana abrimos a las ${t}`, `Tancat · demà obrim a les ${t}`, `Closed · opens tomorrow at ${t}`, `Fermé · ouvre demain à ${t}`)
          : T(`Cerrado · abrimos el ${day} a las ${t}`, `Tancat · obrim ${day} a les ${t}`, `Closed · opens ${day} at ${t}`, `Fermé · ouvre ${day} à ${t}`);
      }
    }
    const short = cur ? T('Abierto', 'Obert', 'Open', 'Ouvert') : T('Cerrado', 'Tancat', 'Closed', 'Fermé');
    $$('.js-status').forEach((el) => {
      el.classList.toggle('is-open', !!cur);
      const a = $('.js-status-t', el), b = $('.js-status-s', el);
      if (a) a.textContent = long;
      if (b) b.textContent = short;
    });
    $$('.hours tr').forEach((tr) => tr.classList.toggle('is-today', tr.dataset.days.split(',').includes(String(n.dow))));
  }

  /* ---------- pan de fajol: los jueves, por encargo como mínimo el día antes (miércoles hasta las 20:00) ---------- */
  function fajol() {
    const el = $('.js-fajol'); if (!el) return;
    const n = now();
    let k = (4 - n.dow + 7) % 7;
    if (k === 0) k = 7;
    if (k === 1 && n.min >= 1200) k = 8;
    const base = Date.UTC(n.y, n.m - 1, n.d), f = new Intl.DateTimeFormat(LOC[lang()], { day: 'numeric', month: 'long', timeZone: 'UTC' });
    const D = f.format(new Date(base + k * 864e5)), W = f.format(new Date(base + (k - 1) * 864e5));
    el.textContent = k === 1
      ? T(`Próximo: mañana, jueves ${D}. Aún estás a tiempo: encárgalo hoy antes de las 20:00.`, `El pròxim: demà, dijous ${D}. Encara hi ets a temps: encarrega’l avui abans de les 20:00.`, `Next one: tomorrow, Thursday ${D}. You can still order it today before 8 pm.`, `Prochain : demain, jeudi ${D}. Commandez-le aujourd’hui avant 20 h.`)
      : T(`Próximo: jueves ${D}. Encárgalo antes del miércoles ${W}, a las 20:00.`, `El pròxim: dijous ${D}. Encarrega’l abans de dimecres ${W}, a les 20:00.`, `Next one: Thursday ${D}. Order it by Wednesday ${W}, 8 pm.`, `Prochain : jeudi ${D}. Commandez-le avant mercredi ${W}, 20 h.`);
  }

  /* ---------- PORTADA: la palmera del reel en stop-motion y la portada que se parte por el eje ---------- */
  function hero() {
    const sec = $('.hero'), A = $('#heroL'); if (!sec || !A) return;
    const palms = [$('.palm', A)];
    let pose = 1;
    const setPose = (p) => { if (p === pose) return; pose = p; palms.forEach((x) => { x.dataset.pose = p; }); };
    if (reduce) { document.documentElement.classList.add('no-split'); return; }

    // la mitad derecha es una copia decorativa de la capa (título y palmera), recortada a su mitad
    const B = A.cloneNode(true);
    B.removeAttribute('id'); B.classList.replace('hero-l', 'hero-r'); B.setAttribute('aria-hidden', 'true'); B.inert = true;
    $$('[id]', B).forEach((e) => e.removeAttribute('id'));
    $$('[data-i18n], [data-i18n-attr]', B).forEach((e) => { e.removeAttribute('data-i18n'); e.removeAttribute('data-i18n-attr'); });
    $$('img', B).forEach((i) => { i.alt = ''; });
    A.after(B); palms.push($('.palm', B));

    const sideL = $('.side-l'), sideR = $('.side-r'), under = $('.hero-under img'), hit = $('.palm-hit'), root = document.documentElement;
    // el reel: cerrada → a medio partir → partida → a medio partir
    const SEQ = [[1, 900], [2, 520], [3, 760], [2, 560]];
    let si = 0, sAt = performance.now(), visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(sec);

    // estirar la palmera: el muelle la devuelve a su sitio al soltar
    let drag = false, x0 = 0, goal = 0, hover = 0, pull = 0, pv = 0;
    hit.addEventListener('pointerdown', (e) => { drag = true; x0 = e.clientX; goal = 0; hit.setPointerCapture(e.pointerId); sec.classList.add('dragging'); });
    hit.addEventListener('pointermove', (e) => { if (drag) goal = clamp(Math.abs(e.clientX - x0) / 230, 0, 1.2); });
    const release = () => { if (!drag) return; drag = false; goal = 0; sec.classList.remove('dragging'); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => hit.addEventListener(ev, release));
    if (fine) { hit.addEventListener('pointerenter', () => { hover = 1; }); hit.addEventListener('pointerleave', () => { hover = 0; }); }

    let last = performance.now(), on = false, past = false;
    ticker(() => {
      const t = performance.now(), dt = Math.min(.05, (t - last) / 1000); last = t;
      const r = sec.getBoundingClientRect();
      if (!visible && !drag && Math.abs(pull) < .001) { if (!past && r.bottom < 0) { past = true; root.classList.add('past-hero'); } return; }
      const sp = clamp(-r.top / Math.max(1, sec.offsetHeight - innerHeight));
      const g = drag ? goal : hover * .08;
      pv += ((g - pull) * 160 - pv * 13) * dt; pull += pv * dt;
      const crack = Math.max(inOut(clamp(sp / .26)), clamp(pull, 0, 1.25) * .5);
      const slide = inOut(clamp((sp - .26) / .6));
      const th = crack * 7, d = slide * 66;
      const o = crack > .003 || slide > 0;
      if (o !== on) { on = o; sec.classList.toggle('splitting', o); }
      A.style.transform = `translate3d(${-d}vw,0,0) rotate(${-th}deg)`;
      B.style.transform = `translate3d(${d}vw,0,0) rotate(${th}deg)`;
      const sx = crack * 6 + d * 1.1; // los textos se apartan en cuanto se abre la grieta
      sideL.style.transform = `translate3d(${-sx}vw,0,0) rotate(${-th * .4}deg)`;
      sideR.style.transform = `translate3d(${sx}vw,0,0) rotate(${th * .4}deg)`;
      sideL.style.opacity = sideR.style.opacity = String(1 - clamp(slide * 1.7));
      under.style.scale = String(1.14 - .14 * Math.max(slide, crack * .3));
      const ph = sp > .55;
      if (ph !== past) { past = ph; root.classList.toggle('past-hero', ph); }
      if (crack > .03 || drag) setPose(crack < .2 ? 2 : 3);
      else if (visible) { if (t - sAt > SEQ[si][1]) { si = (si + 1) % SEQ.length; sAt = t; } setPose(SEQ[si][0]); }
    });
  }

  /* ---------- PAN: los fotogramas del reel se suceden con el scroll ---------- */
  function bread() {
    const sec = $('.pa'), cv = $('.pa-cv'), poster = $('.pa-poster'), stage = $('.pa-stage'); if (!sec || !cv) return;
    const N = 48, src = (i) => `assets/img/pa/pa-${String(i).padStart(2, '0')}.webp`;
    if (reduce) { poster.src = src(40); return; }
    const g = cv.getContext('2d'), imgs = [];
    let cur = -1, want = 0, started = false;
    const draw = () => {
      for (let k = 0; k < N; k++) for (const i of [want - k, want + k]) {
        const im = imgs[i];
        if (im && im.complete && im.naturalWidth) { if (i !== cur) { g.drawImage(im, 0, 0, cv.width, cv.height); cur = i; cv.classList.add('on'); } return; }
      }
    };
    const load = () => { if (started) return; started = true; for (let i = 0; i < N; i++) { const im = new Image(); im.decoding = 'async'; im.onload = draw; im.src = src(i); imgs[i] = im; } };
    new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) load(); }, { rootMargin: '140% 0px' }).observe(sec);
    const pinned = matchMedia('(min-width: 981px)');
    ticker(() => {
      const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      let p;
      if (pinned.matches && !reduce) p = clamp(-r.top / Math.max(1, sec.offsetHeight - innerHeight) * 1.08);
      else { const s = stage.getBoundingClientRect(); p = clamp((innerHeight * .82 - s.top) / (innerHeight * .82)); }
      const w = Math.round(p * (N - 1)); if (w !== want) { want = w; draw(); }
    });
  }

  /* ---------- entradas en espejo (todo se acerca o se abre desde el eje) ---------- */
  function reveals() {
    if (reduce || !window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);
    const shift = Math.min(70, innerWidth * .07);
    $$('[data-from]').forEach((el) => {
      const s = el.dataset.from === 'l' ? -1 : 1;
      gsap.fromTo(el, { x: shift * s, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    // los dos objetos del díptico se mueven en espejo
    gsap.utils.toArray('.ob img').forEach((im) => gsap.fromTo(im, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.intro', start: 'top bottom', end: 'bottom top', scrub: true } }));
    // vitrina: cada foto se abre desde su centro; primero la columna del eje y luego las parejas
    $$('.vit .t').forEach((t) => {
      const o = +t.style.getPropertyValue('--o') || 0, st = { trigger: '.vit', start: 'top 80%' };
      gsap.fromTo(t, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', delay: o * .16, scrollTrigger: st });
      gsap.fromTo($('img', t), { scale: 1.22 }, { scale: 1, duration: 2.2, ease: 'expo.out', delay: o * .16, scrollTrigger: st });
      gsap.fromTo($('.tag', t), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', delay: .75 + o * .16, scrollTrigger: st });
    });
    // chocolate: las dos tabletas empiezan juntas en el eje y se separan como una rajola que se parte
    const dl = $('.dub-l'), dr = $('.dub-r'), dc = $('.dub-c');
    if (dl && dr && dc) {
      const gap = () => { const a = dl.getBoundingClientRect(), b = dr.getBoundingClientRect(); return (b.left - a.right) / 2; };
      gsap.timeline({ scrollTrigger: { trigger: '.dub', start: 'top 85%', end: 'center 52%', scrub: .7, invalidateOnRefresh: true } })
        .fromTo(dl, { x: () => gap(), rotate: 2.5 }, { x: 0, rotate: 0, ease: 'none' }, 0)
        .fromTo(dr, { x: () => -gap(), rotate: -2.5 }, { x: 0, rotate: 0, ease: 'none' }, 0)
        .fromTo(dc, { autoAlpha: 0, scale: .95 }, { autoAlpha: 1, scale: 1, ease: 'none', duration: .6 }, .4);
    }
    // temporada: cada foto se abre desde el eje hacia fuera
    const tst = { trigger: '.tmp', start: 'top 80%' };
    gsap.fromTo('.tm-l .tm-f', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: tst });
    gsap.fromTo('.tm-r .tm-f', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: tst });
    gsap.fromTo('.tm-f img', { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'expo.out', scrollTrigger: tst });
    // mapa: dos puertas que se abren
    const mst = { trigger: '.map-w', start: 'top 82%' };
    gsap.to('.door-l', { xPercent: -101, duration: 1.7, ease: 'expo.inOut', scrollTrigger: mst });
    gsap.to('.door-r', { xPercent: 101, duration: 1.7, ease: 'expo.inOut', scrollTrigger: mst });
    // pie: el sello gira un poco con el scroll y el nombre sube
    gsap.fromTo('.seal', { rotate: -16 }, { rotate: 10, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.fromTo('.foot-w > span', { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.6, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.foot-w', start: 'top 95%' } });
  }

  /* ---------- menú del móvil ---------- */
  function menu() {
    const btn = $('.menu-btn'), m = $('#menu'); if (!btn || !m) return;
    const label = () => (m.hidden ? T('Menú', 'Menú', 'Menu', 'Menu') : T('Cerrar', 'Tancar', 'Close', 'Fermer'));
    const set = (open) => {
      m.hidden = !open; btn.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('menu-open', open);
      $('span', btn).textContent = label();
      if (window.P && P.lenis) open ? P.lenis.stop() : P.lenis.start();
    };
    btn.addEventListener('click', () => set(m.hidden));
    m.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !m.hidden) { set(false); btn.focus(); } });
    document.addEventListener('langchange', () => { $('span', btn).textContent = label(); });
  }

  document.addEventListener('langchange', () => { status(); fajol(); });
  const init = () => {
    status(); fajol(); setInterval(() => { status(); fajol(); }, 30000);
    hero(); bread(); menu(); reveals();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
