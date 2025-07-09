from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import time
from .deps import require_room
from .logger import logger

ws_router = APIRouter()

@ws_router.websocket("/ws/meetings/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    require_room(room_id)
    await websocket.accept()
    logger.info("Client connected")
    try:
        while True:
            data = await websocket.receive_bytes()
            length = len(data)
            timestamp = time.time()
            logger.info(f"Received {length} bytes at {timestamp}")
            ack = {"type": "ack", "bytes": length, "timestamp": timestamp}
            await websocket.send_text(json.dumps(ack))
    except WebSocketDisconnect:
        logger.info("Client disconnected") 