from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./mytools.db"
    redis_url: str = "redis://localhost:6379/0"
    debug: bool = True
    secret_key: str = "your-secret-key-change-this-in-production"

    def __init__(self, **data):
        super().__init__(**data)
        # Render 提供的 DATABASE_URL 是 postgresql:// 格式，
        # 自动补上 +asyncpg 以适配 SQLAlchemy 异步驱动
        if self.database_url.startswith('postgresql://') and '+asyncpg' not in self.database_url:
            self.database_url = self.database_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
        if self.database_url.startswith('postgres://') and '+asyncpg' not in self.database_url:
            self.database_url = self.database_url.replace('postgres://', 'postgres+asyncpg://', 1)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
