# routers/bookmark.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from services.auth import get_current_user
from models.bookmark import Bookmark
from schemas.bookmark import BookmarkCreate, BookmarkOut

router = APIRouter()

@router.post("/", response_model=BookmarkOut)
def create_bookmark(bookmark: BookmarkCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    existing = db.query(Bookmark).filter_by(user_id=user.id, paper_id=bookmark.paper_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 즐겨찾기 되어있습니다.")
    new_bm = Bookmark(user_id=user.id, **bookmark.dict())
    db.add(new_bm)
    db.commit()
    db.refresh(new_bm)
    return new_bm

@router.get("/", response_model=list[BookmarkOut])
def get_my_bookmarks(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Bookmark).filter(Bookmark.user_id == user.id).all()
