from fastapi import FastAPI
from api import base
from config import Config
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title=Config.PROJECT_NAME, version=Config.PROJECT_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(base.router)
