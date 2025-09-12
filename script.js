// ======== Music Toggle ========
const audio = document.getElementById('bgm');
const musicBtn = document.getElementById('musicToggleBtn');

function setBtnLabel(){
  musicBtn.textContent = audio.paused ? '▶️ تشغيل الموسيقى' : '⏸️ إيقاف الموسيقى';
}
function tryPlay(){
  audio.play().then(setBtnLabel).catch(()=>{});
}
['click','touchstart'].forEach(ev => {
  window.addEventListener(ev,function once(){
    tryPlay();
    window.removeEventListener(ev, once, {capture:false});
  },{once:true});
});
musicBtn.addEventListener('click', ()=>{
  if(audio.paused) audio.play().catch(()=>{}); else audio.pause();
  setBtnLabel();
});

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  if (modal) {
    modal.hidden = true;
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute('src'); // أفضل من تعيين ''
    }
  }
});

// ======== Confetti + Celebrate Sound ========
const c = document.getElementById('confetti');
const ctx = c.getContext('2d');
let W = c.width = window.innerWidth;
let H = c.height = window.innerHeight;
window.addEventListener('resize', ()=>{ W = c.width = window.innerWidth; H = c.height = window.innerHeight; });

let parts = [];
function burst(n=180){
  for(let i=0;i<n;i++){
    parts.push({
      x: Math.random()*W, y: -20,
      vx: (Math.random()-0.5)*3, vy: Math.random()*3+2,
      s: Math.random()*6+3, a: 1,
      col: `hsl(${Math.random()*360},90%,60%)`
    });
  }
}
(function loop(){
  ctx.clearRect(0,0,W,H);
  parts.forEach(p=>{
    p.vy+=0.03; p.x+=p.vx; p.y+=p.vy; p.a-=0.006;
    ctx.globalAlpha = Math.max(p.a,0);
    ctx.fillStyle = p.col; ctx.fillRect(p.x,p.y,p.s,p.s);
  });
  parts = parts.filter(p=>p.a>0 && p.y < H+30);
  requestAnimationFrame(loop);
})();

const confettiBtn = document.getElementById('confettiBtn');
const celebrateSound = document.getElementById('celebrateSound');
confettiBtn.addEventListener('click', ()=>{
  burst(220);
  celebrateSound.currentTime = 0;
  celebrateSound.play().catch(()=>{});
});

function updateAge(){
  const start = new Date(2005, 8, 13, 0, 0, 0); // 13 سبتمبر 2005
  const now = new Date();

  let years  = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days   = now.getDate() - start.getDate();
  let hours  = now.getHours() - start.getHours();
  let mins   = now.getMinutes() - start.getMinutes();
  let secs   = now.getSeconds() - start.getSeconds();

  // اضبط القيم السالبة
  if (secs < 0) { secs += 60; mins--; }
  if (mins < 0) { mins += 60; hours--; }
  if (hours < 0){ hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0){ months += 12; years--; }

  // هنا استعمل <br> بدل \n
  const text = `${years} سنة، ${months} شهر، ${days} يوم<br>${hours} ساعة، ${mins} دقيقة، ${secs} ثانية`;

  document.getElementById('ageValue').innerHTML = text;
}


setInterval(updateAge, 1000);
updateAge();

// ======== Video Modal ========
const thumbs = document.querySelectorAll('.video-gallery .thumb');
const modal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const closeModal = document.getElementById('closeModal');

let wasMusicPlaying = false; // حالة تذكّر إذا كانت الأغنية شغالة

function openModal(src) {
  if (!modal) return;

  // لو الأغنية شغالة → وقّفها مؤقتًا
  if (!audio.paused) {
    wasMusicPlaying = true;
    audio.pause();
  } else {
    wasMusicPlaying = false;
  }

  modal.hidden = false;
  if (modalVideo) {
    modalVideo.src = src;
    modalVideo.play().catch(()=>{});
  }
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  if (!modal) return;

  modal.hidden = true;
  if (modalVideo) {
    modalVideo.pause();
    modalVideo.removeAttribute('src');
  }
  document.body.style.overflow = '';

  // إذا كانت الأغنية شغالة قبل ما يفتح الفيديو → رجّعها
  if (wasMusicPlaying) {
    audio.play().catch(()=>{});
  }
}


thumbs.forEach(vid => {
  vid.addEventListener('click', () => openModal(vid.getAttribute('src')));
});

if (closeModal) {
  closeModal.addEventListener('click', hideModal);
}

// إغلاق عند الضغط على الخلفية السوداء
if (modal) {
  modal.addEventListener('click', e => {
    if (e.target === modal) hideModal();
  });
}

// إغلاق بـ ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal && !modal.hidden) hideModal();
});

// ======== Rating & Feedback ========
const starBtns = document.querySelectorAll('.stars .star');
const notesEl = document.getElementById('feedbackNotes');
const saveBtn = document.getElementById('saveRatingBtn');
const rateStatus = document.getElementById('rateStatus');

let currentRating = 0;

// تفعيل/إلغاء تفعيل النجوم بصريًا
function paintStars(val) {
  starBtns.forEach(btn => {
    const v = Number(btn.dataset.value);
    btn.classList.toggle('active', v <= val);
  });
}

starBtns.forEach(btn => {
  btn.addEventListener('mouseenter', () => paintStars(Number(btn.dataset.value)));
  btn.addEventListener('mouseleave', () => paintStars(currentRating));
  btn.addEventListener('click', () => {
    currentRating = Number(btn.dataset.value);
    paintStars(currentRating);
  });
});

// حفظ التقييم: localStorage + تنزيل ملف TXT
const API_URL = 'https://bday-site-two.vercel.app/api/rate'; // عدّل الرابط

async function saveRating() {
  if (!currentRating) { rateStatus.textContent = 'اختر التقييم أولًا.'; return; }
  const notes = (notesEl?.value || '').trim();

  try {
    
    const res = await fetch(API_URL, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        rating: currentRating,
        notes,
        secret: 'mys3cret_123' // نفس RATE_SECRET
      })
    });
    const data = await res.json();

    console.log("API response:", data);
    rateStatus.textContent = data.ok ? 'تم الإرسال لتليجرام ✅' : '1فشل الإرسال ❌';
  } catch {
    rateStatus.textContent = '1تعذر الاتصال بالخادم ❌';
  }
}


if (saveBtn) {
  saveBtn.addEventListener('click', saveRating);
}

