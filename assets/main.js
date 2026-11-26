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
