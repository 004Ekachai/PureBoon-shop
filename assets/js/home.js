import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadKnowledge() {
    const container = document.getElementById('knowledge-container');
    if (!container) return;

    try {
        // ดึงข้อมูลจาก Path: homepage -> knowledge
        const docRef = doc(db, "homepage", "knowledge");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const items = data.items; // ดึงฟิลด์ items ที่เป็น Array

            if (items && items.length > 0) {
                let htmlContent = '';

                items.forEach(item => {
                    htmlContent += `
                        <div class="col-md-12 mb-5">
                            <div class="row align-items-center shadow-sm p-3 bg-white rounded">
                                <div class="col-md-4">
                                    <img src="${item.image}" class="img-fluid rounded-3" alt="${item.title}" 
                                         style="width: 100%; height: 250px; object-fit: cover;">
                                </div>
                                <div class="col-md-8">
                                    <h3 class="h4 mb-3" style="color: #59ab6e;">${item.title}</h3>
                                    <p class="text-muted">${item.description}</p>
                                    <a href="article-detail.html?id=${item.id}" class="btn btn-success mt-2">
                                        อ่านเนื้อหาเพิ่มเติม
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = htmlContent;
            } else {
                container.innerHTML = '<p class="text-center">ไม่พบข้อมูลบทความ</p>';
            }
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error getting document:", error);
        container.innerHTML = '<p class="text-center">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

// เรียกใช้งานฟังก์ชันเมื่อโหลดหน้าจอ
window.onload = () => {
    loadKnowledge();
};
