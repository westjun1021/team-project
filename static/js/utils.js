// utils.js

const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://127.0.0.1:8000"
  : "https://recosearch.co.kr";

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
