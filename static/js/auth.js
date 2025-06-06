// auth.js

// ==============================
// 🔹 로그인 처리 (token 필드만 읽도록 확실하게 처리)
// ==============================
document.getElementById('login-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  // FormData → URLSearchParams 변환
  const formParams = new URLSearchParams(new FormData(this));

  try {
    console.log("🚀 [auth.js] 로그인 요청 시작");

    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formParams
    });

    console.log(`📡 [auth.js] /auth/login 응답 상태: ${res.status}`);

    // JSON 파싱
    let data;
    try {
      data = await res.json();
      console.log("📦 [auth.js] JSON 응답:", data);
    } catch (parseErr) {
      console.error("❌ [auth.js] 응답 파싱 실패:", parseErr);
      alert("로그인 응답을 파싱하지 못했습니다.");
      return;
    }

    // 백엔드에서 "token" 키로만 내려온다면 이 부분이 true가 됩니다.
    const accessToken = data.token;
    console.log("🔑 [auth.js] 파싱된 토큰:", accessToken);

    if (res.ok && accessToken) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("username", formParams.get("username"));
      console.log("✅ [auth.js] localStorage에 토큰 저장:", accessToken);

      alert("로그인 성공!");
      closeModal("modal-login");
      showGreeting();
    } else {
      // 상태코드 200이더라도 "token" 필드가 없으면 실패로 처리
      const errMsg = data.detail || data.error || JSON.stringify(data);
      console.warn(`⚠️ [auth.js] 로그인 실패: ${errMsg}`);
      alert("로그인 실패: " + errMsg);
    }

  } catch (err) {
    console.error("🚨 [auth.js] 네트워크 오류:", err);
    alert("서버와 연결할 수 없습니다.");
  }
});

// ==============================
// 🔹 현재 사용자 정보 표시
// ==============================
async function showGreeting() {
  try {
    const user = await apiGet("/auth/me");
    console.log("👤 [auth.js] /auth/me 응답 user:", user);

    const greetingEl = document.getElementById("greeting");
    if (greetingEl) {
      greetingEl.textContent = `${user.nickname || user.username}님 환영합니다!`;

      document.getElementById('open-signup').style.display   = "none";
      document.getElementById('open-login').style.display    = "none";
      document.getElementById('logout').style.display        = "inline-block";
      document.getElementById('open-bookmark').style.display = "inline-block";
      document.getElementById('open-mypage').style.display   = "inline-block";
    }
  } catch (err) {
    console.warn("👀 [auth.js] /auth/me 인증 실패:", err.message);
  }
}

// ==============================
// ✅ 페이지 로딩 시 자동 인사 표시
// ==============================
if (localStorage.getItem("token")) {
  showGreeting();
}

// ==============================
// 🔹 로그아웃 버튼 처리
// ==============================
document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.reload();
});
