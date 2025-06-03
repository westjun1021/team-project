# schemas/bookmark.py
from pydantic import BaseModel

class BookmarkCreate(BaseModel):
    paper_id: str
    title: str
    authors: str | None = None
    published_year: str | None = None

class BookmarkOut(BookmarkCreate):
    id: int

    class Config:
        from_attributes = True
