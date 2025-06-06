// mypage.js

// ==============================
// 🔹 닉네임 변경
// ==============================
document.getElementById('nickname-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = new FormData(this);
  const data = { nickname: form.get('nickname') };

  try {
    const res = await fetch(API_BASE + "/mypage/nickname", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("✅ 닉네임이 변경되었습니다.");
      showGreeting();
      closeModal("modal-mypage");
    } else {
      const err = await res.json().catch(() => ({}));
      alert("닉네임 변경 실패: " + (err.detail || "오류"));
    }
  } catch (err) {
    console.error("닉네임 변경 오류:", err);
    alert("서버 요청 중 오류 발생");
  }
});

// ==============================
// 🔹 비밀번호 변경
// ==============================
document.getElementById('mypage-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = new FormData(this);
  const data = {
    current_password: form.get('current_password'),
    new_password: form.get('new_password')
  };

  try {
    const res = await fetch(API_BASE + "/mypage/password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("✅ 비밀번호가 변경되었습니다.");
      closeModal("modal-mypage");
    } else {
      const err = await res.json().catch(() => ({}));
      let msg = err.detail || "오류 발생";
      if (msg.includes("같")) {
        msg = "❌ 새 비밀번호가 현재 비밀번호와 같습니다.";
      } else if (msg.includes("일치")) {
        msg = "❌ 현재 비밀번호가 틀립니다.";
      }
      alert("비밀번호 변경 실패: " + msg);
    }
  } catch (err) {
    console.error("비밀번호 변경 오류:", err);
    alert("서버 요청 중 오류 발생");
  }
});
