from fastapi import APIRouter, HTTPException
from app import models
from app.services import matching_service

router = APIRouter()

@router.post("/find-roomate")
async def find_roomate_endpoint(request: models.MatchRequest):
    #API endpoint. Nhan requet va goi service
    try: 
        # Goi ham 'process_match' tu service de lam viec
        result = matching_service.process_match(
            user_id=request.user_id,
            accommodation_id=request.accommodation_id
        )
        return result
    except Exception as e: 
        # Bat cac loi chung (VD: CSDL sap)
        raise HTTPException(status_code=500, detail=str(e))
