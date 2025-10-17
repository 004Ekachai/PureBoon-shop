const cartBody = document.getElementById("cartBody");
const grandEl = document.getElementById("grand");
const cartCount = document.getElementById("cartCount");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const save = ()=> localStorage.setItem("cart", JSON.stringify(cart));
const updateCartCount = ()=> cartCount.textContent = cart.reduce((s,i)=>s+(Number(i.quantity)||0),0);

function render(){
  cartBody.innerHTML = "";
  let grand = 0;
  if(cart.length===0){
    cartBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">ไม่มีสินค้าในตะกร้า</td></tr>`;
    grandEl.textContent = "฿0"; updateCartCount(); return;
  }
  cart.forEach((it,idx)=>{
    const sizes = Object.keys(it.sizePrice || {});
    const price = Number((it.sizePrice||{})[it.selectedSize] || it.price || 0);
    it.price = price;
    const qty = Number(it.quantity)||0;
    const sub = price * qty; grand += sub;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${it.image||'https://via.placeholder.com/70'}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
          <div>
            <div class="fw-semibold">${it.name||''}</div>
            <small class="text-muted">${it.category||''}</small>
          </div>
        </div>
      </td>
      <td>
        <select class="form-select form-select-sm sizeSel" data-idx="${idx}">
          ${sizes.map(s=>`<option value="${s}" ${s===it.selectedSize?'selected':''}>${s}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="number" class="form-control form-control-sm qty" data-idx="${idx}" value="${qty}" min="1">
      </td>
      <td class="text-end">฿${sub}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger del" data-idx="${idx}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    cartBody.appendChild(tr);
  });
  grandEl.textContent = "฿"+grand;
  bind();
  save(); updateCartCount();
}

function bind(){
  document.querySelectorAll(".del").forEach(b=>b.addEventListener("click",e=>{
    const idx = Number(e.currentTarget.dataset.idx); cart.splice(idx,1); render();
  }));
  document.querySelectorAll(".qty").forEach(inp=>inp.addEventListener("change",e=>{
    const idx = Number(e.currentTarget.dataset.idx);
    const val = Math.max(1, parseInt(e.currentTarget.value)||1);
    cart[idx].quantity = val; render();
  }));
  document.querySelectorAll(".sizeSel").forEach(sel=>sel.addEventListener("change",e=>{
    const idx = Number(e.currentTarget.dataset.idx);
    const sz = e.currentTarget.value;
    cart[idx].selectedSize = sz;
    const sp = cart[idx].sizePrice || {};
    cart[idx].price = Number(sp[sz])||0;
    render();
  }));
}

render();
