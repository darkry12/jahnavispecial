/* ════════════════════════════════════════════
   JAHNAVI SPECIAL — script.js
   Cinematic story navigation + music player
════════════════════════════════════════════ */

'use strict';

// ── STATE ──────────────────────────────────
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

// ── DOM REFS ───────────────────────────────
const $ = id => document.getElementById(id);
const screenIntro    = $('screen-intro');
const screenLoading  = $('screen-loading');
const screenStory    = $('screen-story');
const slidesEl       = $('slides-container');
const progressFill   = $('progress-fill');
const slideCounter   = $('slide-counter');
const dotNav         = $('dot-nav');
const navPrev        = $('nav-prev');
const navNext        = $('nav-next');
const audio          = $('audio');
const musicBtn       = $('music-btn');
const musicPlayer    = $('music-player');
const musicTooltip   = $('music-tooltip');
const loadingBar     = document.querySelector('.loading-bar');
const titleCardReveal = document.querySelector('.title-card-reveal');
const titleCardName  = $('title-card-name');
const loadingLabel   = $('loading-label');
const overlay        = $('transition-overlay');

// ── INIT ───────────────────────────────────
function init() {
  buildDotNav();
  bindKeyboard();
  bindTouch();
  updateNav();
}

// ── PROFILE SELECTION ─────────────────────
function selectProfile(card) {
  if (state.profileSelected) return;
  state.profileSelected = card.dataset.name;

  // Mark selected
  card.classList.add('selected');

  // Update title card name
  const names = {
    Dosa: 'Dosa',
    Dumbo: 'Dumbo',
    Sleepyhead: 'Sleepyhead',
    Idiot: 'Idiot',
  };
  titleCardName.textContent = names[state.profileSelected] || 'Jahnavi';

  // Fade out other cards
  document.querySelectorAll('.profile-card').forEach(c => {
    if (c !== card) {
      c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      c.style.opacity = '0';
      c.style.transform = 'scale(0.92)';
    }
  });

  // Short delay then transition
  setTimeout(() => transitionToLoading(), 700);
}

// ── LOADING SEQUENCE ──────────────────────
function transitionToLoading() {
  // Flash overlay
  overlay.classList.add('active');

  setTimeout(() => {
    // Hide intro, show loading
    screenIntro.classList.remove('active');
    screenIntro.classList.add('exit');
    screenLoading.classList.add('active');
    overlay.classList.remove('active');

    // Trigger loading bar
    requestAnimationFrame(() => {
      setTimeout(() => {
        loadingBar.style.width = '100%';

        // Show title card mid-load
        setTimeout(() => {
          titleCardReveal.classList.add('visible');
          loadingLabel.textContent = 'Curating your chaos…';
        }, 600);

        // Then transition to story
        setTimeout(() => {
          overlay.classList.add('active');
          setTimeout(() => {
            screenLoading.classList.remove('active');
            screenLoading.classList.add('exit');
            screenStory.classList.add('active');
            activateSlide(0);
            overlay.classList.remove('active');

            // Show music player
            setTimeout(() => {
              musicPlayer.classList.add('visible');
            }, 800);

          }, 400);
        }, 2800);
      }, 100);
    });
  }, 300);
}

// ── SLIDE NAVIGATION ──────────────────────
function activateSlide(index, direction = 'forward') {
  const slides = document.querySelectorAll('.slide');

  // Deactivate all
  slides.forEach(s => s.classList.remove('active'));

  // Activate target
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

  // Brief flash between slides
  overlay.classList.add('active');
  setTimeout(() => {
    activateSlide(next, 'forward');
    overlay.classList.remove('active');
    setTimeout(() => { state.isTransitioning = false; }, 300);
  }, 200);
}

function prevSlide() {
  if (state.isTransitioning) return;
  if (state.currentSlide <= 0) return;

  state.isTransitioning = true;
  const prev = state.currentSlide - 1;

  overlay.classList.add('active');
  setTimeout(() => {
    activateSlide(prev, 'back');
    overlay.classList.remove('active');
    setTimeout(() => { state.isTransitioning = false; }, 300);
  }, 200);
}

function goToSlide(index) {
  if (state.isTransitioning) return;
  if (index === state.currentSlide) return;

  state.isTransitioning = true;
  overlay.classList.add('active');
  setTimeout(() => {
    activateSlide(index);
    overlay.classList.remove('active');
    setTimeout(() => { state.isTransitioning = false; }, 300);
  }, 200);
}

// ── PROGRESS / UI UPDATES ─────────────────
function updateProgress() {
  const pct = ((state.currentSlide) / (state.totalSlides - 1)) * 100;
  progressFill.style.width = `${pct}%`;
}

function updateCounter() {
  slideCounter.textContent = `${state.currentSlide + 1} / ${state.totalSlides}`;
}

function updateNav() {
  navPrev.classList.toggle('hidden', state.currentSlide === 0);
  navNext.classList.toggle('hidden', state.currentSlide === state.totalSlides - 1);
}

// ── DOT NAV ───────────────────────────────
function buildDotNav() {
  dotNav.innerHTML = '';
  for (let i = 0; i < state.totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotNav.appendChild(dot);
  }
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === state.currentSlide);
  });
}

// ── KEYBOARD ──────────────────────────────
function bindKeyboard() {
  document.addEventListener('keydown', e => {
    if (!screenStory.classList.contains('active')) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'm':
      case 'M':
        toggleMusic();
        break;
    }
  });
}

// ── TOUCH / SWIPE ─────────────────────────
function bindTouch() {
  const container = document.body;

  container.addEventListener('touchstart', e => {
    state.touchStartX = e.changedTouches[0].screenX;
    state.touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  container.addEventListener('touchend', e => {
    state.touchEndX = e.changedTouches[0].screenX;
    state.touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  if (!screenStory.classList.contains('active')) return;

  const dx = state.touchEndX - state.touchStartX;
  const dy = state.touchEndY - state.touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Only horizontal swipes (ignore vertical scrolls, e.g. in letter)
  if (absDx < 40) return;
  if (absDy > absDx * 1.5) return;

  if (dx < 0) nextSlide();
  else prevSlide();
}

// ── MUSIC PLAYER ──────────────────────────
function toggleMusic() {
  if (state.musicPlaying) {
    audio.pause();
    musicBtn.classList.remove('playing');
    musicTooltip.textContent = 'Play music';
    state.musicPlaying = false;
  } else {
    audio.play().then(() => {
      musicBtn.classList.add('playing');
      musicTooltip.textContent = 'Pause music';
      state.musicPlaying = true;
    }).catch(err => {
      console.warn('Audio play failed:', err);
    });
  }
}

// Smooth fade on audio
audio.addEventListener('pause', () => {
  musicBtn.classList.remove('playing');
  musicTooltip.textContent = 'Play music';
});
audio.addEventListener('play', () => {
  musicBtn.classList.add('playing');
  musicTooltip.textContent = 'Pause music';
});

// ── RESTART ───────────────────────────────
function restartExperience() {
  overlay.classList.add('active');

  setTimeout(() => {
    // Reset state
    state.currentSlide = 0;
    state.profileSelected = null;
    state.isTransitioning = false;

    // Pause music
    if (state.musicPlaying) {
      audio.pause();
      audio.currentTime = 0;
      musicBtn.classList.remove('playing');
      state.musicPlaying = false;
    }

    // Reset loading bar
    loadingBar.style.transition = 'none';
    loadingBar.style.width = '0';
    titleCardReveal.classList.remove('visible');
    loadingLabel.textContent = 'Loading your memories…';

    // Reset profile cards
    document.querySelectorAll('.profile-card').forEach(c => {
      c.classList.remove('selected');
      c.style.opacity = '';
      c.style.transform = '';
      c.style.transition = '';
    });

    // Reset screens
    screenStory.classList.remove('active');
    screenStory.classList.add('exit');
    screenLoading.classList.remove('active');
    screenLoading.classList.add('exit');
    musicPlayer.classList.remove('visible');

    // Deactivate all slides
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));

    // Show intro
    setTimeout(() => {
      screenStory.classList.remove('exit');
      screenLoading.classList.remove('exit');
      screenIntro.classList.remove('exit');
      screenIntro.classList.add('active');
      overlay.classList.remove('active');

      // Re-enable loading bar transition after reset
      setTimeout(() => {
        loadingBar.style.transition = 'width 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }, 100);
    }, 300);

  }, 400);
}

// ── SCROLL WHEEL NAV ──────────────────────
let wheelTimeout = null;
document.addEventListener('wheel', e => {
  if (!screenStory.classList.contains('active')) return;

  // Skip scroll nav on letter slide (allow actual scrolling)
  if (state.currentSlide === state.totalSlides - 1) return;

  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(() => {
    if (e.deltaY > 40) nextSlide();
    else if (e.deltaY < -40) prevSlide();
  }, 50);
}, { passive: true });

// ── START ─────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
