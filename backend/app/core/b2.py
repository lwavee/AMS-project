import os
import uuid
from b2sdk.v2 import InMemoryAccountInfo, B2Api
from fastapi import HTTPException

def get_b2_api():
    info = InMemoryAccountInfo()
    b2_api = B2Api(info)
    
    application_key_id = os.getenv("B2_KEY_ID")
    application_key = os.getenv("B2_APPLICATION_KEY")
    
    if not application_key_id or not application_key:
        return None
        
    try:
        b2_api.authorize_account("production", application_key_id, application_key)
        return b2_api
    except Exception as e:
        print(f"Error authorizing B2 account: {e}")
        return None

def upload_file_to_b2(file_bytes: bytes, file_name: str) -> dict:
    """
    Uploads a file to Backblaze B2, or falls back to local storage if B2 is not configured.
    """
    b2_api = get_b2_api()
    bucket_name = os.getenv("B2_BUCKET_NAME")
    
    if b2_api and bucket_name:
        try:
            bucket = b2_api.get_bucket_by_name(bucket_name)
            file_info = bucket.upload_bytes(file_bytes, file_name)
            download_url = b2_api.get_download_url_for_file_name(bucket_name, file_name)
            return {
                "b2_file_id": file_info.id_,
                "url": download_url
            }
        except Exception as e:
            print(f"Error uploading to B2: {e}, falling back to local storage")
    
    # Fallback: Save to local uploads folder
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # Avoid file name collisions by prepending a unique prefix
        unique_name = f"{uuid.uuid4().hex}_{file_name}"
        local_path = os.path.join("uploads", unique_name)
        
        with open(local_path, "wb") as f:
            f.write(file_bytes)
            
        url = f"/uploads/{unique_name}"
        
        return {
            "b2_file_id": f"local_{unique_name}",
            "url": url
        }
    except Exception as e:
        print(f"Error saving file locally: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")
