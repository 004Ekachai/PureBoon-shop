import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(location.search);
const productId = params.get("id");
const detail = document.getElementById("productDetail");
const toastEl = document.getElementById("toast");
const cartCount = document.getElementById("cartCount");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = ()=>localStorage.setItem("cart", JSON.stringify(cart));
const updateCartCount = ()=> cartCount.textContent = cart.reduce((s,i)=>s+(Number(i.quantity)||0),0);
const showToast = (m)=>{ toastEl.textContent=m; toastEl.style.display='block'; setTimeout(()=>toastEl.style.display='none',1200); };
const safeQty = q => { const n = parseInt(q); return isNaN(n)||n<1?1:n; };

async function load(){
  if(!productId){ detail.innerHTML = "<div class='card-body'>ไม่พบรหัสสินค้า</div>"; return; }
  const snap = await getDoc(doc(db,"products",productId));
  if(!snap.exists()){ detail.innerHTML = "<div class='card-body'>ไม่พบสินค้า</div>"; return; }
  const p = snap.data();
  const sizes = Object.keys(p.sizePrice||{});
  const defaultSize = sizes[0]||"";
  const defaultPrice = (p.sizePrice||{})[defaultSize] || 0;
  const images = (p.images && p.images.length)? p.images : [p.image];

  detail.innerHTML = `
    <div class="row g-4 p-3">
      <div class="col-md-6">
        <img id="mainImg" class="img-fluid product-hero" src="${images[0]||''}" alt="${p.name||''}"/>
        <div class="thumb d-flex gap-2 mt-3">
          ${images.map(src=>`<img src="${src}" onclick="document.getElementById('mainImg').src='${src}'">`).join('')}
        </div>
      </div>
      <div class="col-md-6">
        <h4>${p.name||''}</h4>
        <small class="text-muted">ประเภท: ${p.category||''}</small>
        ${p.description? `<p class='mt-2'>${p.description}</p>`:''}
        ${Array.isArray(p.features)&&p.features.length? `<ul>${p.features.map(f=>`<li>${f}</li>`).join('')}</ul>`:''}
        <div class="d-flex align-items-center gap-2 mt-3">
          <select id="sizeSel" class="form-select" style="width:120px">
            ${sizes.map(s=>`<option value="${s}">${s}</option>`).join('')}
          </select>
          <input type="number" id="qty" class="form-control" value="1" min="1" style="width:100px">
          <span id="priceEl" class="text-success fw-bold">฿${defaultPrice}</span>
          <button id="addBtn" class="btn btn-green"><i class="fa-solid fa-cart-plus"></i> เพิ่มลงตะกร้า</button>
        </div>
        <div class="mt-3">
          <a href="shop.html" class="btn btn-outline-secondary"><i class="fa-solid fa-arrow-left"></i> กลับสู่ร้านค้า</a>
        </div>
      </div>
    </div>
  `;

  const sizeSel = document.getElementById("sizeSel");
  const priceEl = document.getElementById("priceEl");
  sizeSel.addEventListener("change", ()=> priceEl.textContent = "฿"+((p.sizePrice||{})[sizeSel.value]||0));

  document.getElementById("addBtn").addEventListener("click", ()=>{
    const selectedSize = sizeSel.value || defaultSize;
    const price = Number((p.sizePrice||{})[selectedSize]) || 0;
    const quantity = safeQty(document.getElementById("qty").value);
    const existing = cart.find(i=> i.id===productId && (i.selectedSize||i.size)===selectedSize);
    if(existing){ existing.quantity += quantity; existing.price = price; }
    else{
      cart.push({
        id: productId, name: p.name, size: selectedSize, selectedSize,
        price, quantity, image: p.image||"", category: p.category||"", sizePrice: p.sizePrice||{}
      });
    }
    saveCart(); updateCartCount(); showToast("เพิ่มลงตะกร้าแล้ว");
  });
}

updateCartCount();
load();
