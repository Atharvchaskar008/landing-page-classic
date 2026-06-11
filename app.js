/* ============================================================
   CYBERPUNK MILITARY LANDING PAGE — app.js
   Vanilla JS · No dependencies · Performance-first
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Color tokens (match CSS custom properties) ─────────────
  const COLOR_ACCENT    = '#ff3c00';
  const COLOR_HUD_GREEN = '#00ff66';

  // ── Utility: debounce ──────────────────────────────────────
  function debounce(fn, ms = 100) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ==========================================================
     1. INTERSECTION OBSERVER — SCROLL REVEAL
     ========================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        // Stagger siblings inside the same parent section
        const parent = el.closest('section') || el.parentElement;
        const siblings = parent ? parent.querySelectorAll('.reveal') : [el];
        const index = Array.prototype.indexOf.call(siblings, el);
        const delay = Math.max(0, index) * 120; // 120ms stagger

        setTimeout(() => el.classList.add('active'), delay);
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '-50px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ==========================================================
     2. COUNTER ANIMATION (easeOutExpo, rAF-driven)
     ========================================================== */
  const counterElements = document.querySelectorAll('.counter');
  const countedSet = new Set(); // track already-counted elements

  function easeOutExpo(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    if (countedSet.has(el)) return;
    countedSet.add(el);

    const raw        = parseInt(el.getAttribute('data-target'), 10) || 0;
    const decimals   = parseInt(el.getAttribute('data-decimal'), 10) || 0;
    const suffix     = el.getAttribute('data-suffix') || '';
    const divisor    = Math.pow(10, decimals); // e.g. data-decimal="2" → /100
    const target     = decimals > 0 ? raw / divisor : raw;
    const duration   = 2000; // ms
    let start        = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = easeOutExpo(progress) * target;

      el.textContent =
        decimals > 0
          ? value.toFixed(decimals) + suffix
          : Math.floor(value).toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Snap to exact final value
        el.textContent =
          decimals > 0
            ? target.toFixed(decimals) + suffix
            : target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '-50px' }
  );

  counterElements.forEach((el) => counterObserver.observe(el));

  /* ==========================================================
     3. HUD CLOCK
     ========================================================== */
  const hudClock        = document.getElementById('hud-clock');
  const footerTimestamp = document.getElementById('footer-timestamp');

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  function updateClock() {
    const now = new Date();
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    if (hudClock)        hudClock.textContent        = time;
    if (footerTimestamp) footerTimestamp.textContent  = `LAST UPDATE: ${time}`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ==========================================================
     4. BOOT SEQUENCE
     ========================================================== */
  const statusIndicator = document.querySelector('.status-indicator');

  if (statusIndicator) {
    // Phase 1 — immediate
    statusIndicator.textContent = 'SYS.BOOTING';
    statusIndicator.style.color = COLOR_ACCENT;

    // Phase 2 — 1.5s
    setTimeout(() => {
      statusIndicator.textContent = 'SYS.SYNCING';
      statusIndicator.style.color = COLOR_ACCENT;
    }, 1500);

    // Phase 3 — 3.5s
    setTimeout(() => {
      statusIndicator.textContent = 'SYS.ONLINE';
      statusIndicator.style.color = COLOR_HUD_GREEN;
    }, 3500);
  }

  /* ==========================================================
     5. CTA BUTTON
     ========================================================== */
  const ctaButton = document.getElementById('cta-button');

  if (ctaButton) {
    const ctaOriginalText    = ctaButton.textContent;
    const ctaOriginalBg      = ctaButton.style.backgroundColor || '';
    const ctaOriginalBorder  = ctaButton.style.borderColor     || '';
    const ctaOriginalColor   = ctaButton.style.color           || '';
    let ctaBusy = false;

    ctaButton.addEventListener('click', () => {
      if (ctaBusy) return;
      ctaBusy = true;

      ctaButton.textContent = 'ACCESSING...';

      setTimeout(() => {
        ctaButton.textContent            = 'ACCESS GRANTED';
        ctaButton.style.backgroundColor  = COLOR_HUD_GREEN;
        ctaButton.style.borderColor      = COLOR_HUD_GREEN;
        ctaButton.style.color            = '#000';

        setTimeout(() => {
          ctaButton.textContent            = ctaOriginalText;
          ctaButton.style.backgroundColor  = ctaOriginalBg;
          ctaButton.style.borderColor      = ctaOriginalBorder;
          ctaButton.style.color            = ctaOriginalColor;
          ctaBusy = false;
        }, 2000);
      }, 1500);
    });
  }

  /* ==========================================================
     6. PROGRESS BARS / SPEC FILLS / OP-STAT FILLS
     ========================================================== */
  const fillSelectors = [
    '.progress-bar[data-progress]',
    '.spec-fill[data-width]',
    '.op-stat-fill[data-width]',
  ];

  const fillElements = document.querySelectorAll(fillSelectors.join(','));

  const fillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const value = el.getAttribute('data-progress') || el.getAttribute('data-width');
        if (value) {
          // Small delay so the CSS transition is visible
          requestAnimationFrame(() => {
            el.style.width = value + '%';
          });
        }
        fillObserver.unobserve(el);
      });
    },
    { threshold: 0.05 }
  );

  fillElements.forEach((el) => fillObserver.observe(el));

  /* ==========================================================
     7. TERMINAL TYPING EFFECT
     ========================================================== */
  const terminalBody = document.getElementById('terminal-body');
  let terminalPlayed = false;

  const terminalLines = [
    { type: 'output', text: '> Initializing augmentation core...' },
    { type: 'output', text: '> Loading neural interface drivers... [OK]' },
    { type: 'output', text: '> Scanning biometric signatures... [OK]' },
    { type: 'output', text: '> Verifying clearance level... [\u03A9-7 CONFIRMED]' },
    { type: 'output', text: '> Active modules: 142 | Subjects online: 2847' },
    { type: 'output', text: '> System integrity: 99.97%' },
    { type: 'output', text: '> WARNING: Elevated threat level detected in Sector 7-G' },
    { type: 'error',  text: '> ALERT: Unauthorized access attempt blocked \u2014 origin: \u2588\u2588.\u2588\u2588.\u2588\u2588\u2588.\u2588\u2588' },
    { type: 'output', text: '> Firewall status: ACTIVE | Encryption: AES-512' },
    { type: 'output', text: '> All systems nominal. Awaiting further instructions.' },
  ];

  function typeLineIntoElement(lineEl, text, charDelay) {
    return new Promise((resolve) => {
      let i = 0;
      function tick() {
        if (i < text.length) {
          lineEl.textContent += text[i];
          i++;
          setTimeout(tick, charDelay);
        } else {
          resolve();
        }
      }
      tick();
    });
  }

  async function runTerminalSequence() {
    if (terminalPlayed || !terminalBody) return;
    terminalPlayed = true;

    for (const line of terminalLines) {
      const span = document.createElement('div');
      span.className = line.type === 'error' ? 'term-error' : 'term-output';
      terminalBody.appendChild(span);

      await typeLineIntoElement(span, line.text, 30);

      // Pause between lines
      await new Promise((r) => setTimeout(r, 300));

      // Keep terminal scrolled to bottom
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  if (terminalBody) {
    const terminalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runTerminalSequence();
          terminalObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );
    terminalObserver.observe(terminalBody);
  }

  /* ==========================================================
     8. GLITCH EFFECT ON HERO TITLE
     ========================================================== */
  const glitchText = document.querySelector('.glitch-text');

  function scheduleGlitch() {
    const delay = 4000 + Math.random() * 4000; // 4–8 s

    setTimeout(() => {
      if (glitchText) {
        glitchText.classList.add('glitch-active');
        setTimeout(() => {
          glitchText.classList.remove('glitch-active');
        }, 200);
      }
      scheduleGlitch();
    }, delay);
  }

  if (glitchText) scheduleGlitch();

  /* ==========================================================
     9. CARD HOVER GLITCH
     ========================================================== */
  const cards = document.querySelectorAll('.card');

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const offsetX = (Math.random() - 0.5) * 6; // -3 to +3 px
      card.style.transform = `translateX(${offsetX}px)`;

      // Snap back after brief moment
      setTimeout(() => {
        card.style.transform = '';
      }, 120);
    });
  });

  /* ==========================================================
     10. SMOOTH SCROLL (offset for fixed nav)
     ========================================================== */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const nav = document.querySelector('nav') || document.querySelector('.navbar');
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ==========================================================
     11. OPERATIVE CARD SCAN — CSS-only, no JS needed
     ========================================================== */
  // .operative-scan elements animate purely via CSS keyframes.
});
