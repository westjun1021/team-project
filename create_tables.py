# create_tables.py

from db import engine
from models import User, Bookmark
from db import Base  # Base는 declarative_base()

# 테이블 생성
print("📦 Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Done.")
