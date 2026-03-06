import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const knowledgeGrid = document.getElementById("knowledgeGrid");
const footerEl = document.getElementById("footer");

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2br(text = "") {
  return escapeHTML(text).replace(/\n/g, "<br>");
}

function getSafeImage(url = "") {
  const trimmed = String(url).trim();
  if (!trimmed) {
    return "https://placehold.co/800x600?text=PureBoon+Knowledge";
  }
  return trimmed;
}

function renderKnowledge(items) {
  if (!knowledgeGrid) return;

  if (!items.length) {
    knowledgeGrid.innerHTML = `
      <div class="knowledge-status">
        ยังไม่มีข้อมูลบทความในขณะนี้
      </div>
    `;
    return;
  }

  knowledgeGrid.innerHTML = items
    .map((item, index) => {
      const title = escapeHTML(item.title || `บทความที่ ${index + 1}`);
      const description = nl2br(item.description || "ยังไม่มีรายละเอียด");
      const image = getSafeImage(item.image);
      const itemId = escapeHTML(item.id || `knowledge-${index + 1}`);

      return `
        <article class="knowledge-article-card" data-id="${itemId}">
          <div class="knowledge-article-media">
            <img
              src="${image}"
              alt="${title}"
              loading="lazy"
              onerror="this.onerror=null;this.src='https://placehold.co/800x600?text=Image+Not+Found';"
            />
          </div>

          <div class="knowledge-article-body">
            <span class="knowledge-article-tag">บทความสาระน่ารู้</span>
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function normalizeKnowledgeItems(docsData) {
  let allItems = [];

  docsData.forEach((data) => {
    if (Array.isArray(data.item)) {
      allItems = allItems.concat(data.item);
    }
  });

  return allItems.filter((item) => item && typeof item === "object");
}

async function loadKnowledgePage() {
  if (!knowledgeGrid) return;

  try {
    const snapshot = await getDocs(collection(db, "knowledge"));
    const docsData = [];

    snapshot.forEach((docSnap) => {
      docsData.push(docSnap.data());
    });

    const allItems = normalizeKnowledgeItems(docsData);
    renderKnowledge(allItems);
  } catch (error) {
    console.error("โหลดข้อมูลหน้า know.html ไม่สำเร็จ:", error);
    knowledgeGrid.innerHTML = `
      <div class="knowledge-status error">
        ไม่สามารถโหลดข้อมูลสาระน่ารู้ได้ในขณะนี้
      </div>
    `;
  }
}

async function loadFooterFromFirebase() {
  if (!footerEl) return;

  try {
    const footerRef = doc(db, "homepage", "footer");
    const footerSnap = await getDoc(footerRef);

    if (!footerSnap.exists()) return;

    const footerData = footerSnap.data();
    const shopName = footerData?.brandName || "ร้านเพียวบุญ";
    const phone = footerData?.contact?.phone || "";
    const email = footerData?.contact?.email || "";
    const facebook = footerData?.social?.facebook || "";
    const instagram = footerData?.social?.instagram || "";
    const line = footerData?.social?.line || "";

    footerEl.innerHTML = `
      <div class="footer-inner">
        <h3>${escapeHTML(shopName)}</h3>
        <p>คลังความรู้สำหรับการทำบุญอย่างมีความหมาย</p>

        ${
          phone || email
            ? `
              <div class="footer-contact">
                ${phone ? `<span>${escapeHTML(phone)}</span>` : ""}
                ${email ? `<span>${escapeHTML(email)}</span>` : ""}
              </div>
            `
            : ""
        }

        ${
          facebook || instagram || line
            ? `
              <div class="footer-social">
                ${facebook ? `<a href="${facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>` : ""}
                ${instagram ? `<a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>` : ""}
                ${line ? `<a href="${line}" target="_blank" rel="noopener noreferrer">Line</a>` : ""}
              </div>
            `
            : ""
        }
      </div>
    `;
  } catch (error) {
    console.error("โหลด footer ไม่สำเร็จ:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadKnowledgePage();
  await loadFooterFromFirebase();
});
