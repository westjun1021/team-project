from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    paper_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    authors = Column(String, nullable=True)
    published_year = Column(String, nullable=True)

    # ✅ User 모델과의 관계 (중요)
    user = relationship("User", back_populates="bookmarks")
