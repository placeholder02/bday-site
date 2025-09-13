// ======== Music Toggle ========
const audio = document.getElementById('bgm');
const musicBtn = document.getElementById('musicToggleBtn');

function setBtnLabel(){
  musicBtn.textContent = audio.paused ? '▶️' : '⏸️';
}

function tryPlay(){
  audio.play().then(setBtnLabel).catch(()=>{});
}
// ======== First Interaction: start music + celebrate + confetti (once) ========
let firstInteractionDone = false;

function handleFirstInteraction(){
  if (firstInteractionDone) return;
  firstInteractionDone = true;

  tryPlay(); // bg music
  celebrateSound.currentTime = 0;
  celebrateSound.play().catch(()=>{});
  burst(220);
}

// شغّل مرة واحدة قبل أي handlers ثانية (capture)
window.addEventListener('pointerdown', handleFirstInteraction, { once:true, capture:true });
// (اختياري للمفاتيح على اللابتوب)
window.addEventListener('keydown', handleFirstInteraction, { once:true, capture:true });


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

let wasMusicPlaying = false;

function openModal(src) {
  if (!modal) return;

  // احفظ إذا الموسيقى كانت شغّالة فعلا الآن
  wasMusicPlaying = !audio.paused;
  if (wasMusicPlaying) audio.pause();

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

  // ارجع الموسيقى فقط إذا كانت شغالة قبل ما نفتح
  if (wasMusicPlaying) {
    audio.play().catch(()=>{});
  }
}


thumbs.forEach(vid => {
  const source = vid.querySelector('source');
  if (source) {
    vid.addEventListener('click', () => openModal(source.getAttribute('src')));
  }
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

// ======== Image Modal ========
const imgTiles = document.querySelectorAll('.image-gallery img');
const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const imgCaption = document.getElementById('imgCaption');
const closeImageModal = document.getElementById('closeImageModal');
const memorySound = document.getElementById('memorySound');

function openImageModal(src, caption, triggerId) {
  if (!imageModal) return;

  // وقف الموسيقى الأساسية مؤقتًا
  if (!audio.paused) {
    wasMusicPlaying = true;
    audio.pause();
  } else {
    wasMusicPlaying = false;
  }

  imageModal.hidden = false;
  if (modalImg) modalImg.src = src || '';
  if (imgCaption) imgCaption.textContent = caption || '';
  document.body.style.overflow = 'hidden';

  // 🔹 لو الصورة هي memory3 → شغّل الأغنية الخاصة
  if (triggerId === 'memory3') {
    memorySound.currentTime = 0;
    memorySound.play().catch(()=>{});
  }
}

function hideImageModal() {
  if (!imageModal) return;

  imageModal.hidden = true;
  if (modalImg) modalImg.removeAttribute('src');
  if (imgCaption) imgCaption.textContent = '';
  document.body.style.overflow = '';

  // 🔹 أوقف أغنية memory.mp3 لو كانت شغالة
  memorySound.pause();
  memorySound.currentTime = 0;

  // رجّع الموسيقى الأساسية إذا كانت شغّالة قبل
  if (wasMusicPlaying) {
    audio.play().catch(()=>{});
  }
}

// فتح عند الضغط على صورة
imgTiles.forEach(img => {
  img.addEventListener('click', () => {
    const src = img.getAttribute('src');
    const caption = img.dataset.caption || '';
    const id = img.getAttribute('alt')?.toLowerCase().includes('3') ? 'memory3' : '';
    openImageModal(src, caption, id);
  });
});

// إغلاقات المودال
if (closeImageModal) closeImageModal.addEventListener('click', hideImageModal);
if (imageModal) {
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) hideImageModal(); // كبسة على الخلفية
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && imageModal && !imageModal.hidden) hideImageModal();
});

// ======== تحديث فتح الفيديو للـ <source> الجديد (لو ما عدلته قبل) ========
thumbs.forEach(vid => {
  const source = vid.querySelector('source');
  if (source) {
    vid.addEventListener('click', () => openModal(source.getAttribute('src')));
  }
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

const nameEl = document.getElementById('feedbackName');

async function saveRating() {
  if (!currentRating) { 
    rateStatus.textContent = 'اختر التقييم أولًا.'; 
    return; 
  }
  const notes = (notesEl?.value || '').trim();
  const name  = (nameEl?.value || '').trim();

  try {
    const res = await fetch(API_URL, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        rating: currentRating,
        notes,
        name,
        secret: 'mys3cret_123'
      })
    });
    const data = await res.json();
    rateStatus.textContent = data.ok ? 'تم الإرسال ✅' : 'فشل الإرسال ❌';
  } catch (err) {
    console.error("Error calling API:", err);
    rateStatus.textContent = 'تعذر الاتصال بالخادم ❌';
  }
}


if (saveBtn) {
  saveBtn.addEventListener('click', saveRating);
}


// توليد إيموجيات كيك 🎂 عشوائية
(function mountEmojiBG(){
  let bg = document.querySelector('.emoji-bg');
  if(!bg){
    bg = document.createElement('div');
    bg.className = 'emoji-bg';
    document.body.prepend(bg);
  }

  const COUNT = 200; // عدد الإيموجيات
  const W = window.innerWidth;
  const H = window.innerHeight * 3; // يغطي أول 3 شاشات طول
  var EMOJI = '🎂'; // أو 🎉

  for(let i=0; i<COUNT; i++){
    if(Math.random()*10>5)
      EMOJI = '🎂';
    else
      EMOJI = '🎉';
    const s = document.createElement('span');
    s.textContent = EMOJI;
    var size;
    if(EMOJI == '🎉')
      size = 12 + Math.random()*24;   // حجم متغير
    else
      size = 24 + Math.random()*36;   // حجم متغير
    s.style.fontSize = size + 'px';
    s.style.left = Math.random()*W + 'px';
    s.style.top  = Math.random()*H + 'px';
    s.style.opacity = 0.1 + Math.random()*0.05;

    const rotation = (Math.random() * 60 - 30).toFixed(2);
    s.style.transform = `rotate(${rotation}deg)`;

    bg.appendChild(s);
  }
})();

// script.js (مرة عند التحميل)
fetch('https://bday-site-two.vercel.app/api/visit', {
  method:'POST',
  headers:{ 'Content-Type':'application/json' },
  body: JSON.stringify({ secret: 'visit_s3cret_123' })
}).catch(()=>{});
