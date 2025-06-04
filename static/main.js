const API_BASE = 'https://recosearch.co.kr';

// ==============================
// 🔹 검색 처리
// ==============================
document.getElementById('recommend-form')?.addEventListener('submit', function (e) {
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

  fetch(API_BASE + url)
    .then(res => res.json())
    .then(data => renderResults(data.recommendations || []))
    .catch(err => {
      console.error('추천 오류:', err);
      alert('추천을 불러오는 중 오류가 발생했습니다.');
    });
});

// ==============================
// 🔹 추천 결과 렌더링
// ==============================
function renderResults(items) {
  const container = document.getElementById('result');
  container.innerHTML = '';
  if (!items.length) {
    container.textContent = '추천된 논문이 없습니다.';
    return;
  }

  items.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'paper';
    card.innerHTML = `
      <strong>${doc.title}</strong>
      <em>${doc.authors}</em>
      <a href="${doc.link}" target="_blank">원문 보기</a>
      <button onclick="addBookmark('${doc.id}', '${doc.title.replace(/'/g, "\\'")}')">즐겨찾기</button>
    `;
    container.appendChild(card);
  });
}

// ==============================
// 🔹 모달 열고 닫기
// ==============================
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

// 모달 닫기 버튼
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-close');
    if (target) closeModal(target);
  });
});

// ==============================
// 🔹 모달 열기 버튼 이벤트
// ==============================
document.getElementById('open-login')?.addEventListener('click', () => openModal('modal-login'));
document.getElementById('open-signup')?.addEventListener('click', () => openModal('modal-signup'));
document.getElementById('open-bookmark')?.addEventListener('click', () => {
  if (localStorage.getItem("token")) {
    loadBookmarks();                 // ✅ 로그인한 경우만 북마크 불러오기
    openModal('modal-bookmark');
  } else {
    alert("로그인이 필요합니다.");
  }
});
document.getElementById('open-mypage')?.addEventListener('click', () => openModal('modal-mypage'));

// ==============================
// 🔹 로그인 처리
// ==============================
document.getElementById('login-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = new FormData(this);

  try {
    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    console.log("✅ 로그인 응답:", data);

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", form.get("username"));
      alert("로그인 성공!");
      closeModal("modal-login");
      showGreeting();
    } else {
      alert("로그인 실패: " + (data.detail || "알 수 없는 오류"));
    }
  } catch (err) {
    console.error("로그인 오류:", err);
    alert("로그인 요청 중 오류 발생");
  }
});

// ==============================
// 🔹 현재 사용자 정보 표시
// ==============================
async function showGreeting() {
  try {
    const user = await apiGet("/auth/me");
    const greetingEl = document.getElementById("greeting");
    if (greetingEl) {
      greetingEl.textContent = `${user.nickname || user.username}님 환영합니다!`;
    }
  } catch (err) {
    console.warn("인증 실패:", err.message);
  }
}

// ==============================
// 🔹 인증 요청용 GET 함수
// ==============================
async function apiGet(url) {
  const token = localStorage.getItem("token");

  const headers = token
    ? { "Authorization": "Bearer " + token }
    : {};

  const res = await fetch(API_BASE + url, {
    method: "GET",
    headers: headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "API 요청 오류");
  }

  return res.json();
}

// ==============================
// 🔹 즐겨찾기 추가
// ==============================
async function addBookmark(paperId, title) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const res = await fetch(API_BASE + "/bookmarks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        paper_id: paperId,
        title: title
      })
    });

    if (res.ok) {
      alert("북마크에 추가되었습니다.");
    } else {
      const err = await res.json();
      alert("실패: " + (err.detail || "오류가 발생했습니다."));
    }
  } catch (err) {
    console.error("북마크 오류:", err);
    alert("요청 중 오류 발생");
  }
}

// ==============================
// 🔹 즐겨찾기 목록 불러오기
// ==============================
async function loadBookmarks() {
  try {
    const list = await apiGet("/bookmarks/");
    const ul = document.getElementById("bookmark-list");
    if (ul) {
      ul.innerHTML = list.map(bm => `<li>${bm.title}</li>`).join("");
    }
  } catch (err) {
    console.warn("북마크 불러오기 실패:", err.message);
    alert("북마크 목록을 불러올 수 없습니다.");
  }
}

// ==============================
// ✅ 페이지 로딩 시 자동 인사 표시
// ==============================
if (localStorage.getItem("token")) {
  showGreeting();
}
