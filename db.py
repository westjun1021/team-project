# db.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# .env에서 DATABASE_URL 불러오기
DATABASE_URL = os.getenv("DATABASE_URL")

# Base 클래스 생성
Base = declarative_base()

# 모든 모델 import (순서는 상관없지만 반드시 필요함)
import models.user
import models.bookmark
# 추가 모델이 있다면 여기도 import

# PostgreSQL용 엔진 생성
engine = create_engine(DATABASE_URL)

# 세션 로컬 객체
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 의존성 주입용 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
