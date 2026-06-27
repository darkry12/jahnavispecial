'use strict';

/* ─── STATE ──────────────────────────── */
const S = {
  slide:0, total:8, busy:false,
  music:false, profile:null,
  tx0:0, ty0:0, tx1:0, ty1:0,
};

/* ─── DOM REFS — assigned in init() ─── */
let sIntro,sLoad,sStory,progFill,counter,dotRow,
    navPrev,navNext,audio,mBtn,mWrap,ldBar,
    ldCenter,ldLabel,ldName,fade,canvas,ctx;

/* ─── PARTICLES ──────────────────────── */
let pts=[],pActive=false,pRAF=null;
function pResize(){if(!canvas)return;canvas.width=window.innerWidth;canvas.height=window.innerHeight}
function pNew(){return{x:Math.random()*canvas.width,y:canvas.height+8,r:Math.random()*1.6+.3,vy:Math.random()*.6+.2,vx:(Math.random()-.5)*.3,a:0,maxA:Math.random()*.45+.08,life:0,max:Math.random()*220+130}}
function pTick(){
  if(!ctx||!pActive)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(pts.length<40&&Math.random()<.3)pts.push(pNew());
  pts=pts.filter(p=>p.life<p.max);
  pts.forEach(p=>{
    p.life++;p.y-=p.vy;p.x+=p.vx;
    const t=p.life/p.max;
    p.a=t<.15?(t/.15)*p.maxA:t>.75?((1-t)/.25)*p.maxA:p.maxA;
    ctx.save();ctx.globalAlpha=p.a;ctx.fillStyle='#c9a96e';
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();
  });
  pRAF=requestAnimationFrame(pTick);
}
function pStart(){if(pActive||!canvas)return;pActive=true;canvas.classList.add('on');pTick()}
function pStop(){pActive=false;if(canvas)canvas.classList.remove('on');if(pRAF)cancelAnimationFrame(pRAF);if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);pts=[]}

/* ─── FLOATING STARS ON INTRO ────────── */
function buildStars(){
  let host=document.getElementById('intro-stars-host');
  if(host)host.remove();
  host=document.createElement('div');
  host.id='intro-stars-host';
  host.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1';
  for(let i=0;i<45;i++){
    const d=document.createElement('div');
    const sz=(Math.random()*1.8+.4).toFixed(1);
    const dur=(Math.random()*10+5).toFixed(1);
    const del=(Math.random()*10).toFixed(1);
    const left=(Math.random()*100).toFixed(1);
    d.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:#c9a96e;left:${left}%;bottom:-5%;opacity:0;animation:stRise ${dur}s ${del}s linear infinite`;
    host.appendChild(d);
  }
  if(!document.getElementById('st-kf')){
    const s=document.createElement('style');s.id='st-kf';
    s.textContent='@keyframes stRise{0%{transform:translateY(0) scale(0);opacity:0}8%{opacity:.5;transform:translateY(-4vh) scale(1)}85%{opacity:.2}100%{transform:translateY(-105vh) scale(.3);opacity:0}}';
    document.head.appendChild(s);
  }
  if(sIntro)sIntro.appendChild(host);
}

/* ─── INIT ───────────────────────────── */
function init(){
  sIntro  =document.getElementById('screen-intro');
  sLoad   =document.getElementById('screen-loading');
  sStory  =document.getElementById('screen-story');
  progFill=document.getElementById('prog-fill');
  counter =document.getElementById('story-counter');
  dotRow  =document.getElementById('dot-row');
  navPrev =document.getElementById('nav-prev');
  navNext =document.getElementById('nav-next');
  audio   =document.getElementById('audio');
  mBtn    =document.getElementById('music-btn');
  mWrap   =document.getElementById('music-wrap');
  ldBar   =document.getElementById('ld-bar');
  ldCenter=document.querySelector('.ld-center');
  ldLabel =document.getElementById('ld-label');
  ldName  =document.getElementById('ld-name');
  fade    =document.getElementById('fade-overlay');
  canvas  =document.getElementById('particle-canvas');
  if(canvas)ctx=canvas.getContext('2d');

  pResize();
  window.addEventListener('resize',pResize);
  buildStars();
  bindCards();
  bindNav();
  buildDots();
  bindKeys();
  bindSwipe();
  bindWheel();
  updateNav();
}

/* ─── CARD BINDING ───────────────────── */
function bindCards(){
  const cards=document.querySelectorAll('.nf-card');
  cards.forEach(card=>{
    const tap=card.querySelector('.nf-tap');
    if(!tap)return;

    // hover shimmer on desktop
    tap.addEventListener('mouseenter',()=>card.classList.add('hov'));
    tap.addEventListener('mouseleave',()=>card.classList.remove('hov'));

    // press feedback
    tap.addEventListener('mousedown',()=>{card.style.transform='scale(.97)';card.classList.add('hov')});
    tap.addEventListener('mouseup',  ()=>{card.style.transform='';});

    // CLICK — primary desktop trigger
    tap.addEventListener('click',function(e){
      e.stopPropagation();
      doSelect(card,e);
    });

    // TOUCHSTART — visual feedback immediately
    tap.addEventListener('touchstart',function(e){
      card.classList.add('hov');
    },{passive:true});

    // TOUCHEND — primary mobile trigger
    tap.addEventListener('touchend',function(e){
      e.preventDefault();   // stop ghost click
      e.stopPropagation();
      card.classList.remove('hov');
      doSelect(card,e.changedTouches[0]);
    },{passive:false});

    tap.addEventListener('touchcancel',()=>card.classList.remove('hov'),{passive:true});
  });

  // Replay button
  const rb=document.getElementById('replay-btn');
  if(rb){
    rb.addEventListener('click',restartExperience);
    rb.addEventListener('touchend',function(e){e.preventDefault();restartExperience()},{passive:false});
  }

  // Music button
  if(mBtn){
    mBtn.addEventListener('click',toggleMusic);
    mBtn.addEventListener('touchend',function(e){e.preventDefault();toggleMusic()},{passive:false});
  }
}

/* ─── RIPPLE EFFECT ──────────────────── */
function fireRipple(card,touch){
  const host=document.getElementById('ripple-host');
  if(!host)return;
  const rect=card.querySelector('.nf-card-inner').getBoundingClientRect();
  const x=(touch?touch.clientX:rect.left+rect.width/2)-rect.left;
  const y=(touch?touch.clientY:rect.top+rect.height/2)-rect.top;
  const size=Math.max(rect.width,rect.height);
  const r=document.createElement('div');
  r.className='nf-ripple';
  r.style.cssText=`width:${size}px;height:${size}px;left:${rect.left+x-size/2}px;top:${rect.top+y-size/2}px;position:fixed`;
  host.appendChild(r);
  setTimeout(()=>r.remove(),700);
}

/* ─── PROFILE SELECT ─────────────────── */
function doSelect(card,touchOrEvent){
  if(S.profile)return;
  S.profile=card.dataset.name||'Jahnavi';

  fireRipple(card,touchOrEvent&&touchOrEvent.clientX?touchOrEvent:null);

  // Gold ring flash
  card.classList.add('sel');
  ldName.textContent=S.profile;

  // Fade out others with stagger
  document.querySelectorAll('.nf-card').forEach((c,i)=>{
    if(c!==card){
      setTimeout(()=>{
        c.style.transition='opacity .45s ease,transform .45s ease';
        c.style.opacity='0';
        c.style.transform='translateY(14px) scale(.9)';
      },i*70);
    }
  });

  // Gold flash on overlay
  if(fade){
    fade.style.background='rgba(201,169,110,.07)';
    fade.style.transition='opacity .15s ease';
    fade.style.opacity='.7';
    setTimeout(()=>{fade.style.opacity='0';setTimeout(()=>{fade.style.background='#000';fade.style.transition='opacity .32s ease'},200)},150);
  }

  setTimeout(goLoad,900);
}

/* expose globally just in case any old inline handler fires */
window.selectProfile=function(el){
  const card=el.closest?el.closest('.nf-card'):el;
  if(card)doSelect(card,null);
};

/* ─── LOADING ────────────────────────── */
function goLoad(){
  if(!fade||!sIntro||!sLoad)return;
  fade.style.background='#000';
  fade.classList.add('on');
  setTimeout(()=>{
    sIntro.classList.remove('active');sIntro.classList.add('out');
    sLoad.classList.add('active');
    fade.classList.remove('on');
    requestAnimationFrame(()=>{
      setTimeout(()=>{
        ldBar.style.width='100%';
        setTimeout(()=>{
          ldCenter.classList.add('show');
          ldLabel.style.opacity='0';
          setTimeout(()=>{ldLabel.textContent='Gathering your memories…';ldLabel.style.opacity='1'},350);
        },800);
        setTimeout(()=>{
          fade.classList.add('on');
          setTimeout(()=>{
            sLoad.classList.remove('active');sLoad.classList.add('out');
            sStory.classList.add('active');
            activateSlide(0);
            fade.classList.remove('on');
            pStart();
            setTimeout(()=>mWrap.classList.add('on'),1200);
          },380);
        },3200);
      },80);
    });
  },300);
}

/* ─── SLIDES ─────────────────────────── */
function activateSlide(idx){
  document.querySelectorAll('.slide').forEach(sl=>{
    sl.classList.remove('active');
    sl.querySelectorAll('.s1,.s2,.s3,.s4,.s5,.s6,.s7,.mem-item').forEach(el=>{
      el.style.animation='none';void el.offsetWidth;el.style.animation='';
    });
  });
  const t=document.querySelectorAll('.slide')[idx];
  if(!t)return;
  t.classList.add('active');
  S.slide=idx;
  updateProg();updateCounter();updateDots();updateNav();
}

function nextSlide(){if(S.busy||S.slide>=S.total-1)return;doTransition(S.slide+1)}
function prevSlide(){if(S.busy||S.slide<=0)return;doTransition(S.slide-1)}
function gotoSlide(i){if(S.busy||i===S.slide)return;doTransition(i)}

function doTransition(idx){
  S.busy=true;
  fade.classList.add('on');
  setTimeout(()=>{
    activateSlide(idx);
    fade.classList.remove('on');
    setTimeout(()=>S.busy=false,300);
  },200);
}

/* ─── UI ─────────────────────────────── */
function updateProg(){if(progFill)progFill.style.width=(S.slide/(S.total-1)*100)+'%'}
function updateCounter(){if(counter)counter.textContent=(S.slide+1)+' / '+S.total}
function updateNav(){
  if(navPrev)navPrev.classList.toggle('hide',S.slide===0);
  if(navNext)navNext.classList.toggle('hide',S.slide===S.total-1);
}
function buildDots(){
  if(!dotRow)return;
  dotRow.innerHTML='';
  for(let i=0;i<S.total;i++){
    const b=document.createElement('button');
    b.className='dot'+(i===0?' on':'');
    b.setAttribute('aria-label','Slide '+(i+1));
    b.addEventListener('click',()=>gotoSlide(i));
    dotRow.appendChild(b);
  }
}
function updateDots(){document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===S.slide))}

/* ─── NAV BINDING ────────────────────── */
function bindNav(){
  if(navPrev){
    navPrev.addEventListener('click',prevSlide);
    navPrev.addEventListener('touchend',function(e){e.preventDefault();prevSlide()},{passive:false});
  }
  if(navNext){
    navNext.addEventListener('click',nextSlide);
    navNext.addEventListener('touchend',function(e){e.preventDefault();nextSlide()},{passive:false});
  }
}

/* ─── KEYS ───────────────────────────── */
function bindKeys(){
  document.addEventListener('keydown',e=>{
    if(!sStory||!sStory.classList.contains('active'))return;
    if([' ','ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();nextSlide()}
    else if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();prevSlide()}
    else if(e.key==='m'||e.key==='M')toggleMusic();
  });
}

/* ─── SWIPE ──────────────────────────── */
function bindSwipe(){
  document.body.addEventListener('touchstart',e=>{S.tx0=e.changedTouches[0].screenX;S.ty0=e.changedTouches[0].screenY},{passive:true});
  document.body.addEventListener('touchend',e=>{
    S.tx1=e.changedTouches[0].screenX;S.ty1=e.changedTouches[0].screenY;
    if(!sStory||!sStory.classList.contains('active'))return;
    const dx=S.tx1-S.tx0,dy=S.ty1-S.ty0;
    if(Math.abs(dx)<40||Math.abs(dy)>Math.abs(dx)*1.4)return;
    dx<0?nextSlide():prevSlide();
  },{passive:true});
}

/* ─── WHEEL ──────────────────────────── */
let wt=null;
function bindWheel(){
  document.addEventListener('wheel',e=>{
    if(!sStory||!sStory.classList.contains('active'))return;
    if(S.slide===S.total-1)return;
    clearTimeout(wt);
    wt=setTimeout(()=>{if(e.deltaY>35)nextSlide();else if(e.deltaY<-35)prevSlide()},45);
  },{passive:true});
}

/* ─── MUSIC ──────────────────────────── */
function toggleMusic(){
  if(!audio)return;
  if(S.music){audio.pause();mBtn.classList.remove('play');S.music=false}
  else{
    audio.volume=0;
    audio.play().then(()=>{mBtn.classList.add('play');S.music=true;fadeVol(.72,1400)}).catch(()=>{});
  }
}
function fadeVol(target,ms){
  const steps=28,inc=target/steps;let cur=0;
  const iv=setInterval(()=>{cur=Math.min(cur+inc,target);audio.volume=cur;if(cur>=target)clearInterval(iv)},ms/steps);
}
document.addEventListener('DOMContentLoaded',()=>{
  const a=document.getElementById('audio'),b=document.getElementById('music-btn');
  if(a&&b){
    a.addEventListener('pause',()=>{b.classList.remove('play');S.music=false});
    a.addEventListener('play', ()=>{b.classList.add('play');   S.music=true});
  }
});

/* ─── RESTART ────────────────────────── */
function restartExperience(){
  if(!fade)return;
  fade.style.background='#000';fade.classList.add('on');
  setTimeout(()=>{
    S.slide=0;S.profile=null;S.busy=false;
    if(audio&&S.music){audio.pause();audio.currentTime=0}
    if(mBtn)mBtn.classList.remove('play');S.music=false;
    pStop();
    if(ldBar){ldBar.style.transition='none';ldBar.style.width='0'}
    if(ldCenter)ldCenter.classList.remove('show');
    if(ldLabel){ldLabel.textContent='Preparing something special…';ldLabel.style.opacity='1'}
    document.querySelectorAll('.nf-card').forEach(c=>{
      c.classList.remove('sel','hov');
      c.style.opacity='';c.style.transform='';c.style.transition='';
    });
    if(sStory){sStory.classList.remove('active');sStory.classList.add('out')}
    if(sLoad) {sLoad.classList.remove('active'); sLoad.classList.add('out')}
    if(mWrap) mWrap.classList.remove('on');
    document.querySelectorAll('.slide').forEach(sl=>sl.classList.remove('active'));
    setTimeout(()=>{
      if(sStory)sStory.classList.remove('out');
      if(sLoad) sLoad.classList.remove('out');
      if(sIntro){sIntro.classList.remove('out');sIntro.classList.add('active')}
      fade.classList.remove('on');
      setTimeout(()=>{
        if(ldBar)ldBar.style.transition='width 2.8s cubic-bezier(.25,.46,.45,.94)';
      },120);
    },300);
  },400);
}

/* ─── BOOT ───────────────────────────── */
document.addEventListener('DOMContentLoaded',init);

