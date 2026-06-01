"""
每日灵签 API
提供观音灵签抽签、查询、历史记录功能
"""

import hashlib
import json
import os
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from models import get_db, StickHistory

settings = get_settings()

router = APIRouter(tags=["每日灵签"])


# ============ Pydantic 模型 ============

class DrawStickRequest(BaseModel):
    user_id: str
    wish: Optional[str] = None  # 许愿内容（可选）


class DrawStickResponse(BaseModel):
    stick_number: int
    level: str
    palace: str
    poem: str
    interpretation: str
    meaning: str
    story: str
    drawn_at: str
    can_redraw: bool
    message: str


class StickHistoryItem(BaseModel):
    stick_number: int
    level: str
    poem: str
    drawn_at: str


# ============ 工具函数 ============

def get_stick_data_path() -> str:
    """获取灵签数据文件路径"""
    return os.path.join(os.path.dirname(__file__), "..", "data", "fortune_sticks.json")


def load_sticks() -> list:
    """加载灵签数据"""
    path = get_stick_data_path()
    if not os.path.exists(path):
        raise HTTPException(status_code=500, detail="灵签数据文件不存在")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_daily_seed(user_id: str) -> int:
    """
    基于用户ID和日期生成确定性随机种子
    保证同一用户同一天抽到同一支签
    """
    today = date.today().isoformat()
    seed_str = f"{user_id}_{today}"
    hash_val = int(hashlib.md5(seed_str.encode("utf-8")).hexdigest(), 16)
    return (hash_val % 100) + 1  # 1-100


def get_level_color(level: str) -> str:
    """获取签等对应的颜色"""
    colors = {
        "上上": "#FF6B35",  # 橙红 - 大吉
        "中平": "#4ECDC4",  # 青绿 - 中平
        "下下": "#95A5A6",  # 灰色 - 凶
    }
    return colors.get(level, "#95A5A6")


# ============ API 路由 ============

@router.post("/draw", response_model=DrawStickResponse)
async def draw_stick(
    request: DrawStickRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    抽取每日灵签
    - 同一用户每天只能抽一次
    - 基于用户ID和日期生成确定性签号
    """
    today = date.today()

    # 检查今日是否已抽过
    result = await db.execute(
        select(StickHistory).where(
            StickHistory.user_id == request.user_id,
            StickHistory.drawn_at >= datetime(today.year, today.month, today.day)
        )
    )
    existing = result.scalar_one_or_none()

    # 生成签号
    stick_number = generate_daily_seed(request.user_id)

    # 加载签文
    sticks = load_sticks()
    stick = next((s for s in sticks if s["number"] == stick_number), None)
    if not stick:
        raise HTTPException(status_code=500, detail="签文数据异常")

    # 如果是新抽签，记录历史
    if not existing:
        history = StickHistory(
            user_id=request.user_id,
            stick_number=stick_number,
            drawn_at=datetime.utcnow()
        )
        db.add(history)
        await db.commit()
        message = "今日灵签已抽出，诚心祈愿，自有感应"
        can_redraw = False
    else:
        message = "今日已抽过灵签，每日一签，心诚则灵"
        can_redraw = False

    return DrawStickResponse(
        stick_number=stick["number"],
        level=stick["level"],
        palace=stick["palace"],
        poem=stick["poem"],
        interpretation=stick["interpretation"],
        meaning=stick["meaning"],
        story=stick["story"],
        drawn_at=datetime.utcnow().isoformat(),
        can_redraw=can_redraw,
        message=message
    )


@router.get("/today/{user_id}")
async def get_today_stick(user_id: str, db: AsyncSession = Depends(get_db)):
    """查询用户今日已抽的灵签"""
    today = date.today()

    result = await db.execute(
        select(StickHistory).where(
            StickHistory.user_id == user_id,
            StickHistory.drawn_at >= datetime(today.year, today.month, today.day)
        )
    )
    history = result.scalar_one_or_none()

    if not history:
        return {"has_drawn": False, "message": "今日尚未抽签"}

    # 加载签文
    sticks = load_sticks()
    stick = next((s for s in sticks if s["number"] == history.stick_number), None)

    return {
        "has_drawn": True,
        "stick": stick,
        "drawn_at": history.drawn_at.isoformat()
    }


@router.get("/history/{user_id}")
async def get_stick_history(
    user_id: str,
    limit: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """获取用户抽签历史"""
    result = await db.execute(
        select(StickHistory)
        .where(StickHistory.user_id == user_id)
        .order_by(StickHistory.drawn_at.desc())
        .limit(limit)
    )
    histories = result.scalars().all()

    sticks = load_sticks()
    stick_map = {s["number"]: s for s in sticks}

    items = []
    for h in histories:
        stick = stick_map.get(h.stick_number, {})
        items.append({
            "stick_number": h.stick_number,
            "level": stick.get("level", ""),
            "poem": stick.get("poem", ""),
            "drawn_at": h.drawn_at.isoformat()
        })

    return {"items": items, "total": len(items)}


@router.get("/all")
async def get_all_sticks():
    """获取所有灵签（用于浏览）"""
    sticks = load_sticks()
    return {"total": len(sticks), "sticks": sticks}


@router.get("/{number}")
async def get_stick_by_number(number: int):
    """按签号查询灵签详情"""
    if number < 1 or number > 100:
        raise HTTPException(status_code=400, detail="签号必须在1-100之间")

    sticks = load_sticks()
    stick = next((s for s in sticks if s["number"] == number), None)

    if not stick:
        raise HTTPException(status_code=404, detail="签文不存在")

    return stick
