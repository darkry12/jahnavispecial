/* ══════════════════════════════════════════════════════════
   DATA — STORIES
   ══════════════════════════════════════════════════════════ */
const STORIES = [
  {
    id:1,
    img:'images/idiot_dosa_story.jpg',
    layout:'zoom',
    overlay:'cinematic',
    label:'Chapter I',
    headline:'The Dosa <em>Incident</em>',
    caption:'You ordered one. Then ate three. Then complained you were full.<br><strong>We all saw it happen.</strong>',
    color:'warm',
    imgPos:'center top'
  },
  {
    id:2,
    img:'images/funny_faces.jpg',
    layout:'film',
    overlay:'default',
    label:'Chapter II',
    headline:'Professional<br>Face Maker',
    caption:'Nobody told you to make that face. You just did it.<br><strong>And somehow it became the best photo.</strong>',
    color:'rose',
    imgPos:'center center'
  },
  {
    id:3,
    img:'images/closeup_cheek.jpg',
    layout:'card',
    overlay:'default',
    label:'Chapter III',
    headline:'',
    caption:'This one looks like a painting.\n<em>And yet somehow it's just Tuesday.</em>',
    color:'teal',
    imgPos:'center top',
    polaroid:'She wasn\'t asleep.\nShe was "resting her eyes."'
  },
  {
    id:4,
    img:'images/mall_selfie.jpg',
    layout:'scrapbook',
    overlay:'default',
    label:'Chapter IV',
    headline:'The Mall<br>Chronicles',
    caption:'You said "one hour max." We were there for four.<br><strong>I bought nothing. You bought everything.</strong>',
    color:'indigo',
    imgPos:'center 20%'
  },
  {
    id:5,
    img:'images/idiot_dosa_story.jpg',
    layout:'top',
    overlay:'top',
    label:'But also—',
    headline:'<em>Thank you<br>for staying.</em>',
    caption:'Through every phase. Every mood. Every version of me that wasn\'t easy to be around.<br><strong>You stayed anyway.</strong>',
    color:'gold',
    imgPos:'center bottom'
  }
];

/* ══════════════════════════════════════════════════════════
   PROFILE META
   ══════════════════════════════════════════════════════════ */
const PROFILES = {
  dosa:     {name:'Dosa 😊',   img:'images/idiot_dosa_story.jpg'},
  dumbo:    {name:'Dumbo 🐘',  img:'images/funny_faces.jpg'},
  sleepyhead:{name:'Sleepyhead 😴',img:'images/closeup_cheek.jpg'},
  idiot:    {name:'Idiot 🙄',  img:'images/mall_selfie.jpg'}
};

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */
let currentScreen = 'intro';
let currentSlide  = 0;
let isHolding     = false;
let holdTimer     = null;
let autoTimer     = null;
let musicPlaying  = false;
let audioCtx      = null;
let gainNode      = null;

/* ══════════════════════════════════════════════════════════
   SCREEN NAVIGATION
   ══════════════════════════════════════════════════════════ */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>{
    s.classList.remove('active');
  });
  const target = document.getElementById('screen-'+id);
  if(target) target.classList.add('active');
  currentScreen = id;
}

function transitionTo(id, delay=0){
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.add('fade-in');
  setTimeout(()=>{
    showScreen(id);
    if(id === 'letter'){
      setTimeout(()=>{
        document.getElementById('music-player').classList.add('visible');
      }, 800);
    }
    setTimeout(()=>{
      overlay.classList.remove('fade-in');
    }, 600);
  }, delay + 500);
}

/* ══════════════════════════════════════════════════════════
   SLIDE BUILDER
   ══════════════════════════════════════════════════════════ */
function buildSlides(){
  const container = document.getElementById('slides-container');
  const progContainer = document.getElementById('progress-container');
  container.innerHTML = '';
  progContainer.innerHTML = '';

  STORIES.forEach((story, i)=>{
    // Progress segment
    const seg = document.createElement('div');
    seg.className = 'progress-seg';
    seg.id = `prog-${i}`;
    seg.innerHTML = '<div class="progress-fill"></div>';
    progContainer.appendChild(seg);

    // Slide
    const slide = document.createElement('div');
    slide.className = 'story-slide';
    slide.dataset.layout = story.layout;
    slide.dataset.index = i;

    // Build inner HTML based on layout
    let inner = '';

    if(story.layout === 'film'){
      inner += `
        <div class="film-frame-border" aria-hidden="true">
          <div class="film-holes left">
            ${Array(8).fill('<div class="film-hole"></div>').join('')}
          </div>
          <div class="film-holes right">
            ${Array(8).fill('<div class="film-hole"></div>').join('')}
          </div>
          <div class="film-counter">MEMORY FILM · ${String(i+1).padStart(3,'0')} · 35mm</div>
        </div>
        <img class="story-img" src="${story.img}" alt="Memory ${i+1}" loading="lazy" style="object-position:${story.imgPos||'center center'}">
        <div class="story-overlay overlay-${story.overlay}"></div>
        <div class="story-content">
          <span class="story-label">${story.label}</span>
          <h2 class="story-headline">${story.headline}</h2>
          <p class="story-caption">${story.caption}</p>
        </div>
      `;
    } else if(story.layout === 'card'){
      inner += `
        <img class="story-img" src="${story.img}" alt="Memory ${i+1}" loading="lazy" style="object-position:${story.imgPos||'center top'}">
        <div class="story-overlay overlay-${story.overlay}"></div>
        <div class="card-tape tl" aria-hidden="true"></div>
        <div class="card-tape tr" aria-hidden="true"></div>
        <div class="card-caption-polaroid">
          <p class="polaroid-text">${(story.polaroid||'').replace(/\n/g,'<br>')}</p>
        </div>
      `;
    } else if(story.layout === 'scrapbook'){
      inner += `
        <img class="story-img" src="${story.img}" alt="Memory ${i+1}" loading="lazy" style="object-position:${story.imgPos||'center center'}">
        <div class="story-overlay overlay-${story.overlay}"></div>
        <div class="story-content">
          <span class="story-label">${story.label}</span>
          <h2 class="story-headline">${story.headline}</h2>
          <p class="story-caption">${story.caption}</p>
        </div>
      `;
    } else {
      inner += `
        <img class="story-img" src="${story.img}" alt="Memory ${i+1}" loading="lazy" style="object-position:${story.imgPos||'center center'}">
        <div class="story-overlay overlay-${story.overlay}"></div>
        <div class="story-content">
          <span class="story-label">${story.label}</span>
          <h2 class="story-headline">${story.headline}</h2>
          <p class="story-caption">${story.caption}</p>
        </div>
      `;
    }

    slide.innerHTML = inner;
    container.appendChild(slide);
  });
}

/* ══════════════════════════════════════════════════════════
   STORY NAVIGATION
   ══════════════════════════════════════════════════════════ */
function goToSlide(index, direction='next'){
  const slides = document.querySelectorAll('.story-slide');
  const total  = slides.length;
  if(index < 0) index = 0;

  // Last slide → go to letter
  if(index >= total){
    clearAutoTimer();
    transitionTo('letter');
    return;
  }

  // Remove old classes
  slides.forEach((s,i)=>{
    s.classList.remove('active','exit-left','enter-right');
  });

  // Activate new
  const activeSlide = slides[index];
  activeSlide.classList.add('active');

  // Update progress bars
  document.querySelectorAll('.progress-seg').forEach((seg,i)=>{
    seg.classList.remove('done','active','paused');
    if(i < index) seg.classList.add('done');
    else if(i === index) seg.classList.add('active');
  });

  // Re-trigger zoom if applicable
  const img = activeSlide.querySelector('.story-img');
  if(img && activeSlide.dataset.layout === 'zoom'){
    img.style.animation = 'none';
    void img.offsetWidth;
    img.style.animation = '';
  }

  currentSlide = index;
  startAutoAdvance();
}

function nextSlide(){
  clearAutoTimer();
  goToSlide(currentSlide + 1, 'next');
  flashRight();
}
function prevSlide(){
  clearAutoTimer();
  if(currentSlide > 0) goToSlide(currentSlide - 1, 'prev');
  flashLeft();
}

function flashRight(){
  const el = document.getElementById('flash-right');
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),200);
}
function flashLeft(){
  const el = document.getElementById('flash-left');
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),200);
}

function startAutoAdvance(){
  clearAutoTimer();
  autoTimer = setTimeout(()=>{
    if(!isHolding) goToSlide(currentSlide+1);
  }, 5500);
}

function clearAutoTimer(){
  if(autoTimer){ clearTimeout(autoTimer); autoTimer=null; }
}

function pauseProgress(){
  isHolding = true;
  const seg = document.getElementById(`prog-${currentSlide}`);
  if(seg) seg.classList.add('paused');
  clearAutoTimer();
}

function resumeProgress(){
  isHolding = false;
  const seg = document.getElementById(`prog-${currentSlide}`);
  if(seg) seg.classList.remove('paused');
  startAutoAdvance();
}

/* ══════════════════════════════════════════════════════════
   MUSIC — WEB AUDIO AMBIENT TONE
   ══════════════════════════════════════════════════════════ */
function initAudio(){
  if(audioCtx) return;
  try{
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    // Gentle ambient: layered sine tones
    const freqs = [110, 165, 220, 275, 330];
    freqs.forEach((freq, i)=>{
      const osc = audioCtx.createOscillator();
      const g   = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      g.gain.setValueAtTime(0.008 - (i*0.001), audioCtx.currentTime);
      osc.connect(g);
      g.connect(gainNode);
      osc.start();

      // Subtle LFO
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 0.05 + (i * 0.02);
      lfoGain.gain.value = freq * 0.003;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
    });
  } catch(e){ console.warn('Audio unavailable'); }
}

function playMusic(){
  initAudio();
  if(!audioCtx) return;
  if(audioCtx.state === 'suspended') audioCtx.resume();
  gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 3);
  musicPlaying = true;
  updateMusicUI();
}

function pauseMusic(){
  if(!audioCtx||!gainNode) return;
  gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
  musicPlaying = false;
  updateMusicUI();
}

function updateMusicUI(){
  const bars  = document.getElementById('music-bars');
  const play  = document.getElementById('icon-play');
  const pause = document.getElementById('icon-pause');
  if(musicPlaying){
    bars.classList.remove('paused');
    play.style.display  = 'none';
    pause.style.display = '';
  } else {
    bars.classList.add('paused');
    play.style.display  = '';
    pause.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════════
   SWIPE / TOUCH HANDLING
   ══════════════════════════════════════════════════════════ */
function initTouchNavigation(){
  const screen = document.getElementById('screen-stories');
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  screen.addEventListener('touchstart', e=>{
    if(e.touches.length > 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();

    // Hold to pause
    holdTimer = setTimeout(()=>{
      pauseProgress();
    }, 300);
  }, {passive:true});

  screen.addEventListener('touchend', e=>{
    clearTimeout(holdTimer);
    if(isHolding){ resumeProgress(); return; }

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    // Only swipe if horizontal dominant and fast
    if(Math.abs(dx) > Math.abs(dy) && dt < 400 && Math.abs(dx) > 30){
      if(dx < 0) nextSlide();
      else prevSlide();
    }
  }, {passive:true});
}

/* ══════════════════════════════════════════════════════════
   EVENT LISTENERS
   ══════════════════════════════════════════════════════════ */

// Intro tap → profiles
document.getElementById('screen-intro').addEventListener('click', ()=>{
  transitionTo('profiles');
});

// Profile selection
document.querySelectorAll('.profile-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    const profile = card.dataset.profile;
    const meta    = PROFILES[profile];

    // Update story bar
    document.getElementById('story-profile-name').textContent = meta.name;
    document.getElementById('avatar-img').src = meta.img;
    document.getElementById('avatar-img').alt = profile;

    // Build & reset stories
    buildSlides();
    currentSlide = 0;

    // Haptic feedback
    if(navigator.vibrate) navigator.vibrate(12);

    // Transition
    const overlay = document.getElementById('transition-overlay');
    overlay.classList.add('fade-in');
    setTimeout(()=>{
      showScreen('stories');
      goToSlide(0);
      // Show music player after a beat
      setTimeout(()=>{
        document.getElementById('music-player').classList.add('visible');
      }, 800);
      setTimeout(()=>{
        overlay.classList.remove('fade-in');
      }, 600);
    }, 500);
  });
});

// Tap prev/next
document.getElementById('tap-prev').addEventListener('click', prevSlide);
document.getElementById('tap-next').addEventListener('click', nextSlide);

// Close stories
document.getElementById('close-stories').addEventListener('click', ()=>{
  clearAutoTimer();
  transitionTo('profiles');
  document.getElementById('music-player').classList.remove('visible');
});

// Music toggle
document.getElementById('music-toggle').addEventListener('click', ()=>{
  if(musicPlaying) pauseMusic();
  else playMusic();
});

// Replay
document.getElementById('replay-btn').addEventListener('click', ()=>{
  document.getElementById('music-player').classList.remove('visible');
  transitionTo('intro');
  pauseMusic();
});

// Keyboard nav on desktop
document.addEventListener('keydown', e=>{
  if(currentScreen !== 'stories') return;
  if(e.key === 'ArrowRight' || e.key === ' ') nextSlide();
  if(e.key === 'ArrowLeft') prevSlide();
  if(e.key === 'Escape'){
    clearAutoTimer();
    transitionTo('profiles');
  }
});

// Touch navigation
initTouchNavigation();

// Prevent pull-to-refresh on story screen
document.getElementById('screen-stories').addEventListener('touchmove', e=>{
  e.preventDefault();
},{passive:false});

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
// Preload images
const imageUrls = [
  'images/idiot_dosa_story.jpg',
  'images/funny_faces.jpg',
  'images/closeup_cheek.jpg',
  'images/mall_selfie.jpg'
];
imageUrls.forEach(url=>{
  const img = new Image();
  img.src = url;
});

// Build slides once on load (so they're ready)
buildSlides();
