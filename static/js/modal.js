// modal.js

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
    loadBookmarks();
    openModal('modal-bookmark');
  } else {
    alert("로그인이 필요합니다.");
  }
});
document.getElementById('open-mypage')?.addEventListener('click', () => openModal('modal-mypage'));

// ==============================
// 🔹 마이페이지 탭 버튼 클릭 처리
// ==============================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mypage-tab').forEach(tab => tab.style.display = 'none');
    const targetTab = document.getElementById(btn.dataset.tab);
    if (targetTab) targetTab.style.display = 'block';
  });
});
