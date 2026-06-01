from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import datetime

from models.todo import TodoItem


class TodoService:
    """待办事项服务层"""

    @staticmethod
    async def get_todos(db: AsyncSession, list_id: str = "default") -> List[Dict[str, Any]]:
        """获取待办列表"""
        result = await db.execute(
            select(TodoItem).where(TodoItem.list_id == list_id).order_by(TodoItem.created_at.desc())
        )
        todos = result.scalars().all()

        # 手动构建响应列表
        result_list = []
        for todo in todos:
            result_list.append({
                "id": todo.id,
                "text": todo.text,
                "done": todo.done,
                "urgent": todo.urgent,
                "listId": todo.list_id,
                "createdAt": todo.created_at.isoformat()
            })
        return result_list

    @staticmethod
    async def create_todo(db: AsyncSession, todo_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建待办"""
        from models.todo import TodoItem

        db_todo = TodoItem(
            text=todo_data["text"],
            urgent=todo_data.get("urgent", False),
            list_id=todo_data.get("list_id", "default")
        )
        db.add(db_todo)
        await db.flush()
        await db.refresh(db_todo)

        # 手动构建响应
        return {
            "id": db_todo.id,
            "text": db_todo.text,
            "done": db_todo.done,
            "urgent": db_todo.urgent,
            "listId": db_todo.list_id,
            "createdAt": db_todo.created_at.isoformat()
        }

    @staticmethod
    async def update_todo(db: AsyncSession, todo_id: int, todo_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新待办"""
        result = await db.execute(select(TodoItem).where(TodoItem.id == todo_id))
        db_todo = result.scalar_one_or_none()

        if not db_todo:
            return None

        # 更新字段
        for field, value in todo_data.items():
            if hasattr(db_todo, field):
                setattr(db_todo, field, value)

        await db.flush()
        await db.refresh(db_todo)

        # 手动构建响应
        return {
            "id": db_todo.id,
            "text": db_todo.text,
            "done": db_todo.done,
            "urgent": db_todo.urgent,
            "listId": db_todo.list_id,
            "createdAt": db_todo.created_at.isoformat()
        }

    @staticmethod
    async def delete_todo(db: AsyncSession, todo_id: int) -> bool:
        """删除待办"""
        result = await db.execute(select(TodoItem).where(TodoItem.id == todo_id))
        db_todo = result.scalar_one_or_none()

        if db_todo:
            await db.delete(db_todo)
            return True
        return False