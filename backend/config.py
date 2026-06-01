from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./mytools.db"
    redis_url: str = "redis://localhost:6379/0"
    debug: bool = True
    secret_key: str = "your-secret-key-change-this-in-production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
