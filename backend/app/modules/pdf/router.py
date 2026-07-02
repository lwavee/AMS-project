from fastapi import APIRouter, HTTPException, Response, Depends
from pydantic import BaseModel
import httpx
from app.modules.auth.deps import get_current_user
from app.core.config import settings

router = APIRouter()

class PdfGenerationRequest(BaseModel):
    html: str

@router.post("/generate")
async def generate_pdf(
    request: PdfGenerationRequest,
    current_user = Depends(get_current_user)
):
    customjs_api_key = settings.CUSTOMJS_API_KEY
    url = "https://e.customjs.io/html2pdf"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": customjs_api_key
                },
                json={"input": {"html": request.html}}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"CustomJS API Error: {response.text}")
                
            return Response(content=response.content, media_type="application/pdf")
            
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Error connecting to PDF service: {str(exc)}")
