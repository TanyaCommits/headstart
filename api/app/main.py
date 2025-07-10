from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from .schemas import CreateRoomResponse
from .models import create_room, delete_room, rooms
from .ws_endpoint import ws_router
from .deps import require_room

app = FastAPI()

# Get allowed origins from environment variable, default to localhost:3000 for development
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://notification-frequency-aerial-ac.trycloudflare.com").split(",")

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

@app.delete("/api/meetings/{room_id}")
def delete_meeting(room_id: str):
    """Delete a meeting room"""
    require_room(room_id)  # Validate room exists
    deleted = delete_room(room_id)
    if deleted:
        return {"message": "Meeting room deleted successfully", "room_id": room_id}
    else:
        raise HTTPException(status_code=404, detail="Room not found")

@app.get("/api/rooms/debug")
def debug_list_rooms():
    """Debug endpoint to list all active rooms"""
    return {"rooms": list(rooms.keys()), "count": len(rooms)}

@app.delete("/api/rooms/debug/clear")
def debug_clear_all_rooms():
    """Debug endpoint to clear all rooms"""
    count = len(rooms)
    rooms.clear()
    return {"message": f"Cleared {count} rooms", "remaining": len(rooms)}

@app.get("/healthz")
def healthz():
    return {"status": "ok"} 