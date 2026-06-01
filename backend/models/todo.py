from sqlalchemy import Column, String, Boolean
from .base import BaseModel

class TodoItem(BaseModel):
    """待办事项模型"""
    text = Column(String(500), nullable=False)
    done = Column(Boolean, default=False)
    urgent = Column(Boolean, default=False)
    list_id = Column(String(50), default="default")