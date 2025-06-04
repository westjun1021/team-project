from dotenv import load_dotenv
import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

# .env 파일 로드
load_dotenv()

# CORS 설정
origins = [
    os.getenv("FRONTEND_URL", "*"),
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 import
from routers.health import router as health_router
from routers.recommend import router as recommend_router
from routers.paper import router as paper_router
from routers.auth import router as auth_router
from routers.mypage import router as mypage_router
from routers.bookmark import router as bookmark_router

# 라우터 등록
app.include_router(health_router, prefix="/health",   tags=["health"])
app.include_router(recommend_router, tags=["recommend"])
app.include_router(paper_router, prefix="/papers",    tags=["papers"])
app.include_router(auth_router, prefix="/auth",      tags=["auth"])
app.include_router(mypage_router)
app.include_router(bookmark_router, prefix="/bookmarks", tags=["bookmark"])
print("📌 북마크 라우터 등록됨 ✅")


# 정적 파일 제공
app.mount("/static", StaticFiles(directory="static"), name="static")

# SPA 진입점
@app.get("/", include_in_schema=False)
async def serve_index():
    return FileResponse("static/index.html")


# ✅ [임시] 테이블 자동 생성 (최초 1회만 작동하면 주석처리/삭제 가능)
from db import Base, engine
from models import user, paper  # 사용 중인 모델들 import

Base.metadata.create_all(bind=engine)


# uvicorn 직접 실행 지원
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
