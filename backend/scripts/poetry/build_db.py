#!/usr/bin/env python3
"""
诗词数据库构建脚本
从 chinese-poetry 数据集中提取所有诗词，构建 SQLite 全文检索数据库

用法:
  python build_db.py                    # 构建完整数据库
  python build_db.py --quick            # 构建小规模测试数据库
  python build_db.py --db-path ./poetry.db   # 指定输出路径
"""
import json
import os
import sys
import time
import argparse
import sqlite3

# 数据源路径（相对于本脚本）
DATA_SOURCE = os.path.join(os.path.dirname(__file__), '..', 'chinese-poetry')

# 来源映射（用于标注诗词来源）
SOURCE_MAP = {
    '全唐诗': '全唐诗',
    '宋词': '宋词',
    '诗经': '诗经',
    '楚辞': '楚辞',
    '论语': '论语',
    '元曲': '元曲',
    '五代诗词': '五代',
    '四书五经': '四书五经',
    '幽梦影': '幽梦影',
    '御定全唐詩': '全唐诗',
    '曹操诗集': '曹操诗集',
    '纳兰性德': '纳兰性德',
    '蒙学': '蒙学',
    '水墨唐诗': '唐诗',
    'strains': '选集',
}

# 朝代推断
DYNASTY_MAP = {
    '全唐诗': '唐',
    '御定全唐詩': '唐',
    '水墨唐诗': '唐',
    '宋词': '宋',
    '诗经': '先秦',
    '楚辞': '先秦',
    '论语': '先秦',
    '元曲': '元',
    '五代诗词': '五代',
    '四书五经': '先秦',
    '曹操诗集': '三国',
    '纳兰性德': '清',
    '蒙学': '宋',
}


def scan_json_files(root_dir):
    """扫描目录下所有 JSON 文件"""
    json_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            if f.endswith('.json') and f not in ('datas.json',):
                json_files.append(os.path.join(dirpath, f))
    return json_files


def extract_poems(filepath, source_label):
    """从 JSON 文件中提取诗词条目，统一格式"""
    poems = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f'  ⚠ 跳过 {os.path.basename(filepath)}: {e}')
        return poems

    if not isinstance(data, list):
        return poems

    for item in data:
        if not isinstance(item, dict):
            continue

        title = item.get('title', '') or ''
        author = item.get('author', '') or ''
        rhythmic = item.get('rhythmic', '') or ''

        # 提取正文（不同数据集有不同的字段名）
        paragraphs = item.get('paragraphs') or item.get('content') or item.get('para') or []
        if not isinstance(paragraphs, list) or len(paragraphs) == 0:
            continue

        # 过滤空行，去掉 None
        lines = [str(line).strip() for line in paragraphs if line]
        if not lines:
            continue

        # 如果标题为空，尝试从 rhythmic 或首行截取
        if not title and rhythmic:
            title = rhythmic
        if not title and lines:
            # 取首行前 10 个字作标题
            title = lines[0][:10]

        poem = {
            'title': title.strip(),
            'author': author.strip(),
            'rhythmic': rhythmic.strip(),
            'paragraphs': lines,
            'text': ''.join(lines),  # 全文拼接，方便搜索
            'source': source_label,
        }
        poems.append(poem)

    return poems


def build_database(db_path, quick_mode=False, lean_mode=False):
    """构建 SQLite 数据库"""
    if os.path.exists(db_path):
        print(f'数据库已存在: {db_path}')
        return

    print(f'开始构建诗词数据库: {db_path}')
    print(f'数据源: {DATA_SOURCE}')
    start_time = time.time()

    conn = sqlite3.connect(db_path)
    conn.execute('PRAGMA journal_mode=OFF')
    conn.execute('PRAGMA synchronous=OFF')
    conn.execute('PRAGMA cache_size=-80000')  # 80MB cache

    # 建表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS poems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL DEFAULT '',
            author TEXT NOT NULL DEFAULT '',
            rhythmic TEXT NOT NULL DEFAULT '',
            source TEXT NOT NULL DEFAULT '',
            dynasty TEXT NOT NULL DEFAULT '',
            paragraphs TEXT NOT NULL DEFAULT '',
            full_text TEXT NOT NULL DEFAULT '',
            char_count INTEGER NOT NULL DEFAULT 0
        )
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS poem_chars (
            char TEXT NOT NULL,
            poem_id INTEGER NOT NULL,
            PRIMARY KEY (char, poem_id),
            FOREIGN KEY (poem_id) REFERENCES poems(id)
        )
    ''')

    if not lean_mode:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS poem_chars (
                char TEXT NOT NULL,
                poem_id INTEGER NOT NULL,
                PRIMARY KEY (char, poem_id),
                FOREIGN KEY (poem_id) REFERENCES poems(id)
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS poem_lines (
                poem_id INTEGER NOT NULL,
                line_num INTEGER NOT NULL,
                line_text TEXT NOT NULL,
                FOREIGN KEY (poem_id) REFERENCES poems(id)
            )
        ''')

    # 扫描所有 JSON 文件
    all_files = scan_json_files(DATA_SOURCE)
    print(f'找到 {len(all_files)} 个 JSON 文件')

    # 按来源分组
    source_files = {}
    for fp in all_files:
        rel_path = os.path.relpath(fp, DATA_SOURCE)
        top_dir = rel_path.split(os.sep)[0]
        if top_dir not in SOURCE_MAP:
            continue
        label = SOURCE_MAP[top_dir]
        source_files.setdefault(label, []).append(fp)

    print(f'来源分类: {list(source_files.keys())}')

    total_poems = 0
    chars_inserted = 0

    for source_label, files in source_files.items():
        dynasty = DYNASTY_MAP.get(source_label, '未知')
        print(f'\n[{source_label}] ({dynasty}) — {len(files)} 个文件')

        for i, fp in enumerate(files):
            poems = extract_poems(fp, source_label)
            if not poems:
                continue

            # 批量插入诗词
            batch_data = []
            for p in poems:
                batch_data.append((
                    p['title'],
                    p['author'],
                    p.get('rhythmic', ''),
                    source_label,
                    dynasty,
                    json.dumps(p['paragraphs'], ensure_ascii=False),
                    p['text'],
                    len(p['text']),
                ))

            conn.executemany(
                'INSERT INTO poems (title, author, rhythmic, source, dynasty, paragraphs, full_text, char_count) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                batch_data
            )

            # 获取刚插入的 ID 范围
            start_id = total_poems + 1
            total_poems += len(batch_data)

            if not lean_mode:
                # 构建字符索引
                char_batch = []
                line_batch = []

                for idx, p in enumerate(poems):
                    poem_id = start_id + idx

                    # 行索引
                    for line_idx, line in enumerate(p['paragraphs']):
                        line_batch.append((poem_id, line_idx + 1, line))

                    # 字符索引
                    seen_chars = set()
                    for ch in p['text']:
                        if ch.strip() and ch not in seen_chars:
                            if '一' <= ch <= '鿿' or '㐀' <= ch <= '䶿':
                                char_batch.append((ch, poem_id))
                                seen_chars.add(ch)

                if char_batch:
                    conn.executemany(
                        'INSERT OR IGNORE INTO poem_chars (char, poem_id) VALUES (?, ?)',
                        char_batch
                    )
                    chars_inserted += len(char_batch)

                if line_batch:
                    conn.executemany(
                        'INSERT INTO poem_lines (poem_id, line_num, line_text) VALUES (?, ?, ?)',
                        line_batch
                    )

            if (i + 1) % 10 == 0:
                conn.commit()
                elapsed = time.time() - start_time
                print(f'  ... {i+1}/{len(files)} 文件, {total_poems} 首, {chars_inserted} 字符索引, {elapsed:.1f}s')

        conn.commit()

    # 创建普通索引
    print('\n创建索引...')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_poems_author ON poems(author)')
    if not lean_mode:
        conn.execute('CREATE INDEX IF NOT EXISTS idx_poem_chars_char ON poem_chars(char)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_poems_dynasty ON poems(dynasty)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_poems_source ON poems(source)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_poem_lines_poem ON poem_lines(poem_id)')
    conn.commit()

    # 数据库统计
    poem_count = conn.execute('SELECT COUNT(*) FROM poems').fetchone()[0]
    if not lean_mode:
        char_count = conn.execute('SELECT COUNT(DISTINCT char) FROM poem_chars').fetchone()[0]
        line_count = conn.execute('SELECT COUNT(*) FROM poem_lines').fetchone()[0]
    else:
        char_count = 0
        line_count = 0

    conn.close()

    elapsed = time.time() - start_time
    print(f'\n构建完成!')
    print(f'   诗词: {poem_count} 首')
    if not lean_mode:
        print(f'   行:   {line_count} 行')
        print(f'   汉字: {char_count} 个 (不同字符)')
    print(f'   耗时: {elapsed:.1f} 秒')
    print(f'   路径: {db_path}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='构建诗词数据库')
    parser.add_argument('--db-path', default=os.path.join(os.path.dirname(__file__), '..', '..', 'poetry.db'),
                        help='数据库输出路径')
    parser.add_argument('--quick', action='store_true',
                        help='快速模式：只处理前几个文件')
    parser.add_argument('--lean', action='store_true',
                        help='精简模式：只建 poems 表，不建字符/行索引')
    args = parser.parse_args()

    build_database(args.db_path, quick_mode=args.quick, lean_mode=args.lean)
