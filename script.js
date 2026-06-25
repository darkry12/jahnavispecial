const app = document.querySelector("#memoryApp");
const openingScreen = document.querySelector("#openingScreen");
const storyScreen = document.querySelector("#storyScreen");
const progressTrack = document.querySelector("#progressTrack");
const storyBlurBg = document.querySelector("#storyBlurBg");
const storyStage = document.querySelector("#storyStage");
const storyEffects = document.querySelector("#storyEffects");
const appParticles = document.querySelector("#appParticles");
const transitionLayer = document.querySelector("#netflixTransition");
const musicToggle = document.querySelector("#musicToggle");
const navPrev = document.querySelector("#navPrev");
const navNext = document.querySelector("#navNext");
const profiles = document.querySelectorAll(".profile-card");

const stories = [
  {
    type: "photo",
    image: "images/hero_fairy_light.jpg",
    focus: "center center",
    label: "01 / Fairy lights",
    title: "Tu fairy lights se zyada glow kar rahi thi.",
    text: "Sach bolu, lights background mein thi. Main attention toh obviously tu le gayi."
  },
  {
    type: "photo",
    image: "images/closeup_cheek.jpg",
    focus: "center top",
    label: "02 / Soft chaos",
    title: "Tu realize bhi nahi karti.",
    text: "Kitne logon ka day better kar deti hai tu, bas ek smile ya ek random expression se."
  },
  {
    type: "photo",
    image: "images/white_dress.jpg",
    focus: "center center",
    label: "03 / Just you",
    title: "Is photo mein tu effortless lag rahi hai.",
    text: "Like tu try bhi nahi karti, and still somehow poora frame expensive lagne lagta hai."
  },
  {
    type: "photo",
    image: "images/saree_smile.jpg",
    focus: "center center",
    label: "04 / That smile",
    title: "Teri smile unfair hai.",
    text: "Matlab seriously, koi itna sweet aur itna dangerous same time pe kaise ho sakta hai?"
  },
  {
    type: "photo",
    image: "images/funny_faces.jpg",
    focus: "center center",
    label: "05 / No filter",
    title: "Is photo mein bhi tu random baat pe hass rahi hogi.",
    text: "Aur wahi best part hai. Tu posed photos se zyada real moments mein cute lagti hai."
  },
  {
    type: "photo",
    image: "images/navratri_mirror.jpg",
    focus: "center center",
    label: "06 / Mirror night",
    title: "Tu full main-character lag rahi thi.",
    text: "Navratri, mirror, lights, outfit, sab perfect. But honestly, confidence tera best accessory tha."
  },
  {
    type: "photo",
    image: "images/bestfriend_hug.jpg",
    focus: "center center",
    label: "07 / Warmth",
    title: "Tu safe feeling deti hai.",
    text: "Kuch log loud hote hain. Tu bas present hoti hai, aur things thodi easier lagne lagti hain."
  },
  {
    type: "photo",
    image: "images/idiot_dosa_story.jpg",
    focus: "center center",
    label: "08 / Dosa file",
    title: "Tu aur tere stupid memories.",
    text: "Dosa, jokes, random drama, sab kuch itna silly hai, but somehow mujhe bahut special lagta hai."
  },
  {
    type: "photo",
    image: "images/mall_selfie.jpg",
    focus: "center center",
    label: "09 / Us",
    title: "Ye photo simple hai, but favourite hai.",
    text: "Because isme hum dono hain. No perfect pose, no perfect timing, bas ek memory jo real lagti hai."
  },
  {
    type: "letter",
    label: "Final note",
    title: "Hey you ❤️",
    lines: [
      "Main ye sab likhte hue honestly thoda awkward feel kar raha hoon, kyunki real feelings ko fancy words mein fit karna easy nahi hota.",
      "Tu shayad kabhi samajh bhi nahi payegi ki kitni baar tune bina jaane meri help ki hai.",
      "Kabhi ek normal sa message, kabhi tera stupid joke, kabhi sirf ye feel hona ki tu around hai.",
      "I do not think you try to be important. Tu bas apni tarah rehti hai, and that is exactly why you matter.",
      "Tu seriously duniya ki sabse zyada sleepy insaan hai 😭, but somehow even that has become one of my favourite things about you.",
      "Tera hasna, tera annoy karna, tera random drama, tera kabhi-kabhi overthink karna, sab kuch very you hai.",
      "Aur mujhe woh version of you bahut pasand hai. Not perfect. Not always sorted. Bas real.",
      "Mall wali photo special hai because usme hum dono hain, but baaki photos bhi special hain because they are pieces of you.",
      "You never realize how easily you can make a room lighter.",
      "Kabhi kabhi tu bas ek line bolti hai and my mood genuinely better ho jata hai.",
      "I know main hamesha properly express nahi karta, but you are important to me. More than I probably say.",
      "So thank you. For being funny, soft, irritating, sleepy, dramatic, kind, and completely you.",
      "Aur haan, agar ye sab padh ke tu smile kar rahi hai, toh good. Mission successful.",
      "Your Idiot Dosa ❤️"
    ]
  }
];

let currentIndex = 0;
let started = false;
let touchStartX = 0;
let audioContext;
let audioNodes = [];

const random = (min, max) => min + Math.random() * (max - min);

const createAmbientParticles = () => {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 54; i += 1) {
    const dot = document.createElement("span");
    dot.className = i % 7 === 0 ? "fairy" : "particle";
    dot.style.left = `${random(0, 100)}%`;
    dot.style.top = `${random(0, 100)}%`;
    dot.style.setProperty("--size", `${random(2, 6)}px`);
    dot.style.setProperty("--duration", `${random(8, 17)}s`);
    dot.style.setProperty("--delay", `${random(-14, 0)}s`);
    dot.style.setProperty("--drift", `${random(-54, 54)}px`);
    fragment.appendChild(dot);
  }

  appParticles.appendChild(fragment);
};

const createSlideEffects = (isLetter = false) => {
  storyEffects.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const particleCount = isLetter ? 36 : 22;

  for (let i = 0; i < particleCount; i += 1) {
    const dot = document.createElement("span");
    dot.className = i % 4 === 0 ? "fairy" : "particle";
    dot.style.left = `${random(0, 100)}%`;
    dot.style.top = `${random(12, 100)}%`;
    dot.style.setProperty("--size", `${random(2, 7)}px`);
    dot.style.setProperty("--duration", `${random(7, 15)}s`);
    dot.style.setProperty("--delay", `${random(-10, 0)}s`);
    dot.style.setProperty("--drift", `${random(-42, 42)}px`);
    fragment.appendChild(dot);
  }

  if (isLetter) {
    for (let i = 0; i < 8; i += 1) {
      const heart = document.createElement("span");
      heart.className = "heart-outline";
      heart.style.left = `${random(8, 92)}%`;
      heart.style.top = `${random(18, 92)}%`;
      heart.style.setProperty("--size", `${random(14, 30)}px`);
      heart.style.setProperty("--duration", `${random(8, 16)}s`);
      heart.style.setProperty("--delay", `${random(-10, 0)}s`);
      heart.style.setProperty("--drift", `${random(-60, 60)}px`);
      fragment.appendChild(heart);
    }

    for (let i = 0; i < 10; i += 1) {
      const note = document.createElement("span");
      note.className = "note-paper";
      note.style.left = `${random(5, 95)}%`;
      note.style.top = `${random(20, 96)}%`;
      note.style.setProperty("--duration", `${random(10, 18)}s`);
      note.style.setProperty("--delay", `${random(-12, 0)}s`);
      note.style.setProperty("--drift", `${random(-70, 70)}px`);
      fragment.appendChild(note);
    }
  }

  storyEffects.appendChild(fragment);
};

const createProgress = () => {
  progressTrack.innerHTML = stories.map(() => (
    '<span class="progress-segment"><span class="progress-fill"></span></span>'
  )).join("");
};

const updateProgress = () => {
  progressTrack.querySelectorAll(".progress-segment").forEach((segment, index) => {
    segment.classList.toggle("is-complete", index < currentIndex);
    segment.classList.toggle("is-current", index === currentIndex);
  });
};

const photoSlide = (story, direction) => `
  <article class="slide photo-slide" style="--enter-x:${direction * 34}px">
    <img class="poster-img" src="${story.image}" alt="${story.title}" style="--focus:${story.focus};--move-x:${direction * -10}px;--move-y:${random(-8, 8)}px">
    <div class="caption-block">
      <p class="kicker">${story.label}</p>
      <h2 class="slide-title">${story.title}</h2>
      <p class="slide-text">${story.text}</p>
    </div>
  </article>
`;

const letterSlide = (story) => {
  const lines = story.lines.map((line) => `<p class="letter-line">${line}</p>`).join("");
  return `
    <article class="slide letter-slide" style="--enter-x:28px">
      <div class="letter-scroll">
        <div class="letter-panel">
          <h2 class="letter-heading">${story.title}</h2>
          <p class="letter-subtitle">${story.label}</p>
          <div class="letter-lines">${lines}</div>
          <div class="ending-magic" aria-hidden="true">
            <div class="light-string" id="lightString"></div>
          </div>
          <div class="letter-actions">
            <button class="letter-action" type="button" data-action="replay">Replay</button>
            <button class="letter-action" type="button" data-action="back">Back</button>
          </div>
        </div>
      </div>
    </article>
  `;
};

const addFairyLights = () => {
  const lightString = document.querySelector("#lightString");
  if (!lightString) return;

  for (let i = 0; i < 13; i += 1) {
    const bulb = document.createElement("span");
    bulb.className = "bulb";
    bulb.style.setProperty("--left", `${i * 8.2}%`);
    bulb.style.setProperty("--top", `${Math.sin(i / 1.3) * 18 + 22}px`);
    bulb.style.setProperty("--delay", `${i * 0.12}s`);
    lightString.appendChild(bulb);
  }
};

const revealLetterLines = () => {
  document.querySelectorAll(".letter-line").forEach((line, index) => {
    setTimeout(() => line.classList.add("is-visible"), 380 + index * 170);
  });
};

const renderStory = (direction = 1) => {
  const story = stories[currentIndex];
  const isLetter = story.type === "letter";

  storyScreen.classList.toggle("is-letter", isLetter);
  storyBlurBg.style.backgroundImage = story.image ? `url("${story.image}")` : "none";
  storyStage.innerHTML = isLetter ? letterSlide(story) : photoSlide(story, direction);
  createSlideEffects(isLetter);
  updateProgress();

  requestAnimationFrame(() => {
    const slide = storyStage.querySelector(".slide");
    slide.classList.add("is-visible");

    if (isLetter) {
      addFairyLights();
      revealLetterLines();
    }
  });
};

const goTo = (index, direction = 1) => {
  if (index < 0 || index >= stories.length || index === currentIndex) return;
  currentIndex = index;
  renderStory(direction);
};

const nextStory = () => goTo(currentIndex + 1, 1);
const prevStory = () => goTo(currentIndex - 1, -1);

const isControlTarget = (target) => (
  Boolean(target.closest(".music-toggle, .letter-action, .progress-track"))
);

const isScrollableLetterTarget = (target) => (
  storyScreen.classList.contains("is-letter") && Boolean(target.closest(".letter-scroll"))
);

const handleStoryTap = (event) => {
  if (!storyScreen.classList.contains("is-active")) return;
  if (isControlTarget(event.target) || isScrollableLetterTarget(event.target)) return;

  const screenMidpoint = storyScreen.getBoundingClientRect().left + storyScreen.getBoundingClientRect().width / 2;

  if (event.clientX < screenMidpoint) {
    prevStory();
  } else {
    nextStory();
  }
};

const startStory = (profile) => {
  if (started) return;
  started = true;

  const image = profile.dataset.image;
  const profileRect = profile.querySelector(".profile-image").getBoundingClientRect();
  const appRect = app.getBoundingClientRect();
  const originX = profileRect.left + profileRect.width / 2 - (appRect.left + appRect.width / 2);
  const originY = profileRect.top + profileRect.height / 2 - (appRect.top + appRect.height / 2);

  transitionLayer.style.setProperty("--chosen-image", `url("${image}")`);
  transitionLayer.style.setProperty("--origin-x", `${originX}px`);
  transitionLayer.style.setProperty("--origin-y", `${originY}px`);
  transitionLayer.classList.add("is-running");
  openingScreen.classList.add("is-leaving");

  setTimeout(() => {
    storyScreen.classList.add("is-active");
    renderStory(1);
  }, 360);

  setTimeout(() => {
    openingScreen.hidden = true;
    transitionLayer.classList.remove("is-running");
  }, 1260);
};

const toggleMusic = async () => {
  musicToggle.classList.toggle("is-on");

  if (!musicToggle.classList.contains("is-on")) {
    audioNodes.forEach((node) => node.stop && node.stop());
    audioNodes = [];
    return;
  }

  audioContext = audioContext || new AudioContext();
  await audioContext.resume();

  const master = audioContext.createGain();
  master.gain.value = 0.026;
  master.connect(audioContext.destination);

  [174.61, 220, 261.63, 329.63].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index % 2 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.55 : 0.22;
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();
    audioNodes.push(oscillator);
  });
};

profiles.forEach((profile) => profile.addEventListener("click", () => startStory(profile)));
navNext.addEventListener("click", (event) => {
  event.stopPropagation();
  nextStory();
});
navPrev.addEventListener("click", (event) => {
  event.stopPropagation();
  prevStory();
});
musicToggle.addEventListener("click", toggleMusic);
storyScreen.addEventListener("click", handleStoryTap);

storyStage.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (action === "replay") {
    currentIndex = 0;
    renderStory(-1);
  }
  if (action === "back") prevStory();
});

app.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
}, { passive: true });

app.addEventListener("touchend", (event) => {
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 44) return;
  if (delta < 0) nextStory();
  if (delta > 0) prevStory();
}, { passive: true });

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") nextStory();
  if (event.key === "ArrowLeft") prevStory();
});

createProgress();
createAmbientParticles();
