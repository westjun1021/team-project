// search.js

// ==============================
// 🔹 북마크 세트 로딩 (paper_id -> bookmark id 매핑)
// ==============================
async function loadBookmarksSet() {
  try {
    const data = await apiGet('/bookmarks/');
    // { paper_id: bookmark_id, ... }
    return Object.fromEntries(data.map(bm => [bm.paper_id, bm.id]));
  } catch {
    return {};
  }
}

// ==============================
// 🔹 검색 처리
// ==============================
document.getElementById('recommend-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = new FormData(this);

  const year = form.get('pyear');
  const month = form.get('pmonth');
  const sortBy = form.get('sort_by');
  const order = form.get('order');
  const query = form.get('query');
  const category = form.get('category');

  let url = `/recommend?sort_by=${sortBy}&order=${order}`;
  if (year && month) url += `&pyear=${year}&pmonth=${month}`;
  if (query) url += `&query=${encodeURIComponent(query)}`;
  if (category) url += `&category=${category}`;

  try {
    const response = await fetch(API_BASE + url);
    const data = await response.json();
    renderResults(data.recommendations || []);
  } catch (err) {
    console.error('추천 오류:', err);
    alert('추천을 불러오는 중 오류가 발생했습니다.');
  }
});

// ==============================
// 🔹 추천 결과 렌더링 및 북마크 토글 버튼 생성
// ==============================
async function renderResults(items) {
  const container = document.getElementById('result');
  container.innerHTML = '';

  if (!items.length) {
    container.textContent = '추천된 논문이 없습니다.';
    return;
  }

  // 현재 북마크된 목록을 가져옴
  const bmMap = await loadBookmarksSet();

  items.forEach(doc => {
    const pid = doc.paper_id;
    // authors 배열 처리
    const authors = Array.isArray(doc.authors)
      ? doc.authors.map(a => a.name).join(', ')
      : doc.authors || 'N/A';
    // 출처 처리
    const source = doc.publication && doc.publication.name
      ? doc.publication.name
      : '출처 정보 없음';
    // 상세 URL 생성 (DBpia)
    const apiLink = doc.link_api || '';
    const m = apiLink.match(/id=(NODE\d+)/);
    const nodeId = m ? m[1] : `NODE${pid}`;
    const detailUrl = `https://www.dbpia.co.kr/journal/articleDetail?nodeId=${nodeId}`;

    // 북마크 여부 확인
    const isBookmarked = bmMap[pid] !== undefined;
    const bookmarkId = isBookmarked ? bmMap[pid] : '';

    // 버튼 텍스트와 클래스 설정
    const btnText = isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가';
    const btnClass = isBookmarked ? 'bookmark-btn bookmarked' : 'bookmark-btn';

    // 카드 생성
    const card = document.createElement('div');
    card.className = 'paper';
    card.innerHTML = `
      <strong>${doc.title}</strong>
      <em>저자: ${authors}</em>
      <em>출처: ${source}</em>
      <a href="${detailUrl}" target="_blank">원문 보기</a>
      <button
        class="${btnClass}"
        data-paper-id="${pid}"
        data-paper-title="${doc.title.replace(/'/g, "\'")}"
        data-paper-authors="${authors}"
        data-paper-year="${doc.publication?.year || ''}"
        data-paper-link="${detailUrl}"
        data-bookmark-id="${bookmarkId}">
        ${btnText}
      </button>
    `;
    container.appendChild(card);
  });
}

// ==============================
// 🔹 검색 결과 영역에서 북마크 버튼 클릭 시 토글
// ==============================
document.getElementById('result')?.addEventListener('click', async function (e) {
  if (!e.target.classList.contains('bookmark-btn')) return;

  const btn = e.target;
  const pid = btn.dataset.paperId;
  const title = btn.dataset.paperTitle;
  const authors = btn.dataset.paperAuthors;
  const year = btn.dataset.paperYear;
  const link = btn.dataset.paperLink;
  const bookmarkId = btn.dataset.bookmarkId;
  const token = localStorage.getItem("token");
  if (!token) {
    return alert("로그인이 필요합니다.");
  }

  try {
    if (btn.classList.contains('bookmarked')) {
      // 이미 북마크 되었으면 삭제
      await fetch(API_BASE + `/bookmarks/${bookmarkId}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      btn.classList.remove('bookmarked');
      btn.textContent = '즐겨찾기 추가';
      btn.dataset.bookmarkId = '';
    } else {
      // 북마크 추가
      const res = await fetch(API_BASE + "/bookmarks/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          paper_id: pid,
          title: title,
          authors: authors,
          published_year: year,
          paper_link: link
        })
      });
      if (res.ok) {
        const data = await res.json();
        btn.classList.add('bookmarked');
        btn.textContent = '즐겨찾기 해제';
        btn.dataset.bookmarkId = data.id;
      } else {
        const err = await res.json().catch(() => ({}));
        alert("즐겨찾기 추가 실패: " + (err.detail || "오류"));
      }
    }
  } catch (err) {
    console.error("북마크 토글 오류:", err);
    alert("요청 중 오류 발생");
  }
});
