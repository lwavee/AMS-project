import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from the .env file located at backend/.env
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    DATABASE_URL: str | None = os.getenv("DATABASE_URL").strip() if os.getenv("DATABASE_URL") else None
    APP_NAME: str = os.getenv("APP_NAME", "AMS360")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret")
    CUSTOMJS_API_KEY: str | None = os.getenv("CUSTOMJS_API_KEY")

settings = Settings()
