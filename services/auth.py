import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from db import get_db
from models.user import User as UserModel
from schemas.user import UserCreate, UserInDB, UserUpdate, UserPasswordChange, UserOut

# 환경 변수 로드
SECRET_KEY = os.getenv("SECRET_KEY", "my_super_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 토큰 스킴
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def register_user(db: Session, user_create: UserCreate) -> UserModel:
    hashed_password = get_password_hash(user_create.password)
    user = UserModel(
        username=user_create.username,
        hashed_password=hashed_password,
        nickname=user_create.nickname,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, username: str, password: str) -> Optional[UserInDB]:
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return UserInDB.from_orm(user)


def update_profile(db: Session, user: UserModel, data: UserUpdate) -> UserModel:
    if data.username:
        user.username = data.username
    if data.nickname is not None:
        user.nickname = data.nickname
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: UserModel, hard: bool = False):
    if hard:
        db.delete(user)
    else:
        user.is_active = False
    db.commit()


def change_password(db: Session, user: UserInDB, passwords: UserPasswordChange) -> UserOut:
    if not verify_password(passwords.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다.")
    if verify_password(passwords.new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="비밀번호가 같습니다.")
    hashed = get_password_hash(passwords.new_password)
    db_user = db.query(UserModel).filter(UserModel.id == user.id).first()
    db_user.hashed_password = hashed
    db.commit()
    db.refresh(db_user)
    return UserOut.from_orm(db_user)


# ✅ 추가: 현재 사용자 가져오기
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
