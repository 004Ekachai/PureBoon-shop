import { db } from './firebase.js';
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------------- HERO ---------------- */
let current = 0;
let total = 0;
let timer;

const track = document.getElementById('heroTrack');
const dotsWrap = document.getElementById('dots');
document.getElementById('prevBtn').addEventListener('click', ()=> move(-1));
document.getElementById('nextBtn').addEventListener('click', ()=> move(+1));

function move(step){
  if(total === 0) return;
  current = (current + step + total) % total;
  updateTrack();
  restartAuto();
}

function gotoIdx(i){
  current = i;
  updateTrack();
  restartAuto();
}

function updateTrack(){
  track.style.transform = `translateX(-${current*100}%)`;
  [...dotsWrap.children].forEach((d,i)=> d.classList.toggle('active', i===current));
}

function restartAuto(){
  clearInterval(timer);
  timer = setInterval(()=> move(+1), 3000);
}

async function loadHero(){
  const snap = await getDoc(doc(db, "homepage", "hero"));
  if(!snap.exists()) return;
  const slides = (snap.data().slides || []).filter(s=>s && s.image);
  total = slides.length;

  track.innerHTML = slides.map((s)=>`
    <article class="hero-slide">
      <div class="hero-text">
        <h1>${s.title ?? ""}</h1>
        <p>${s.subtitle ?? ""}</p>
      </div>
      <figure class="hero-figure">
        <img src="${s.image}" alt="${s.title ?? 'slide'}">
      </figure>
    </article>
  `).join("");

  dotsWrap.innerHTML = slides.map((_,i)=>`<span class="dot ${i===0?'active':''}" data-i="${i}"></span>`).join("");
  dotsWrap.querySelectorAll('.dot').forEach(d=> d.addEventListener('click', e=> gotoIdx(Number(e.target.dataset.i))));

  current = 0; updateTrack(); restartAuto();
}

/* ---------------- POPULAR ---------------- */
async function loadPopular(){
  const qs = await getDocs(collection(db, "products"));
  const arr = [];
  qs.forEach(d=> arr.push({id:d.id, ...d.data()}));
  const pick = arr.sort(()=>0.5-Math.random()).slice(0,3);

  const grid = document.getElementById('popularGrid');
  grid.innerHTML = pick.map(p=>{
    const basePrice = (p.sizePrice && Object.values(p.sizePrice)[0]) || p.price || 0;
    const img = p.image || (p.images && p.images[0]) || "https://picsum.photos/seed/pb/600/400";
    return `
      <div class="product-card">
        <img src="${img}" alt="${p.name||'product'}"/>
        <h3>${p.name||'สินค้า'}</h3>
        <div class="price">เริ่มต้นที่ ${basePrice} บาท</div>
        <button onclick="location.href='product.html?id=${p.id}'">สั่งซื้อ</button>
      </div>
    `;
  }).join("");
}

/* ---------------- KNOWLEDGE ---------------- */
async function loadKnowledge(){
  const snap = await getDoc(doc(db, "homepage", "knowledge"));
  if(!snap.exists()) return;
  const items = snap.data().items || [];
  const grid = document.getElementById('knowledgeGrid');
  grid.innerHTML = items.map(k=>`
    <article class="k-card">
      <img src="${k.image}" alt="${k.title}"/>
      <div class="bx">
        <h3>${k.title}</h3>
        <p>${k.description||""}</p>
        <a href="${k.link||'#'}">อ่านต่อ</a>
      </div>
    </article>
  `).join("");
}

/* ---------------- FOOTER ---------------- */
async function loadFooter(){
  const snap = await getDoc(doc(db, "homepage", "footer"));
  if(!snap.exists()) return;
  const f = snap.data();
  const el = document.getElementById('footer');
  el.innerHTML = `
    <div>ติดต่อ: ${f?.contact?.phone||''} • ${f?.contact?.email||''}</div>
    <div style="margin-top:6px;">
      <a href="${f?.social?.facebook||'#'}">Facebook</a> •
      <a href="${f?.social?.instagram||'#'}">Instagram</a> •
      <a href="${f?.social?.line||'#'}">Line</a>
    </div>
  `;
}

/* init */
loadHero();
loadPopular();
loadKnowledge();
loadFooter();
