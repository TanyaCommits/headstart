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