/**
 * IDR — Institute of Digital Risk
 * script.js — Enhanced interactions
 */

/* ═══════════════════════════════════════════════════════
   1. STICKY NAV + ACTIVE LINK
   ═══════════════════════════════════════════════════════ */
const header    = document.getElementById('site-header');
const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');
const hamburger = document.getElementById('hamburger');
const navList   = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveLink();
  updateScrollProgress();
}, { passive: true });

function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  navLinks.forEach(link => {
    const id      = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (!section) return;
    const top = section.offsetTop;
    const bot = top + section.offsetHeight;
    link.classList.toggle('active', scrollY >= top && scrollY < bot);
  });
}

hamburger.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ═══════════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════ */
const progressBar = document.getElementById('scroll-progress');

function updateScrollProgress() {
  if (!progressBar) return;
  const docH    = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docH > 0 ? (window.scrollY / docH) * 100 : 0;
  progressBar.style.width = percent + '%';
}

/* ═══════════════════════════════════════════════════════
   3. SMOOTH SCROLL
   ═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════════
   4. SCROLL REVEAL
   ═══════════════════════════════════════════════════════ */
const revealEls = document.querySelectorAll(
  '.reveal, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3, .reveal-delay-4'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════
   5. STAT COUNTER ANIMATION
   ═══════════════════════════════════════════════════════ */
const statNums = document.querySelectorAll('.stat-num[data-target]');

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 4);  // ease-out-quart
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

/* ═══════════════════════════════════════════════════════
   6. HERO CANVAS — animated grid with mouse reactivity
   ═══════════════════════════════════════════════════════ */
const canvas = document.getElementById('grid-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;

  // Track mouse position relative to canvas
  let mouseX = 0.5, mouseY = 0.5;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / W;
    mouseY = (e.clientY - r.top)  / H;
  }, { passive: true });

  function resizeCanvas() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  const COLS   = 22;
  const ROWS   = 16;
  const orange = 'rgba(255, 107, 0,';
  let offset   = 0;

  function drawGrid(ts) {
    ctx.clearRect(0, 0, W, H);
    offset = (ts * 0.018) % (H / ROWS);

    const cellW = W / COLS;
    const cellH = H / ROWS;

    // Mouse proximity brightens nearby grid lines slightly
    const mxPx = mouseX * W;
    const myPx = mouseY * H;

    ctx.lineWidth = 0.5;

    for (let c = 0; c <= COLS; c++) {
      const x       = c * cellW;
      const cx      = Math.abs(c / COLS - 0.5) * 2;
      const mDist   = Math.abs(x - mxPx) / W;
      const boost   = Math.max(0, 0.08 * (1 - mDist * 4));
      const alphaV  = Math.max(0, 0.18 - cx * 0.16) + boost;
      ctx.strokeStyle = `${orange} ${alphaV})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    for (let r = -1; r <= ROWS + 1; r++) {
      const y      = r * cellH + offset;
      const cy     = Math.abs(y / H - 0.5) * 2;
      const mDistY = Math.abs(y - myPx) / H;
      const boost  = Math.max(0, 0.06 * (1 - mDistY * 4));
      const alphaH = Math.max(0, 0.14 - cy * 0.1) + boost;
      ctx.strokeStyle = `${orange} ${alphaH})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Pulsing intersection dots
    const dotStep = 3;
    for (let c = 0; c <= COLS; c += dotStep) {
      for (let r = 0; r <= ROWS + 1; r += dotStep) {
        const x = c * cellW;
        const y = r * cellH + offset;
        if (y < -10 || y > H + 10) continue;

        const pulse  = 0.5 + 0.5 * Math.sin(ts * 0.001 + c * 0.7 + r * 0.5);
        // Extra glow near cursor
        const d      = Math.hypot(x - mxPx, y - myPx);
        const nearby = Math.max(0, 1 - d / 200);
        const alpha  = pulse * 0.45 + nearby * 0.3;
        const radius = pulse * 1.8 + nearby * 1.5;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${orange} ${Math.min(alpha, 0.9)})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(drawGrid);
  }
  requestAnimationFrame(drawGrid);
}

/* ═══════════════════════════════════════════════════════
   7. SERVICE CARDS — 3D tilt + mouse-follow glow
   ═══════════════════════════════════════════════════════ */
document.querySelectorAll('.service-card[data-tilt]').forEach(card => {
  const MAX_TILT = 8; // degrees

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const glow = card.querySelector('.card-glow');

    // Glow position
    const gx = e.clientX - rect.left;
    const gy = e.clientY - rect.top;
    if (glow) {
      glow.style.left = `${gx - 110}px`;
      glow.style.top  = `${gy - 110}px`;
    }

    // Tilt
    const cx = (gx / rect.width  - 0.5) * 2;  // -1 … +1
    const cy = (gy / rect.height - 0.5) * 2;

    const ry =  cx * MAX_TILT;  // rotate around Y
    const rx = -cy * MAX_TILT;  // rotate around X

    card.classList.remove('tilt-reset');
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  });

  card.addEventListener('mouseleave', () => {
    card.classList.add('tilt-reset');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

/* ═══════════════════════════════════════════════════════
   8. MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════════ */
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  const STRENGTH = 0.28;

  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) * STRENGTH;
    const dy   = (e.clientY - cy) * STRENGTH;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ═══════════════════════════════════════════════════════
   9. CONTACT FORM — validation + submit
   ═══════════════════════════════════════════════════════ */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input, textarea').forEach(f => f.classList.remove('error'));

    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');
    const msg   = form.querySelector('#message');
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.value.trim())              { name.classList.add('error');  valid = false; }
    if (!emailRx.test(email.value.trim())){ email.classList.add('error'); valid = false; }
    if (!msg.value.trim())               { msg.classList.add('error');   valid = false; }

    if (!valid) {
      // Shake animation on first error field
      const first = form.querySelector('.error');
      if (first) {
        first.style.animation = 'none';
        requestAnimationFrame(() => {
          first.style.animation = 'shake 0.4s var(--ease-out)';
        });
      }
      return;
    }

    const btn = form.querySelector('.btn-primary');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      form.querySelectorAll('.form-group').forEach(g => g.style.display = 'none');
      form.querySelector('.form-row').style.display     = 'none';
      form.querySelector('.form-actions').style.display = 'none';
      success.classList.add('visible');
    }, 1000);
  });

  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });
}

/* Shake keyframe injected via JS (keeps CSS clean) */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}`;
document.head.appendChild(shakeStyle);

/* ═══════════════════════════════════════════════════════
   10. PARALLAX ORBS — mouse movement
   ═══════════════════════════════════════════════════════ */
const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');

if (orb1 && orb2) {
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 30;
    my = (e.clientY / window.innerHeight - 0.5) * 20;
  }, { passive: true });

  (function parallaxLoop() {
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;
    orb1.style.transform = `translate(${cx}px, ${cy}px)`;
    orb2.style.transform = `translate(${-cx * 0.6}px, ${-cy * 0.6}px)`;
    requestAnimationFrame(parallaxLoop);
  })();
}

/* ═══════════════════════════════════════════════════════
   11. PIPELINE — stagger on reveal
   ═══════════════════════════════════════════════════════ */
const pipeline = document.querySelector('.pipeline');
if (pipeline) {
  const pipeObs = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    const steps = pipeline.querySelectorAll('.pipeline-step, .pipeline-arrow');
    steps.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateX(-12px)';
      el.style.transition = `opacity 0.55s ease ${i * 0.09}s, transform 0.55s ease ${i * 0.09}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity   = '1';
        el.style.transform = 'translateX(0)';
      }));
    });
    pipeObs.disconnect();
  }, { threshold: 0.5 });
  pipeObs.observe(pipeline);
}

/* ═══════════════════════════════════════════════════════
   12. LOGO ICON — subtle tilt on hover
   ═══════════════════════════════════════════════════════ */
document.querySelectorAll('.logo-icon').forEach(svg => {
  svg.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
  svg.addEventListener('mouseenter', () => { svg.style.transform = 'scale(1.1) rotate(10deg)'; });
  svg.addEventListener('mouseleave', () => { svg.style.transform = ''; });
});

/* ═══════════════════════════════════════════════════════
   13. SECTOR TAGS — staggered entrance
   ═══════════════════════════════════════════════════════ */
const tagContainer = document.querySelector('.sector-tags');
if (tagContainer) {
  const tagObs = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    tagContainer.querySelectorAll('.tag').forEach((tag, i) => {
      tag.style.opacity   = '0';
      tag.style.transform = 'scale(0.82) translateY(6px)';
      tag.style.transition = `opacity 0.45s ease ${i * 0.06}s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        tag.style.opacity   = '1';
        tag.style.transform = 'scale(1) translateY(0)';
      }));
    });
    tagObs.disconnect();
  }, { threshold: 0.3 });
  tagObs.observe(tagContainer);
}

/* ═══════════════════════════════════════════════════════
   14. AUDIENCE ITEMS — stagger on scroll
   ═══════════════════════════════════════════════════════ */
const audienceList = document.querySelector('.audience-list');
if (audienceList) {
  const aud = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    audienceList.querySelectorAll('.audience-item').forEach((item, i) => {
      // Reset inline styles set by CSS reveal, then re-animate with stagger
      item.style.opacity   = '0';
      item.style.transform = 'translateX(-16px)';
      item.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s var(--ease-out, cubic-bezier(0.16,1,0.3,1)) ${i * 0.12}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        item.style.opacity   = '1';
        item.style.transform = 'translateX(0)';
      }));
    });
    aud.disconnect();
  }, { threshold: 0.2 });
  aud.observe(audienceList);
}

/* ═══════════════════════════════════════════════════════
   15. CURSOR SPOTLIGHT on hero section
      Subtle radial highlight that tracks the cursor
   ═══════════════════════════════════════════════════════ */
const heroSection = document.getElementById('hero');
if (heroSection) {
  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position:absolute;
    width:500px;height:500px;
    border-radius:50%;
    background:radial-gradient(circle,rgba(255,107,0,0.06) 0%,transparent 65%);
    pointer-events:none;
    transform:translate(-50%,-50%);
    transition:opacity 0.4s;
    z-index:1;
    opacity:0;
  `;
  heroSection.appendChild(spotlight);

  heroSection.addEventListener('mousemove', e => {
    const rect = heroSection.getBoundingClientRect();
    spotlight.style.left    = (e.clientX - rect.left) + 'px';
    spotlight.style.top     = (e.clientY - rect.top)  + 'px';
    spotlight.style.opacity = '1';
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}
