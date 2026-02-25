/* ================================================
   PET-APP.JS — Shared app logic: toasts, modals, utils
   ================================================ */

/* ─── Toast ──────────────────────────────────────── */
const TOAST_ICONS = { success: '✅', error: '❌', warning: '⚠️', info: '💡', love: '❤️', paw: '🐾' };
const TOAST_COLORS = { success: '#00c9a7', error: '#fd79a8', warning: '#fd9644', info: '#7b6ff0', love: '#fd79a8', paw: '#7b6ff0' };

function showToast(title, msg, type = 'info', duration = 3200) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'toast-wrap';
        document.body.appendChild(wrap);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.setProperty('--toast-color', TOAST_COLORS[type] || TOAST_COLORS.info);
    toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] || '💡'}</div>
    <div>
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>`;
    wrap.appendChild(toast);
    setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 400); }, duration);
}

/* ─── Modal ──────────────────────────────────────── */
function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
    if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
        const m = e.target.closest('.modal-overlay');
        if (m) closeModal(m.id);
    }
    if (e.target.dataset.closeModal) closeModal(e.target.dataset.closeModal);
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id)); }
});

/* ─── Tag / multi-select ─────────────────────────── */
function initTagButtons(containerSel, multiple = true) {
    document.querySelectorAll(containerSel + ' .tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest(containerSel);
            const isNone = btn.dataset.val === 'None';

            if (!multiple) {
                container.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                return;
            }

            if (isNone) {
                container.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                container.querySelector('[data-val="None"]')?.classList.remove('active');
                btn.classList.toggle('active');
                if (!container.querySelector('.tag-btn.active')) {
                    container.querySelector('[data-val="None"]')?.classList.add('active');
                }
            }
        });
    });
}

function getTagValues(containerSel) {
    return [...document.querySelectorAll(containerSel + ' .tag-btn.active')].map(b => b.dataset.val);
}

/* ─── Score bar animation ────────────────────────── */
function animateScoreBars() {
    document.querySelectorAll('.score-fill').forEach(bar => {
        const target = bar.dataset.target || 0;
        setTimeout(() => { bar.style.width = target + '%'; }, 100);
    });
}

/* ─── Number counter animation ───────────────────── */
function animateCounter(el, target, duration = 1200, suffix = '') {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = Math.floor(start) + suffix;
        if (start >= target) clearInterval(timer);
    }, 16);
}

/* ─── Paw particles (background ambiance) ───────── */
function spawnPawParticles() {
    const paws = ['🐾', '🐾', '🐾'];
    paws.forEach((emoji, i) => {
        const el = document.createElement('div');
        el.className = 'paw-particle';
        el.textContent = emoji;
        el.style.left = (Math.random() * 100) + 'vw';
        el.style.animationDuration = (6 + Math.random() * 8) + 's';
        el.style.animationDelay = (i * 3) + 's';
        el.style.fontSize = (14 + Math.random() * 12) + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 20000);
    });
    setInterval(spawnPawParticles, 6000);
}

/* ─── Breadcrumb active ──────────────────────────── */
function setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });
}

/* ─── Initialize on page load ────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Start paw particles on landing/hero pages
    if (document.querySelector('.hero')) spawnPawParticles();

    // Score bars
    setTimeout(animateScoreBars, 300);
});
