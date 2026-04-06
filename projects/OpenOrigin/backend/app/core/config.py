from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres.fippycifijhcmsrxoylr:gG84PMxGOKFrT40a@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "OpenOrigin API"

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
