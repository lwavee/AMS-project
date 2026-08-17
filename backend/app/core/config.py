import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from the .env file located at backend/.env
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    DATABASE_URL: str | None = (os.getenv("DATABASE_URL") or "").strip() or None
    APP_NAME: str = os.getenv("APP_NAME", "AMS360")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret")
    CUSTOMJS_API_KEY: str | None = os.getenv("CUSTOMJS_API_KEY")
    SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY: str | None = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SECRET_KEY: str | None = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    BACKUP_DATABASE_URL: str | None = (os.getenv("BACKUP_DATABASE_URL") or "").strip() or None
    BACKUP_SUPABASE_URL: str | None = os.getenv("BACKUP_SUPABASE_URL")
    BACKUP_SUPABASE_ANON_KEY: str | None = os.getenv("BACKUP_SUPABASE_ANON_KEY")
    BACKUP_SUPABASE_SECRET_KEY: str | None = os.getenv("BACKUP_SUPABASE_SECRET_KEY")

settings = Settings()

