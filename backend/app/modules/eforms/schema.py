from pydantic import BaseModel
from typing import Dict, Any

class OverrideRequest(BaseModel):
    overrides: Dict[str, str]

class OverrideResponse(BaseModel):
    message: str
    updated_fields: int

class CertificateMergedResponse(BaseModel):
    certificate: Dict[str, Any]
    overrides: Dict[str, str]
