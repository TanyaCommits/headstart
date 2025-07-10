from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
import json
import time
from .deps import require_room
from .logger import logger

ws_router = APIRouter()

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