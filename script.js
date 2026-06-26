'use strict';

/* ─── STATE ──────────────────────────── */
const S = {
  slide: 0, total: 8, busy: false,
  music: false, profile: null,
  tx0: 0, ty0: 0, tx1: 0, ty1: 0,
};

/* ─── REFS ───────────────────────────── */
const el = id => document.getElementById(id);
const sIntro   = el('screen-intro');
const sLoad    = el('screen-loading');
const sStory   = el('screen-story');
const progFill = el('prog-fill');
const counter  = el('story-counter');
const dotRow   = el('dot-row');
const navPrev  = el('nav-prev');
const navNext  = el('nav-next');
const audio    = el('audio');
const mBtn     = el('music-btn');
const mWrap    = el('music-wrap');
const ldBar    = el('ld-bar');
const ldCenter = document.querySelector('.ld-center');
const ldLabel  = el('ld-label');
const ldName   = el('ld-name');
const fade     = el('fade-overlay');
const canvas   = el('particle-canvas');

/* ─── PARTICLES ──────────────────────── */
const ctx = canvas ? canvas.getContext('2d') : null;
let pts = [], pActive = false, pRAF = null;

function pResize() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
function pNew() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 6,
    r: Math.random() * 1.5 + 0.3,
    vy: Math.random() * 0.55 + 0.25,
    vx: (Math.random() - 0.5) * 0.25,
    a: 0, maxA: Math.random() * 0.4 + 0.08,
    life: 0, max: Math.random() * 200 + 140,
  };
}
function pTick() {
  if (!ctx || !pActive) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (pts.length < 35 && Math.random() < 0.28) pts.push(pNew());
  pts = pts.filter(p => p.life < p.max);
  pts.forEach(p => {
    p.life++; p.y -= p.vy; p.x += p.vx;
    const t = p.life / p.max;
    p.a = t < .15 ? (t/.15)*p.maxA : t > .75 ? ((1-t)/.25)*p.maxA : p.maxA;
    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.fillStyle = '#c9a96e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  pRAF = requestAnimationFrame(pTick);
}
function pStart() {
  if (pActive) return;
  pActive = true;
  canvas.classList.add('on');
  pTick();
}
function pStop() {
  pActive = false;
  canvas.classList.remove('on');
  if (pRAF) cancelAnimationFrame(pRAF);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  pts = [];
}

/* ─── INIT ───────────────────────────── */
function init() {
  pResize();
  window.addEventListener('resize', pResize);
  buildDots();
  bindKeys();
  bindTouch();
  updateNav();
}

/* ─── PROFILE SELECT ─────────────────── */
function selectProfile(card) {
  if (S.profile) return;
  S.profile = card.dataset.name;
  card.classList.add('sel');

  // map nicknames to "Jahnavi" on title card
  ldName.textContent = S.profile;

  // fade others
  document.querySelectorAll('.nf-card').forEach(c => {
    if (c !== card) {
      c.style.transition = 'opacity .45s ease, transform .45s ease';
      c.style.opacity = '0';
      c.style.transform = 'translateY(8px) scale(.94)';
    }
  });
  setTimeout(goLoad, 700);
}

/* ─── LOADING ────────────────────────── */
function goLoad() {
  fade.classList.add('on');
  setTimeout(() => {
    sIntro.classList.remove('active'); sIntro.classList.add('out');
    sLoad.classList.add('active');
    fade.classList.remove('on');

    // trigger bar
    requestAnimationFrame(() => {
      setTimeout(() => {
        ldBar.style.width = '100%';

        // show title card halfway
        setTimeout(() => {
          ldCenter.classList.add('show');
          ldLabel.style.opacity = '0';
          setTimeout(() => {
            ldLabel.textContent = 'Gathering your memories…';
            ldLabel.style.opacity = '1';
          }, 350);
        }, 750);

        // enter story
        setTimeout(() => {
          fade.classList.add('on');
          setTimeout(() => {
            sLoad.classList.remove('active'); sLoad.classList.add('out');
            sStory.classList.add('active');
            activateSlide(0);
            fade.classList.remove('on');
            pStart();
            setTimeout(() => mWrap.classList.add('on'), 1200);
          }, 380);
        }, 3100);
      }, 80);
    });
  }, 280);
}

/* ─── SLIDE CONTROL ──────────────────── */
function activateSlide(idx) {
  const slides = document.querySelectorAll('.slide');
  slides.forEach(sl => {
    sl.classList.remove('active');
    // Reset animations so they re-fire on re-entry
    sl.querySelectorAll('.s1,.s2,.s3,.s4,.s5,.s6,.s7,.mem-item').forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth; // reflow
      el.style.animation = '';
    });
  });
  const t = slides[idx];
  if (!t) return;
  t.classList.add('active');
  S.slide = idx;
  updateProg();
  updateCounter();
  updateDots();
  updateNav();
}

function nextSlide() {
  if (S.busy || S.slide >= S.total - 1) return;
  S.busy = true;
  const n = S.slide + 1;
  fade.classList.add('on');
  setTimeout(() => {
    activateSlide(n);
    fade.classList.remove('on');
    setTimeout(() => S.busy = false, 320);
  }, 210);
}

function prevSlide() {
  if (S.busy || S.slide <= 0) return;
  S.busy = true;
  const p = S.slide - 1;
  fade.classList.add('on');
  setTimeout(() => {
    activateSlide(p);
    fade.classList.remove('on');
    setTimeout(() => S.busy = false, 320);
  }, 210);
}

function gotoSlide(i) {
  if (S.busy || i === S.slide) return;
  S.busy = true;
  fade.classList.add('on');
  setTimeout(() => {
    activateSlide(i);
    fade.classList.remove('on');
    setTimeout(() => S.busy = false, 320);
  }, 210);
}

/* ─── UI UPDATES ─────────────────────── */
function updateProg() {
  progFill.style.width = (S.slide / (S.total - 1) * 100) + '%';
}
function updateCounter() {
  counter.textContent = (S.slide + 1) + ' / ' + S.total;
}
function updateNav() {
  navPrev.classList.toggle('hide', S.slide === 0);
  navNext.classList.toggle('hide', S.slide === S.total - 1);
}

function buildDots() {
  dotRow.innerHTML = '';
  for (let i = 0; i < S.total; i++) {
    const b = document.createElement('button');
    b.className = 'dot' + (i === 0 ? ' on' : '');
    b.setAttribute('aria-label', 'Slide ' + (i + 1));
    b.addEventListener('click', () => gotoSlide(i));
    dotRow.appendChild(b);
  }
}
function updateDots() {
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('on', i === S.slide);
  });
}

/* ─── KEYBOARD ───────────────────────── */
function bindKeys() {
  document.addEventListener('keydown', e => {
    if (!sStory.classList.contains('active')) return;
    if ([' ', 'ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); nextSlide(); }
    else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); prevSlide(); }
    else if (e.key === 'm' || e.key === 'M') toggleMusic();
  });
}

/* ─── TOUCH ──────────────────────────── */
function bindTouch() {
  document.body.addEventListener('touchstart', e => {
    S.tx0 = e.changedTouches[0].screenX;
    S.ty0 = e.changedTouches[0].screenY;
  }, { passive: true });
  document.body.addEventListener('touchend', e => {
    S.tx1 = e.changedTouches[0].screenX;
    S.ty1 = e.changedTouches[0].screenY;
    if (!sStory.classList.contains('active')) return;
    const dx = S.tx1 - S.tx0, dy = S.ty1 - S.ty0;
    if (Math.abs(dx) < 38 || Math.abs(dy) > Math.abs(dx) * 1.4) return;
    dx < 0 ? nextSlide() : prevSlide();
  }, { passive: true });
}

/* ─── SCROLL WHEEL ───────────────────── */
let wt = null;
document.addEventListener('wheel', e => {
  if (!sStory.classList.contains('active')) return;
  if (S.slide === S.total - 1) return; // let letter scroll
  clearTimeout(wt);
  wt = setTimeout(() => {
    if (e.deltaY > 35) nextSlide();
    else if (e.deltaY < -35) prevSlide();
  }, 45);
}, { passive: true });

/* ─── MUSIC ──────────────────────────── */
function toggleMusic() {
  if (S.music) {
    audio.pause();
    mBtn.classList.remove('play');
    S.music = false;
  } else {
    audio.volume = 0;
    audio.play().then(() => {
      mBtn.classList.add('play');
      S.music = true;
      fadeVol(audio, 0.72, 1400);
    }).catch(() => {});
  }
}

function fadeVol(a, target, ms) {
  const steps = 28, step = target / steps;
  let cur = 0;
  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    a.volume = cur;
    if (cur >= target) clearInterval(iv);
  }, ms / steps);
}

audio.addEventListener('pause', () => { mBtn.classList.remove('play'); S.music = false; });
audio.addEventListener('play',  () => { mBtn.classList.add('play');    S.music = true;  });

/* ─── RESTART ────────────────────────── */
function restartExperience() {
  fade.classList.add('on');
  setTimeout(() => {
    S.slide = 0; S.profile = null; S.busy = false;
    if (S.music) { audio.pause(); audio.currentTime = 0; mBtn.classList.remove('play'); S.music = false; }
    pStop();

    ldBar.style.transition = 'none'; ldBar.style.width = '0';
    ldCenter.classList.remove('show');
    ldLabel.textContent = 'Preparing something special…';
    ldLabel.style.opacity = '1';

    document.querySelectorAll('.nf-card').forEach(c => {
      c.classList.remove('sel');
      c.style.opacity = ''; c.style.transform = ''; c.style.transition = '';
    });

    sStory.classList.remove('active'); sStory.classList.add('out');
    sLoad.classList.remove('active'); sLoad.classList.add('out');
    mWrap.classList.remove('on');
    document.querySelectorAll('.slide').forEach(sl => sl.classList.remove('active'));

    setTimeout(() => {
      sStory.classList.remove('out'); sLoad.classList.remove('out');
      sIntro.classList.remove('out'); sIntro.classList.add('active');
      fade.classList.remove('on');
      setTimeout(() => {
        ldBar.style.transition = 'width 2.8s cubic-bezier(.25,.46,.45,.94)';
      }, 120);
    }, 300);
  }, 380);
}

/* ─── BOOT ───────────────────────────── */
document.addEventListener('DOMContentLoaded', init);

