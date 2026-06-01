from fastapi import APIRouter
from .todo import router as todo_router
from .fortune import router as fortune_router
from .poetry import router as poetry_router

api_router = APIRouter(prefix="/api")
api_router.include_router(todo_router, prefix="/todo", tags=["todo"])
api_router.include_router(fortune_router, prefix="/fortune", tags=["每日灵签"])
api_router.include_router(poetry_router, tags=["诗词求解器"])
