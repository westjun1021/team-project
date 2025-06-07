# schemas/bookmark.py
from pydantic import BaseModel
from typing import Optional

class BookmarkCreate(BaseModel):
    paper_id: str
    title: str
    authors: str | None = None
    published_year: str | None = None
    paper_link: str

class BookmarkOut(BookmarkCreate):
    id: int

    class Config:
        from_attributes = True
    
    paper_link: Optional[str] = None
