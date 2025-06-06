// bookmarks.js

// ==============================
// 🔹 즐겨찾기 목록 불러오기
// ==============================
async function loadBookmarks() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const list = await apiGet("/bookmarks/");
    const ul = document.getElementById("bm-list");
    if (!ul) return;

    if (!list.length) {
      ul.innerHTML = '<li>즐겨찾기한 논문이 없습니다.</li>';
      return;
    }

    ul.innerHTML = list.map(bm => {
      // paper_link로 상세 URL 지정
      const href = bm.paper_link 
        ? bm.paper_link 
        : `https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE${bm.paper_id}`;

      return `
        <li>
          <strong>${bm.title}</strong><br>
          <small>ID: ${bm.id}</small><br>
          <a href="${href}" target="_blank" rel="noopener">상세 보기</a>
          <button class="bm-remove" data-bmid="${bm.id}">✖</button>
        </li>
      `;
    }).join("");
  } catch (err) {
    console.warn("📌 [bookmarks.js] 즐겨찾기 불러오기 실패:", err.message);
    alert("북마크 목록을 불러올 수 없습니다.");
  }
}

// ==============================
// 🔹 즐겨찾기 모달 내 해제
// ==============================
document.getElementById('bm-list')?.addEventListener('click', async function (e) {
  if (!e.target.classList.contains('bm-remove')) return;
  const bmid = e.target.dataset.bmid;
  try {
    await fetch(API_BASE + `/bookmarks/${bmid}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });
    e.target.closest('li').remove();
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.');
  }
});
