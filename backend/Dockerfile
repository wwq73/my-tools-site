FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 解压诗词数据库（构建时解压，启动即用）
RUN if [ -f poetry.db.gz ]; then \
        gzip -d poetry.db.gz && echo "诗词数据库解压完成"; \
    else \
        echo "无 poetry.db.gz，跳过解压"; \
    fi

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
