'use strict';

// ── STATE ─────────────────────────────────
const state = {
  currentSlide: 0,
  totalSlides: 8,
  isTransitioning: false,
  musicPlaying: false,
  profileSelected: null,
  touchStartX: 0,
  touchStartY: 0,
  touchEndX: 0,
  touchEndY: 0,
};

// ── DOM ───────────────────────────────────
const $ = id => document.getElementById(id);
const screenIntro     = $('screen-intro');
const screenLoading   = $('screen-loading');
const screenStory     = $('screen-story');
const progressFill    = $('progress-fill');
const slideCounter    = $('slide-counter');
const dotNav          = $('dot-nav');
const navPrev         = $('nav-prev');
const navNext         = $('nav-next');
const audio           = $('audio');
const musicBtn        = $('music-btn');
const musicPlayer     = $('music-player');
const musicTooltip    = $('music-tooltip');
const loadingBar      = document.querySelector('.loading-bar');
const titleCardReveal = document.querySelector('.title-card-reveal');
const titleCardName   = $('title-card-name');
const loadingLabel    = $('loading-label');
const overlay         = $('transition-overlay');
const canvas          = $('particles-canvas');

// ── PARTICLES ─────────────────────────────
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let particleRAF = null;
let particlesActive = false;

function initParticles() {
  if (!canvas || !ctx) return;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function spawnParticle() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 10,
    size: Math.random() * 1.8 + 0.4,
    speedY: Math.random() * 0.6 + 0.3,
    speedX: (Math.random() - 0.5) * 0.3,
    opacity: 0,
    maxOpacity: Math.random() * 0.45 + 0.1,
    life: 0,
    maxLife: Math.random() * 200 + 150,
  };
}

function animateParticles() {
  if (!ctx || !particlesActive) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Add new particles
  if (particles.length < 40 && Math.random() < 0.3) {
    particles.push(spawnParticle());
  }

  particles = particles.filter(p => p.life < p.maxLife);

  particles.forEach(p => {
    p.life++;
    p.y -= p.speedY;
    p.x += p.speedX;

    const progress = p.life / p.maxLife;
    if (progress < 0.15) {
      p.opacity = (progress / 0.15) * p.maxOpacity;
    } else if (progress > 0.75) {
      p.opacity = ((1 - progress) / 0.25) * p.maxOpacity;
    } else {
      p.opacity = p.maxOpacity;
    }

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = '#c9a96e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  particleRAF = requestAnimationFrame(animateParticles);
}

function startParticles() {
  if (particlesActive) return;
  particlesActive = true;
  canvas.classList.add('visible');
  animateParticles();
}

function stopParticles() {
  particlesActive = false;
  canvas.classList.remove('visible');
  if (particleRAF) cancelAnimationFrame(particleRAF);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = [];
}

// ── INTRO STARS ───────────────────────────
function buildStars() {
  const container = $('intro-stars');
  if (!container) return;
  for (let i = 0; i < 35; i++) {
    const star = document.createElement('div');
    star.className = 'star-dot';
    star.style.left = Math.random() * 100 + '%';
    star.style.top  = Math.random() * 100 + '%';
    const dur = (Math.random() * 8 + 5).toFixed(1) + 's';
    const delay = (Math.random() * 6).toFixed(1) + 's';
    star.style.animation = `starFloat ${dur} ${delay} linear infinite`;
    container.appendChild(star);
  }
}

// ── INIT ──────────────────────────────────
function init() {
  buildStars();
  buildDotNav();
  bindKeyboard();
  bindTouch();
  initParticles();
  updateNav();
}

// ── PROFILE SELECTION ─────────────────────
function selectProfile(card) {
  if (state.profileSelected) return;
  state.profileSelected = card.dataset.name;
  card.classList.add('selected');

  const names = { Dosa: 'Dosa', Dumbo: 'Dumbo', Sleepyhead: 'Sleepyhead', Jahnavi: 'Jahnavi' };
  titleCardName.textContent = names[state.profileSelected] || 'Jahnavi';

  // Fade out others
  document.querySelectorAll('.profile-card').forEach(c => {
    if (c !== card) {
      c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      c.style.opacity = '0';
      c.style.transform = 'translateY(10px) scale(0.94)';
    }
  });

  setTimeout(transitionToLoading, 750);
}

// ── LOADING ───────────────────────────────
function transitionToLoading() {
  overlay.classList.add('active');

  setTimeout(() => {
    screenIntro.classList.remove('active');
    screenIntro.classList.add('exit');
    screenLoading.classList.add('active');
    overlay.classList.remove('active');

    requestAnimationFrame(() => {
      setTimeout(() => {
        loadingBar.style.width = '100%';

        setTimeout(() => {
          titleCardReveal.classList.add('visible');
          loadingLabel.style.opacity = '0';
          setTimeout(() => {
            loadingLabel.textContent = 'Gathering your memories…';
            loadingLabel.style.opacity = '1';
          }, 300);
        }, 700);

        setTimeout(() => {
          overlay.classList.add('active');
          setTimeout(() => {
            screenLoading.classList.remove('active');
            screenLoading.classList.add('exit');
            screenStory.classList.add('active');
            activateSlide(0);
            overlay.classList.remove('active');
            startParticles();

            setTimeout(() => {
              musicPlayer.classList.add('visible');
            }, 1000);
          }, 400);
        }, 3000);
      }, 80);
    });
  }, 300);
}

// ── SLIDE NAVIGATION ─────────────────────
function activateSlide(index) {
  const slides = document.querySelectorAll('.slide');

  // Remove active/leaving from all
  slides.forEach(s => {
    s.classList.remove('active');
    s.classList.remove('leaving');
    // Reset all reveal-up/left so they re-animate
    s.querySelectorAll('.reveal-up, .reveal-left').forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // reflow
      el.style.animation = '';
    });
  });

  const target = slides[index];
  if (!target) return;
  target.classList.add('active');

  state.currentSlide = index;
  updateProgress();
  updateCounter();
  updateDots();
  updateNav();
}

function nextSlide() {
  if (state.isTransitioning) return;
  if (state.currentSlide >= state.totalSlides - 1) return;

  state.isTransitioning = true;
  const next = state.currentSlide + 1;

  overlay.classList.add('active');
  setTimeout(() => {
    activateSlide(next);
    overlay.classList.remove('active');
    setTimeout(() => { state.isTransitioning = false; }, 350);
  }, 220);
}

function prevSlide() {
  if (state.isTransitioning) return;
  if (state.currentSlide <= 0) return;

  state.isTransitioning = true;
  const prev = state.currentSlide - 1;

  overlay.classList.add('active');
  setTimeout(() => {
    activateSlide(prev);
    overlay.classList.remove('active');
    setTimeout(() => { state.isTransitioning = false; }, 350);
  }, 220);
}

function goToSlide(index) {
  if (state.isTransitioning || index === state.currentSlide) return;
  state.isTransitioning = true;
  overlay.classList.add('active');
  setTimeout(() => {
    activateSlide(index);
    overlay.classList.remove('active');
    setTimeout(() => { state.isTransitioning = false; }, 350);
  }, 220);
}

// ── PROGRESS / UI ─────────────────────────
function updateProgress() {
  const pct = (state.currentSlide / (state.totalSlides - 1)) * 100;
  progressFill.style.width = `${pct}%`;
}

function updateCounter() {
  slideCounter.textContent = `${state.currentSlide + 1} / ${state.totalSlides}`;
}

function updateNav() {
  navPrev.classList.toggle('hidden', state.currentSlide === 0);
  navNext.classList.toggle('hidden', state.currentSlide === state.totalSlides - 1);
}

// ── DOTS ──────────────────────────────────
function buildDotNav() {
  dotNav.innerHTML = '';
  for (let i = 0; i < state.totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotNav.appendChild(dot);
  }
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === state.currentSlide);
  });
}

// ── KEYBOARD ──────────────────────────────
function bindKeyboard() {
  document.addEventListener('keydown', e => {
    if (!screenStory.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault(); nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); prevSlide();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMusic();
    }
  });
}

// ── TOUCH / SWIPE ─────────────────────────
function bindTouch() {
  document.body.addEventListener('touchstart', e => {
    state.touchStartX = e.changedTouches[0].screenX;
    state.touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.body.addEventListener('touchend', e => {
    state.touchEndX = e.changedTouches[0].screenX;
    state.touchEndY = e.changedTouches[0].screenY;
    const dx = state.touchEndX - state.touchStartX;
    const dy = state.touchEndY - state.touchStartY;
    if (!screenStory.classList.contains('active')) return;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 1.5) return;
    if (dx < 0) nextSlide(); else prevSlide();
  }, { passive: true });
}

// ── MUSIC ─────────────────────────────────
function toggleMusic() {
  if (state.musicPlaying) {
    audio.pause();
    musicBtn.classList.remove('playing');
    musicTooltip.textContent = 'Play music';
    state.musicPlaying = false;
  } else {
    audio.volume = 0;
    audio.play().then(() => {
      musicBtn.classList.add('playing');
      musicTooltip.textContent = 'Pause music';
      state.musicPlaying = true;
      fadeIn(audio, 0.7, 1200);
    }).catch(() => {});
  }
}

function fadeIn(audioEl, targetVol, duration) {
  const steps = 30;
  const step = targetVol / steps;
  let current = 0;
  const interval = setInterval(() => {
    current += step;
    audioEl.volume = Math.min(current, targetVol);
    if (current >= targetVol) clearInterval(interval);
  }, duration / steps);
}

audio.addEventListener('pause', () => {
  musicBtn.classList.remove('playing');
  musicTooltip.textContent = 'Play music';
  state.musicPlaying = false;
});
audio.addEventListener('play', () => {
  musicBtn.classList.add('playing');
  musicTooltip.textContent = 'Pause music';
  state.musicPlaying = true;
});

// ── SCROLL WHEEL ──────────────────────────
let wheelTimeout = null;
document.addEventListener('wheel', e => {
  if (!screenStory.classList.contains('active')) return;
  if (state.currentSlide === state.totalSlides - 1) return;
  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(() => {
    if (e.deltaY > 40) nextSlide();
    else if (e.deltaY < -40) prevSlide();
  }, 50);
}, { passive: true });

// ── RESTART ───────────────────────────────
function restartExperience() {
  overlay.classList.add('active');

  setTimeout(() => {
    state.currentSlide = 0;
    state.profileSelected = null;
    state.isTransitioning = false;

    if (state.musicPlaying) {
      audio.pause(); audio.currentTime = 0;
      musicBtn.classList.remove('playing');
      state.musicPlaying = false;
    }

    stopParticles();

    loadingBar.style.transition = 'none';
    loadingBar.style.width = '0';
    titleCardReveal.classList.remove('visible');
    loadingLabel.textContent = 'Preparing something special…';
    loadingLabel.style.opacity = '1';

    document.querySelectorAll('.profile-card').forEach(c => {
      c.classList.remove('selected');
      c.style.opacity = ''; c.style.transform = ''; c.style.transition = '';
    });

    screenStory.classList.remove('active'); screenStory.classList.add('exit');
    screenLoading.classList.remove('active'); screenLoading.classList.add('exit');
    musicPlayer.classList.remove('visible');
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));

    setTimeout(() => {
      screenStory.classList.remove('exit');
      screenLoading.classList.remove('exit');
      screenIntro.classList.remove('exit');
      screenIntro.classList.add('active');
      overlay.classList.remove('active');

      setTimeout(() => {
        loadingBar.style.transition = 'width 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }, 100);
    }, 300);
  }, 400);
}

// ── BOOT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

