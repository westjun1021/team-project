from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routers.recommend import router as recommend_router
from routers.health import router as health_router

app = FastAPI()

# 라우터 등록: health 및 recommend 기능 연결
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(recommend_router, prefix="/recommend", tags=["recommend"])

# 정적 파일 제공 설정 (/static 경로로 static 폴더 내 파일 서빙)
app.mount("/static", StaticFiles(directory="static"), name="static")

# SPA 진입점: 루트 경로에서 index.html 반환
@app.get("/", include_in_schema=False)
async def serve_index():
    return FileResponse("static/index.html")

# 이 모듈을 직접 실행할 때 Uvicorn으로 서버 시작
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )