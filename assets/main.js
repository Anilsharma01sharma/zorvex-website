// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}

// Portfolio filters
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.project').forEach((p) => {
      p.classList.toggle('hidden', f !== 'all' && p.dataset.cat !== f);
    });
  });
});

// Footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Floating chat widget
const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-widget');
const chatOptions = document.getElementById('chat-options');
if (chatToggle && chatWidget && chatOptions) {
  chatToggle.addEventListener('click', () => {
    const open = !chatWidget.classList.contains('open');
    chatWidget.classList.toggle('open', open);
    chatOptions.hidden = !open;
    chatToggle.setAttribute('aria-expanded', open);
    chatToggle.setAttribute('aria-label', open ? 'Hide chat options' : 'Open chat options');
  });
}

// Count-up stats: numbers count from 1 to their final value when scrolled into view
(() => {
  const els = document.querySelectorAll('.stats strong, .result-card strong, .metric strong, .result-banner strong');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [];
  els.forEach((el) => {
    const raw = el.textContent.trim();
    const m = raw.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m) return;
    const [, prefix, num, suffix] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] || '').length;
    const commas = num.includes(',');
    items.push({ el, prefix, suffix, target, decimals, commas, raw });
  });
  if (!items.length || reduce || !('IntersectionObserver' in window)) return;
  const fmt = (v, it) => {
    let s = v.toFixed(it.decimals);
    if (it.commas) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: it.decimals, maximumFractionDigits: it.decimals });
    return it.prefix + s + it.suffix;
  };
  const run = (it) => {
    const start = Math.min(1, it.target), dur = 1800, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      it.el.textContent = p < 1 ? fmt(start + (it.target - start) * eased, it) : it.raw;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  items.forEach((it) => { it.el.textContent = fmt(Math.min(1, it.target), it); });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const it = items.find((i) => i.el === e.target);
      if (it) run(it);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  items.forEach((it) => io.observe(it.el));
})();
