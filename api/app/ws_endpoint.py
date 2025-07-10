from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from typing import Dict, List
from .deps import require_room
from .logger import logger

ws_router = APIRouter()

# Track all WebSocket clients per room
rooms_connections: Dict[str, List[WebSocket]] = {}

@ws_router.websocket("/ws/meetings/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    try:
        require_room(room_id)
    except Exception as e:
        logger.error(f"Room validation failed for {room_id}: {e}")
        await websocket.close(code=4004, reason=f"Room not found: {room_id}")
        return

    await websocket.accept()
    logger.info(f"Client connected to room {room_id}")

    if room_id not in rooms_connections:
        rooms_connections[room_id] = []
    rooms_connections[room_id].append(websocket)

    try:
        while True:
            message = await websocket.receive_text()
            logger.info(f"Message from client in room {room_id}: {message}")

            # Relay message to all other clients in the room
            for client in rooms_connections[room_id]:
                if client != websocket:
                    try:
                        await client.send_text(message)
                    except Exception as e:
                        logger.warning(f"Failed to send message to a client: {e}")
    except WebSocketDisconnect:
        logger.info("Client disconnected from room {room_id}")
        rooms_connections[room_id].remove(websocket)
