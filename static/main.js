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
document.getElementById('open-bookmark')?.addEventListener('click', () => openModal('modal-bookmark'));
document.getElementById('open-mypage')?.addEventListener('click', () => openModal('modal-mypage'));

// ==============================
// 🔹 기타 (토큰 등 나중에 필요 시 활용 가능)
// ==============================
// const token = localStorage.getItem("token");
// if (token) {
//   document.getElementById("logout").style.display = "inline-block";
// }
