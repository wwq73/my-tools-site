from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel as PydanticBaseModel
from typing import List, Optional
from datetime import datetime

from models import get_db, BaseModel
from sqlalchemy import Column, String, Boolean, Integer

router = APIRouter()


# ========== SQLAlchemy 数据库模型 ==========
class TodoItem(BaseModel):
    __tablename__ = "todo_items"

    text = Column(String(500), nullable=False)
    done = Column(Boolean, default=False)
    urgent = Column(Boolean, default=False)
    list_id = Column(String(50), default="default")


# ========== Pydantic 请求/响应模型（与数据库模型分开）==========
class TodoCreate(PydanticBaseModel):
    text: str
    urgent: bool = False
    list_id: str = "default"


class TodoUpdate(PydanticBaseModel):
    text: Optional[str] = None
    done: Optional[bool] = None
    urgent: Optional[bool] = None


class TodoResponse(PydanticBaseModel):
    id: int
    text: str
    done: bool
    urgent: bool
    list_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ========== API 端点 ==========
@router.get("/", response_model=List[TodoResponse])
async def get_todos(
    list_id: str = "default",
    db: AsyncSession = Depends(get_db)
):
    """获取待办列表"""
    result = await db.execute(
        select(TodoItem).where(TodoItem.list_id == list_id).order_by(TodoItem.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=TodoResponse)
async def create_todo(
    todo: TodoCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建待办"""
    db_todo = TodoItem(**todo.model_dump())
    db.add(db_todo)
    await db.flush()
    await db.refresh(db_todo)
    return db_todo


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo: TodoUpdate,
    db: AsyncSession = Depends(get_db)
):
    """更新待办"""
    result = await db.execute(select(TodoItem).where(TodoItem.id == todo_id))
    db_todo = result.scalar_one_or_none()

    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    for field, value in todo.model_dump(exclude_unset=True).items():
        setattr(db_todo, field, value)

    await db.flush()
    await db.refresh(db_todo)
    return db_todo


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    db: AsyncSession = Depends(get_db)
):
    """删除待办"""
    result = await db.execute(select(TodoItem).where(TodoItem.id == todo_id))
    db_todo = result.scalar_one_or_none()

    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    await db.delete(db_todo)
    return {"message": "Todo deleted"}
