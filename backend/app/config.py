from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # Database
    database_url: str = "sqlite:///./data/qr_platform.db"

    # Lemon Squeezy
    lemon_squeezy_api_key: str = ""
    lemon_squeezy_store_id: str = ""
    lemon_squeezy_webhook_secret: str = ""

    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = ""
    from_name: str = "3D QR Platform"

    # Security
    secret_key: str = ""
    download_token_expire_hours: int = 72

    # Clerk Authentication
    clerk_jwks_url: str = ""
    admin_user_ids: str = ""  # 쉼표로 구분된 관리자 User ID 목록 (JWT "sub" 클레임)
    admin_emails: str = "lsh678902@gmail.com"  # 쉼표로 구분된 관리자 이메일 목록

    # Storage
    storage_path: str = "./storage/orders"
    static_path: str = "./static"

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Public URL
    public_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> List[str]:
        """CORS origins를 리스트로 반환"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def admin_emails_list(self) -> List[str]:
        """관리자 이메일 목록을 리스트로 반환"""
        return [email.strip() for email in self.admin_emails.split(",")]

    @property
    def admin_user_ids_list(self) -> List[str]:
        """관리자 User ID 목록을 리스트로 반환"""
        if not self.admin_user_ids:
            return []
        return [user_id.strip() for user_id in self.admin_user_ids.split(",")]


# 싱글톤 인스턴스
settings = Settings()
