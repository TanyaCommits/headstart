import time
import secrets
from typing import Dict

rooms: Dict[str, Dict] = {}

def create_room() -> Dict:
    room_id = secrets.token_hex(4)
    created_at = time.time()
    rooms[room_id] = {"room_id": room_id, "created_at": created_at}
    return rooms[room_id]

def get_room(room_id: str):
    return rooms.get(room_id)

def delete_room(room_id: str) -> bool:
    """Delete a room and return True if it existed, False otherwise"""
    if room_id in rooms:
        del rooms[room_id]
        return True
    return False 