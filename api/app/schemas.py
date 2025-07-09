from pydantic import BaseModel
 
class CreateRoomResponse(BaseModel):
    room_id: str
    created_at: float 