/**
 * IDR — Institute of Digital Risk
 * script.js — Interactions, animations, canvas grid
 */

/* ═══════════════════════════════════════════════════════
   1. STICKY NAV + ACTIVE LINK
   ═══════════════════════════════════════════════════════ */
const header      = document.getElementById('site-header');
const navLinks    = document.querySelectorAll('.nav-link[href^="#"]');
const hamburger   = document.getElementById('hamburger');
const navList     = document.getElementById('nav-links');

// Scroll header style
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveLink();
}, { passive: true });

// Highlight nav link based on section in view
function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  navLinks.forEach(link => {
    const targetId = link.getAttribute('href').slice(1);
    const section  = document.getElementById(targetId);
    if (!section) return;
    const top = section.offsetTop;
    const bot = top + section.offsetHeight;
    link.classList.toggle('active', scrollY >= top && scrollY < bot);
  });
}

// Hamburger toggle
hamburger.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close menu on link click (mobile)
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

/* ═══════════════════════════════════════════════════════
   2. SMOOTH SCROLL (cross-browser helper)
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
   3. SCROLL REVEAL — IntersectionObserver
   ═══════════════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3, .reveal-delay-4');

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
   4. STAT COUNTER ANIMATION
   ═══════════════════════════════════════════════════════ */
const statNums = document.querySelectorAll('.stat-num[data-target]');

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out-quart
    const eased = 1 - Math.pow(1 - progress, 4);
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
   5. HERO GRID CANVAS — animated perspective grid
   ═══════════════════════════════════════════════════════ */
const canvas = document.getElementById('grid-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, animId;

  function resizeCanvas() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // Grid config
  const COLS   = 22;
  const ROWS   = 16;
  const orange = 'rgba(255, 107, 0,';

  let offset = 0;  // vertical scroll offset for moving grid

  function drawGrid(ts) {
    ctx.clearRect(0, 0, W, H);

    // Slow drift
    offset = (ts * 0.018) % (H / ROWS);

    const cellW = W / COLS;
    const cellH = H / ROWS;

    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let c = 0; c <= COLS; c++) {
      const x = c * cellW;
      // Fade sides
      const cx     = Math.abs(c / COLS - 0.5) * 2;   // 0 center → 1 edge
      const alphaV = Math.max(0, 0.18 - cx * 0.16);
      ctx.strokeStyle = `${orange} ${alphaV})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Horizontal lines (moving downward)
    for (let r = -1; r <= ROWS + 1; r++) {
      const y     = r * cellH + offset;
      const cy    = Math.abs(y / H - 0.5) * 2;
      const alphaH = Math.max(0, 0.14 - cy * 0.1);
      ctx.strokeStyle = `${orange} ${alphaH})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Glow intersection dots (animated)
    const dotStep = 3; // every 3rd intersection
    for (let c = 0; c <= COLS; c += dotStep) {
      for (let r = 0; r <= ROWS + 1; r += dotStep) {
        const x = c * cellW;
        const y = r * cellH + offset;
        if (y < -10 || y > H + 10) continue;

        // Pulse based on time + position
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.001 + c * 0.7 + r * 0.5);
        const alpha = pulse * 0.45;
        const radius = pulse * 1.8;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${orange} ${alpha})`;
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(drawGrid);
  }

  animId = requestAnimationFrame(drawGrid);
}

/* ═══════════════════════════════════════════════════════
   6. SERVICE CARD — mouse-follow glow
   ═══════════════════════════════════════════════════════ */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const glow = card.querySelector('.card-glow');
    if (!glow) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left = `${x - 100}px`;
    glow.style.top  = `${y - 100}px`;
  });
});

/* ═══════════════════════════════════════════════════════
   7. CONTACT FORM — validation + submit
   ═══════════════════════════════════════════════════════ */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('input, textarea').forEach(f => f.classList.remove('error'));

    // Validate name
    const name = form.querySelector('#name');
    if (!name.value.trim()) { name.classList.add('error'); valid = false; }

    // Validate email
    const email = form.querySelector('#email');
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.value.trim())) { email.classList.add('error'); valid = false; }

    // Validate message
    const msg = form.querySelector('#message');
    if (!msg.value.trim()) { msg.classList.add('error'); valid = false; }

    if (!valid) return;

    // Success state
    const btn = form.querySelector('.btn-primary');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      form.querySelectorAll('.form-group').forEach(g => g.style.display = 'none');
      form.querySelector('.form-row').style.display  = 'none';
      form.querySelector('.form-actions').style.display = 'none';
      success.classList.add('visible');
    }, 1000);
  });

  // Remove error class on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });
}

/* ═══════════════════════════════════════════════════════
   8. PARALLAX ORBS — subtle mouse parallax
   ═══════════════════════════════════════════════════════ */
const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');

if (orb1 && orb2) {
  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 30;
    my = (e.clientY / window.innerHeight - 0.5) * 20;
  }, { passive: true });

  function parallaxLoop() {
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;
    orb1.style.transform = `translate(${cx}px, ${cy}px)`;
    orb2.style.transform = `translate(${-cx * 0.6}px, ${-cy * 0.6}px)`;
    requestAnimationFrame(parallaxLoop);
  }
  parallaxLoop();
}

/* ═══════════════════════════════════════════════════════
   9. PIPELINE — stagger on reveal
   ═══════════════════════════════════════════════════════ */
const pipeline = document.querySelector('.pipeline');
if (pipeline) {
  const pipeObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const steps = pipeline.querySelectorAll('.pipeline-step, .pipeline-arrow');
      steps.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-10px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
          });
        });
      });
      pipeObserver.disconnect();
    }
  }, { threshold: 0.5 });
  pipeObserver.observe(pipeline);
}

/* ═══════════════════════════════════════════════════════
   10. LOGO — small subtle rotation on hover
   ═══════════════════════════════════════════════════════ */
const logoIcons = document.querySelectorAll('.logo-icon, .lv-svg');
logoIcons.forEach(svg => {
  svg.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
  svg.addEventListener('mouseenter', () => { svg.style.transform = 'scale(1.08) rotate(8deg)'; });
  svg.addEventListener('mouseleave', () => { svg.style.transform = '';  });
});

/* ═══════════════════════════════════════════════════════
   11. SECTOR TAGS — staggered entrance
   ═══════════════════════════════════════════════════════ */
const tagContainer = document.querySelector('.sector-tags');
if (tagContainer) {
  const tagObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const tags = tagContainer.querySelectorAll('.tag');
      tags.forEach((tag, i) => {
        tag.style.opacity = '0';
        tag.style.transform = 'scale(0.85)';
        tag.style.transition = `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          tag.style.opacity = '1';
          tag.style.transform = 'scale(1)';
        }));
      });
      tagObs.disconnect();
    }
  }, { threshold: 0.3 });
  tagObs.observe(tagContainer);
}
