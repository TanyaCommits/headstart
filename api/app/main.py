from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .schemas import CreateRoomResponse
from .models import create_room
from .ws_endpoint import ws_router

app = FastAPI()

# Get allowed origins from environment variable, default to localhost:3000 for development
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)

@app.post("/api/meetings", response_model=CreateRoomResponse)
def post_create_meeting():
    room = create_room()
    return CreateRoomResponse(**room)

@app.get("/healthz")
def healthz():
    return {"status": "ok"} 