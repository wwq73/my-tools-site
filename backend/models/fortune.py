"""灵签模型"""
from sqlalchemy import Column, DateTime, Integer, String
from datetime import datetime
from .base import Base


class FortuneStick(Base):
    """灵签数据表"""
    __tablename__ = "fortune_sticks"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, unique=True, nullable=False)
    level = Column(String(20), nullable=False)
    palace = Column(String(20), nullable=False)
    poem = Column(String(500), nullable=False)
    interpretation = Column(String(500), nullable=False)
    meaning = Column(String(300), nullable=False)
    story = Column(String(100), nullable=False)


class StickHistory(Base):
    """抽签历史记录"""
    __tablename__ = "stick_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    stick_number = Column(Integer, nullable=False)
    drawn_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(50), nullable=True)
