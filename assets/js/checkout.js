import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById("cartCount");
const summary = document.getElementById("summary");
const grandEl = document.getElementById("grand");
const bankBox = document.getElementById("bankBox");
const cardBox = document.getElementById("cardBox");
const toastEl = document.getElementById("toast");

cartCount.textContent = cart.reduce((s,i)=>s+(Number(i.quantity)||0),0);

function renderSummary(){
  summary.innerHTML = "";
  let total = 0;
  cart.forEach(it=>{
    const qty = Number(it.quantity)||0;
    const price = Number(it.price)||0;
    const sub = qty*price;
    total += sub;
    const row = document.createElement("div");
    row.className = "d-flex justify-content-between border-bottom py-2";
    row.innerHTML = `<span>${it.name} (${it.selectedSize||it.size||"-"}) × ${qty}</span><span>฿${sub}</span>`;
    summary.appendChild(row);
  });
  grandEl.textContent = total;
}
renderSummary();

document.querySelectorAll("input[name='payMethod']").forEach(r=>r.addEventListener("change",()=>{
  bankBox.classList.toggle("d-none", !document.getElementById("payBank").checked);
  cardBox.classList.toggle("d-none", !document.getElementById("payCard").checked);
}));

function showToast(m){ toastEl.textContent=m; toastEl.style.display='block'; setTimeout(()=>toastEl.style.display='none',1200); }

document.getElementById("checkoutForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  if(cart.length===0){ alert("ตะกร้าว่าง"); return; }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const method = document.querySelector("input[name='payMethod']:checked").value;
  const payment = { method };
  if(method==="Bank") payment.bank = document.getElementById("bank").value;
  if(method==="Card") payment.cardNumber = document.getElementById("cardNumber").value;

  try{
    await addDoc(collection(db, "orders"), {
      customer: { name, phone, address },
      cart: cart,
      totalAmount: Number(grandEl.textContent)||0,
      payment,
      createdAt: serverTimestamp()
    });
    localStorage.removeItem("cart");
    showToast("สั่งซื้อสำเร็จ");
    setTimeout(()=>location.href="shop.html",1200);
  }catch(err){
    alert("เกิดข้อผิดพลาด: "+err.message);
  }
});
