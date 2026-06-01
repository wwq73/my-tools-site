"""
诗词搜索 API（精简版，无需字符索引）
适用于 Render 部署的 poems-only 数据库
"""
import json
import os
import math
import gzip
import logging
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
import zhconv

logger = logging.getLogger(__name__)

router = APIRouter(tags=["诗词求解器"])

# ── 数据库路径 ──
# 优先使用解压后的 .db，否则尝试解压 .db.gz
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'poetry.db')
DB_GZ_PATH = DB_PATH + '.gz'


def ensure_db():
    """确保数据库可用：如果 .db 不存在但 .db.gz 存在，则解压"""
    if not os.path.exists(DB_PATH) and os.path.exists(DB_GZ_PATH):
        logger.info(f'解压诗词数据库: {DB_GZ_PATH} → {DB_PATH}')
        with gzip.open(DB_GZ_PATH, 'rb') as f_in:
            with open(DB_PATH, 'wb') as f_out:
                f_out.write(f_in.read())
        logger.info('解压完成')


def to_traditional(text: str) -> str:
    """简化字 → 繁軆"""
    try:
        return zhconv.convert(text, 'zh-tw')
    except Exception:
        return text


class PoemResult(BaseModel):
    id: int
    title: str = ''
    author: str = ''
    rhythmic: str = ''
    source: str = ''
    dynasty: str = ''
    paragraphs: list[str] = []
    match_line: Optional[int] = None
    match_snippet: Optional[str] = None


class SearchResponse(BaseModel):
    poems: list[PoemResult] = []
    total: int = 0
    page: int = 1
    total_pages: int = 0
    query: str = ''
    mode: str = ''


def get_snippet(full_text: str, query: str, context: int = 12) -> str:
    idx = full_text.find(query)
    if idx == -1:
        return full_text[:60]
    start = max(0, idx - context)
    end = min(len(full_text), idx + len(query) + context)
    snippet = full_text[start:end]
    if start > 0:
        snippet = '…' + snippet
    if end < len(full_text):
        snippet = snippet + '…'
    return snippet


def parse_paragraphs(para_json: str) -> list[str]:
    try:
        return json.loads(para_json) if isinstance(para_json, str) else para_json
    except (json.JSONDecodeError, TypeError):
        return [para_json]


def row_to_poem(row: tuple, query: str = '') -> PoemResult:
    pid, title, author, rhythmic, source, dynasty, para_json, full_text = row
    paragraphs = parse_paragraphs(para_json)
    snippet = get_snippet(full_text, query) if query else None
    return PoemResult(
        id=pid, title=title or '', author=author or '', rhythmic=rhythmic or '',
        source=source or '', dynasty=dynasty or '', paragraphs=paragraphs,
        match_snippet=snippet,
    )


@router.get("/poetry/search", response_model=SearchResponse)
async def search_poetry(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    mode: str = Query("fuzzy", description="搜索模式: fuzzy | position | feihualing"),
    position: str = Query("any", description="位置约束: any | line_start | line_end | line_n"),
    line_num: Optional[int] = Query(None, ge=1, description="指定行号（position=line_n 时使用）"),
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
):
    if not q.strip():
        return SearchResponse(query=q, mode=mode)

    q = q.strip()
    q_trad = to_traditional(q)

    ensure_db()
    if not os.path.exists(DB_PATH):
        return SearchResponse(query=q, mode=mode, total=0)

    import aiosqlite
    db = await aiosqlite.connect(DB_PATH)

    try:
        if mode == 'feihualing':
            result = await search_feihualing(db, q_trad, page, limit)
        elif mode == 'position':
            result = await search_position(db, q_trad, position, line_num, page, limit)
        else:
            result = await search_fuzzy(db, q_trad, page, limit)
    finally:
        await db.close()

    return SearchResponse(
        poems=result['poems'], total=result['total'],
        page=page, total_pages=result['total_pages'],
        query=q, mode=mode,
    )


# ════════════════════════════════════════
#  搜索实现（所有模式基于 INSTR 全表扫描）
# ════════════════════════════════════════

SEARCH_FIELDS = 'id, title, author, rhythmic, source, dynasty, paragraphs, full_text'


async def search_fuzzy(db, query: str, page: int, limit: int) -> dict:
    """模糊匹配"""
    offset = (page - 1) * limit
    pattern = f'%{query}%'

    # 计数
    cursor = await db.execute('SELECT COUNT(*) FROM poems WHERE full_text LIKE ?', [pattern])
    row = await cursor.fetchone()
    total = row[0] if row else 0
    total_pages = max(1, math.ceil(total / limit))

    cursor = await db.execute(
        f'SELECT {SEARCH_FIELDS} FROM poems WHERE full_text LIKE ? LIMIT ? OFFSET ?',
        [pattern, limit, offset]
    )
    rows = await cursor.fetchall()
    poems = [row_to_poem(r, query) for r in rows]
    return {'poems': poems, 'total': total, 'total_pages': total_pages}


async def search_feihualing(db, char_query: str, page: int, limit: int) -> dict:
    """飞花令"""
    offset = (page - 1) * limit

    target_char = ''
    for ch in char_query:
        if '一' <= ch <= '鿿' or '㐀' <= ch <= '䶿':
            target_char = ch
            break
    if not target_char:
        return {'poems': [], 'total': 0, 'total_pages': 0}

    cursor = await db.execute('SELECT COUNT(*) FROM poems WHERE INSTR(full_text, ?) > 0', [target_char])
    row = await cursor.fetchone()
    total = row[0] if row else 0
    total_pages = max(1, math.ceil(total / limit))

    cursor = await db.execute(
        f'SELECT {SEARCH_FIELDS} FROM poems WHERE INSTR(full_text, ?) > 0 LIMIT ? OFFSET ?',
        [target_char, limit, offset]
    )
    rows = await cursor.fetchall()
    poems = [row_to_poem(r) for r in rows]
    return {'poems': poems, 'total': total, 'total_pages': total_pages}


async def search_position(
    db, query: str, position: str, line_num: Optional[int], page: int, limit: int
) -> dict:
    """位置约束搜索：先通过 INSTR 找到候选，再在 Python 中按行过滤"""
    offset = (page - 1) * limit
    total = 0
    total_pages = 0
    matched_poems: list[PoemResult] = []

    # 先扫全部候选（最多 scan 到够本页 + 计数）
    cursor = await db.execute(
        f'SELECT {SEARCH_FIELDS} FROM poems WHERE INSTR(full_text, ?) > 0',
        [query]
    )
    all_matches = await cursor.fetchall()

    for row in all_matches:
        pid, title, author, rhythmic, source, dynasty, para_json, full_text = row
        paragraphs = parse_paragraphs(para_json)

        match_line = None
        for li, line_text in enumerate(paragraphs):
            if position == 'line_start' and line_text.startswith(query):
                match_line = li + 1
                break
            elif position == 'line_end' and line_text.endswith(query):
                match_line = li + 1
                break
            elif position == 'line_n' and line_num and li + 1 == line_num and query in line_text:
                match_line = li + 1
                break
            elif position == 'any' and query in line_text:
                match_line = li + 1
                break

        if match_line is not None:
            total += 1
            if len(matched_poems) < offset + limit:
                if len(matched_poems) >= offset:
                    snippet = get_snippet(full_text, query)
                    matched_poems.append(PoemResult(
                        id=pid, title=title or '', author=author or '',
                        rhythmic=rhythmic or '', source=source or '',
                        dynasty=dynasty or '', paragraphs=paragraphs,
                        match_line=match_line, match_snippet=snippet,
                    ))

    total_pages = max(1, math.ceil(total / limit))

    return {
        'poems': matched_poems[offset:offset + limit],
        'total': total,
        'total_pages': total_pages,
    }
