// All interactive behaviour for the site: page transitions, scroll reveals,
// counters, hero parallax, About cards, Instagram card, cursor and lightbox.

const ROUTES = { home: '/', gtm: '/gtm', 'video-design': '/video-design', contact: '/#contact' };
const LABELS = { '/': 'Home', '/gtm': 'GTM Engineer', '/video-design': 'Video & Design' };
const EMBED_LOOM = true; // Loom plays inside the full-screen viewer

export function pageName(pathname) {
  if (pathname.startsWith('/gtm')) return 'gtm';
  if (pathname.startsWith('/video-design')) return 'video-design';
  return 'home';
}

function countUp(el) {
  const end = +el.dataset.count;
  const dec = (el.dataset.count.split('.')[1] || '').length;
  const suf = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1400;
  const step = (t) => {
    const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = (end * e).toFixed(dec) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function splitWords(root) {
  root.querySelectorAll('[data-words]').forEach((h) => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    const walk = (n) => {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((t) => {
            if (!t.trim()) { f.append(t); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = t;
            w.append(s); f.append(w);
          });
          c.replaceWith(f);
        } else walk(c);
      });
    };
    walk(h);
    h.querySelectorAll('.w>span').forEach((s, i) => (s.style.transitionDelay = i * 0.07 + 's'));
  });
}

/* ---------------- global (runs once) ---------------- */
let globalReady = false;
let state = { page: 'home', router: null };

export function initGlobal(router) {
  state.router = router;
  if (globalReady) return;
  globalReady = true;

  const nav = document.getElementById('nav');
  const fab = document.getElementById('homefab');
  const wipe = document.getElementById('wipe');
  const wipeTxt = document.getElementById('wipeTxt');

  // nav background + floating home button
  const tick = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    fab.classList.toggle('show', state.page !== 'home' && y > 400);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // page transitions
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const go = a.dataset.go;
    const href = ROUTES[go] || '/';
    const [path, hash] = href.split('#');
    if (path === window.location.pathname) {
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    wipeTxt.textContent = LABELS[path] || '';
    wipe.className = 'wipe in';
    window.__pendingHash = hash || null;
    setTimeout(() => state.router.push(href, { scroll: false }), 460);
  });

  initCursor();
  initLightbox();
}

export function finishTransition() {
  const wipe = document.getElementById('wipe');
  if (wipe && wipe.classList.contains('in')) {
    wipe.className = 'wipe out';
    setTimeout(() => (wipe.className = 'wipe'), 520);
  }
}

/* ---------------- per page ---------------- */
export function initPage(name) {
  state.page = name;
  const cleanups = [];
  const root = document.querySelector('main.page');
  if (!root) return () => {};

  document.querySelectorAll('.pill a').forEach((a) => a.classList.toggle('on', a.dataset.go === name));

  // scroll position / hash
  const hash = window.__pendingHash || (window.location.hash || '').slice(1);
  window.__pendingHash = null;
  if (hash && document.getElementById(hash)) {
    setTimeout(() => document.getElementById(hash).scrollIntoView({ behavior: 'smooth' }), 120);
  } else {
    window.scrollTo(0, 0);
  }

  splitWords(root);

  // reveals + counters
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    }),
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  root.querySelectorAll('.rv,.rvx,[data-words]').forEach((el) => { el.classList.remove('in'); io.observe(el); });
  cleanups.push(() => io.disconnect());

  document.body.classList.remove('loaded');
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('loaded')));

  if (name === 'home') cleanups.push(initHome(root));
  cleanups.push(initVideoHover(root));

  return () => cleanups.forEach((f) => f && f());
}

function initHome(root) {
  let alive = true;
  const cleanups = [];

  // hero: cards fly out on scroll + mouse parallax
  const hero = document.getElementById('hero');
  const me = document.getElementById('me');
  const cards = [...hero.querySelectorAll('[data-out]')];
  let mx = 0, my = 0;
  const onMove = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
  hero.addEventListener('mousemove', onMove);
  const frame = () => {
    if (!alive) return;
    const p = Math.min(window.scrollY / 700, 1);
    cards.forEach((c) => {
      const [dx, dy] = c.dataset.out.split(',').map(Number), r = +(c.dataset.r || 0), d = +(c.dataset.d || 0);
      c.style.transform = `translate(${dx * p * 260 + mx * d}px,${dy * p * 200 + my * d}px) rotate(${r + r * p * 1.5}deg)`;
      c.style.opacity = p > 0 ? Math.max(0, 1 - p * 1.1) : '';
    });
    me.style.transform = `scale(${1 + p * 0.12})`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // About fact cards: flip-in, tilt, parallax
  const facts = [...root.querySelectorAll('.fact')];
  const fio = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      fio.unobserve(e.target);
    }),
    { threshold: 0.25 }
  );
  facts.forEach((f) => fio.observe(f));
  cleanups.push(() => fio.disconnect());
  root.querySelectorAll('.fi').forEach((fi) => {
    fi.addEventListener('mousemove', (e) => {
      const r = fi.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      fi.style.transform = `rotateY(${(x - 0.5) * 16}deg) rotateX(${(0.5 - y) * 16}deg) translateZ(10px)`;
      fi.style.setProperty('--mx', x * 100 + '%');
      fi.style.setProperty('--my', y * 100 + '%');
    });
    fi.addEventListener('mouseleave', () => (fi.style.transform = ''));
  });
  const box = document.getElementById('facts');
  const par = () => {
    if (!alive) return;
    if (box && innerWidth > 900) {
      const r = box.getBoundingClientRect(), p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      facts.forEach((f) => (f.style.translate = `0 ${p * +f.dataset.speed}px`));
    }
    requestAnimationFrame(par);
  };
  requestAnimationFrame(par);

  cleanups.push(initInsta(root));
  initContactForm(root);

  return () => { alive = false; hero.removeEventListener('mousemove', onMove); cleanups.forEach((f) => f && f()); };
}

function initInsta(root) {
  const card = root.querySelector('#igcard');
  if (!card) return null;
  const user = card.querySelector('#iguser');
  const T = root.querySelector('#toasts'), H = root.querySelector('#hearts');
  const timers = [];
  let typed = false, running = false;

  const typeUser = () => {
    if (typed) return; typed = true;
    const t = user.dataset.text; let i = 0; user.textContent = '';
    const iv = setInterval(() => {
      user.textContent = t.slice(0, ++i);
      if (i >= t.length) { clearInterval(iv); setTimeout(() => (user.style.borderRight = 'none'), 1200); }
    }, 45);
    timers.push(() => clearInterval(iv));
  };
  const visible = () => { const r = card.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  const msgs = [
    ['❤️', '#FDE2E7', 'New like', 'on "Job search on autopilot"'],
    ['👤', '#E3ECF7', 'New follower', 'just followed you'],
    ['💬', '#F6EBCF', 'INSTALL', 'new comment on Ep 07'],
    ['🔁', '#E8F0E0', 'Reel shared', '"5 commands every beginner"'],
    ['📩', '#E5E2F6', 'DM', '"Send me the link 🙏"'],
  ];
  let k = 0;
  const toast = () => {
    const m = msgs[k++ % msgs.length];
    const d = document.createElement('div'); d.className = 'toast';
    d.innerHTML = `<span class="ti" style="background:${m[1]}">${m[0]}</span><div><b>${m[2]}</b><small>${m[3]}</small></div>`;
    T.prepend(d);
    while (T.children.length > 3) T.lastChild.remove();
    setTimeout(() => d.remove(), 4300);
  };
  const heart = () => {
    const h = document.createElement('span'); h.className = 'heart';
    h.textContent = ['❤️', '🤍', '💛', '💜'][Math.floor(Math.random() * 4)];
    h.style.left = Math.random() * 20 + 'px';
    h.style.animationDuration = 2.4 + Math.random() * 1.4 + 's';
    H.append(h); setTimeout(() => h.remove(), 4000);
  };
  const start = () => {
    if (running) return; running = true;
    const t0 = setTimeout(() => {
      toast();
      const a = setInterval(() => visible() && toast(), 2600);
      const b = setInterval(() => visible() && heart(), 700);
      timers.push(() => clearInterval(a), () => clearInterval(b));
    }, 2200);
    timers.push(() => clearTimeout(t0));
  };
  const mo = new MutationObserver(() => {
    if (card.classList.contains('in')) { setTimeout(typeUser, 500); start(); }
  });
  mo.observe(card, { attributes: true, attributeFilter: ['class'] });

  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.classList.add('tilt');
    card.style.transform = `perspective(1200px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; setTimeout(() => card.classList.remove('tilt'), 250); });
  card.querySelectorAll('.post').forEach((p) => p.addEventListener('mouseenter', () => { for (let i = 0; i < 3; i++) setTimeout(heart, i * 120); }));

  return () => { mo.disconnect(); timers.forEach((f) => f()); };
}

function initVideoHover(root) {
  root.querySelectorAll('.vid').forEach((v) => {
    const vd = v.querySelector('video'); if (!vd) return;
    v.addEventListener('mouseenter', () => { vd.preload = 'auto'; vd.play().catch(() => {}); });
    v.addEventListener('mouseleave', () => vd.pause());
  });
  return null;
}

/* ---------------- cursor ---------------- */
function initCursor() {
  if (!matchMedia('(pointer:fine)').matches) return;
  document.documentElement.classList.add('cc');
  const c = document.getElementById('cur');
  let x = -100, y = -100, cx = x, cy = y;
  addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    const t = e.target, z = t.closest && t.closest('[data-cur]'), m = z ? z.dataset.cur : '';
    c.classList.toggle('m-star', m === 'star');
    c.classList.toggle('m-cam', m === 'cam');
    c.classList.toggle('hov', !!(t.closest && t.closest('a,button,[data-go],.fi,.loom,.vid,label')));
  });
  addEventListener('mousedown', () => {
    c.classList.add('down');
    if (c.classList.contains('m-cam')) { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); }
  });
  addEventListener('mouseup', () => c.classList.remove('down'));
  document.addEventListener('mouseleave', () => (c.style.opacity = 0));
  document.addEventListener('mouseenter', () => (c.style.opacity = 1));
  const loop = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
  loop();
}

/* ---------------- lightbox ---------------- */
function initLightbox() {
  const lb = document.getElementById('lb'), lbM = document.getElementById('lbM'), lbExt = document.getElementById('lbExt');
  const cur = document.getElementById('cur');
  const open = (el) => {
    if (el.dataset.loom && !EMBED_LOOM) { window.open(el.dataset.loom, '_blank', 'noopener'); return; }
    document.getElementById('lbT').textContent = el.dataset.title || '';
    document.getElementById('lbS').innerHTML = el.dataset.sub || '';
    lbM.innerHTML = '';
    if (el.dataset.loom) {
      const id = el.dataset.loom.split('/share/')[1];
      lbExt.style.display = ''; lbExt.href = el.dataset.loom;
      lbM.innerHTML = `<iframe src="https://www.loom.com/embed/${id}?autoplay=1&hide_owner=true&hide_share=true&hideEmbedTopBar=true" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    } else if (el.dataset.img) {
      lbExt.style.display = 'none';
      lbM.innerHTML = `<img src="${el.dataset.img}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain">`;
    } else {
      lbExt.style.display = 'none';
      const v = document.createElement('video');
      v.src = el.dataset.video; v.controls = true; v.autoplay = true; v.playsInline = true;
      lbM.append(v); v.play().catch(() => {});
    }
    lb.classList.add('open'); cur.style.visibility = 'hidden';
  };
  const close = () => {
    lb.classList.remove('open'); cur.style.visibility = '';
    setTimeout(() => (lbM.innerHTML = ''), 400);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-loom],[data-video],[data-img]');
    if (t && !t.closest('#lb')) { e.preventDefault(); open(t); }
  });
  document.getElementById('lbX').onclick = close;
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.getElementById('lbFs').onclick = () => {
    try { (lbM.requestFullscreen || lbM.webkitRequestFullscreen).call(lbM).catch(() => {}); } catch (e) {}
  };
}

/* ---------------- contact form ---------------- */
// Sends via FormSubmit (formsubmit.co) straight to the inbox below.
// The very first message triggers a one-time "Activate form" email from FormSubmit.
const CONTACT_EMAIL = 'iamvishnuvardhan03@gmail.com';
function initContactForm(root) {
  const f = root.querySelector('#cform'); if (!f || f.dataset.ready) return; f.dataset.ready = '1';
  const btn = f.querySelector('.csend'), lbl = btn.querySelector('.lbl'), st = f.querySelector('#cstatus');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    f.querySelectorAll('[required]').forEach((el) => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      el.closest('.fld').classList.toggle('err', bad); if (bad) ok = false;
    });
    if (!ok) { st.className = 'cstatus bad'; st.textContent = 'Please fill in your name, a valid email and a message.'; return; }
    if (f._honey.value) return;
    const data = Object.fromEntries(new FormData(f));
    btn.classList.add('busy'); lbl.textContent = 'Sending…'; st.className = 'cstatus'; st.textContent = '';
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, _subject: `Portfolio: ${data.topic} — ${data.name}`, _replyto: data.email, _template: 'table', _captcha: 'false' }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) === 'false') throw new Error(j.message || 'failed');
      btn.classList.remove('busy'); btn.classList.add('done'); lbl.textContent = 'Sent ✓';
      st.className = 'cstatus ok'; st.textContent = "Thanks! I'll get back to you soon.";
      f.reset();
      setTimeout(() => { btn.classList.remove('done'); lbl.textContent = 'Send message'; }, 4000);
    } catch (err) {
      btn.classList.remove('busy'); lbl.textContent = 'Send message';
      st.className = 'cstatus bad';
      st.innerHTML = `Couldn't send right now — email me at <a href="mailto:${CONTACT_EMAIL}" style="text-decoration:underline">${CONTACT_EMAIL}</a>.`;
    }
  });
  f.querySelectorAll('input,textarea').forEach((el) => el.addEventListener('input', () => el.closest('.fld')?.classList.remove('err')));
}
