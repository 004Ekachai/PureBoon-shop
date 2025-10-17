import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const cartCount = document.getElementById("cartCount");
const toastEl = document.getElementById("toast");

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const saveCart = () => localStorage.setItem("cart", JSON.stringify(cart));
const updateCartCount = () => cartCount.textContent = cart.reduce((s,i)=>s+(Number(i.quantity)||0),0);
const showToast = (m)=>{ toastEl.textContent=m; toastEl.style.display='block'; setTimeout(()=>toastEl.style.display='none',1200); };
const safeQty = q => { const n = parseInt(q); return isNaN(n)||n<1?1:n; };

async function loadProducts(){
  const snap = await getDocs(collection(db, "products"));
  const cats = new Set();
  products = snap.docs.map(d => {
    const data = d.data();
    if (data?.category) cats.add(data.category);
    return { id: d.id, ...data };
  });
  [...cats].sort().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat; opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  render(products);
}

function render(list){
  productList.innerHTML = "";
  if(!list.length){ productList.innerHTML = `<p class="text-center empty">ไม่พบสินค้า</p>`; return; }

  list.forEach(p => {
    const sizes = Object.keys(p.sizePrice || {});
    const defaultSize = sizes[0] || "";
    const defaultPrice = (p.sizePrice||{})[defaultSize] || 0;

    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.image||''}" class="card-img-top" alt="${p.name||''}">
        <div class="card-body d-flex flex-column">
          <h6 class="mb-1">${p.name||''}</h6>
          <small class="text-muted mb-2">${p.category||''}</small>
          <div class="d-flex align-items-center gap-2 mb-2">
            <select class="form-select form-select-sm sizeSel" style="width:110px">
              ${sizes.map(s=>`<option value="${s}">${s}</option>`).join("")}
            </select>
            <span class="text-success fw-bold price">฿${defaultPrice}</span>
          </div>
          <div class="d-flex gap-2">
            <input type="number" class="form-control form-control-sm qty" value="1" min="1" style="width:90px">
            <button class="btn btn-green btn-sm add flex-fill"><i class="fa-solid fa-cart-plus"></i> เพิ่ม</button>
            <a href="product.html?id=${p.id}" class="btn btn-outline-success btn-sm flex-fill">ดูรายละเอียด</a>
          </div>
        </div>
      </div>`;

    const sizeSel = col.querySelector(".sizeSel");
    const priceEl = col.querySelector(".price");
    sizeSel.addEventListener("change", ()=>{ priceEl.textContent = "฿"+((p.sizePrice||{})[sizeSel.value]||0); });

    col.querySelector(".add").addEventListener("click", ()=>{
      const selectedSize = sizeSel.value || defaultSize;
      const price = Number((p.sizePrice||{})[selectedSize]) || 0;
      const quantity = safeQty(col.querySelector(".qty").value);
      const existing = cart.find(i => i.id===p.id && (i.selectedSize||i.size)===selectedSize);
      if(existing){ existing.quantity += quantity; existing.price = price; }
      else{
        cart.push({
          id: p.id,
          name: p.name,
          size: selectedSize,
          selectedSize,
          price,
          quantity,
          image: p.image || "",
          category: p.category || "",
          sizePrice: p.sizePrice || {}
        });
      }
      saveCart(); updateCartCount(); showToast("เพิ่มลงตะกร้าแล้ว");
    });

    productList.appendChild(col);
  });
}

function applyFilter(){
  const kw = (searchInput.value||"").toLowerCase().trim();
  const cat = categoryFilter.value;
  const filtered = products.filter(p => {
    const text = (p.name||"").toLowerCase() + " " + (p.description||"").toLowerCase();
    const matchText = text.includes(kw);
    const matchCat = (cat === "all") || (p.category === cat);
    return matchText && matchCat;
  });
  render(filtered);
}

searchInput.addEventListener("input", applyFilter);
categoryFilter.addEventListener("change", applyFilter);
updateCartCount();
loadProducts();
