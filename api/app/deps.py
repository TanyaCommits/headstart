from fastapi import HTTPException
from .models import get_room
 
def require_room(room_id: str):
    room = get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room 