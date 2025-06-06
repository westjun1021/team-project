// signup.js

// ==============================
// 🔹 회원가입 처리
// ==============================
document.getElementById('signup-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = {
    username: formData.get('username'),
    nickname: formData.get('nickname'),
    password: formData.get('password')
  };

  try {
    const res = await fetch(API_BASE + "/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const signupMsgEl = document.getElementById('signup-msg');
    if (res.ok) {
      signupMsgEl.textContent = "가입 성공! 로그인 해주세요.";
      signupMsgEl.style.color = "green";
      // 가입 성공 후 1.5초 뒤 모달 자동 닫기
      setTimeout(() => closeModal('modal-signup'), 1500);
    } else {
      const err = await res.json().catch(() => ({}));
      signupMsgEl.textContent = err.detail || "가입 실패";
      signupMsgEl.style.color = "red";
    }
  } catch (err) {
    console.error("🚨 회원가입 요청 실패:", err);
    const signupMsgEl = document.getElementById('signup-msg');
    signupMsgEl.textContent = "서버와 연결할 수 없습니다.";
    signupMsgEl.style.color = "red";
  }
});
