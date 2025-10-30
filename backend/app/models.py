from pydantic import BaseModel

class MatchRequest(BaseModel):
    user_id: int
    accommodation_id: int