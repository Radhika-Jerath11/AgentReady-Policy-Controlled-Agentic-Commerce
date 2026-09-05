import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AgentReady"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agentready.db")

    # Razorpay Test Mode
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_demo123456")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "demosecret123456")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "demowebhooksecret")

    # AI Configuration
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL_PROVIDER: str = os.getenv("AI_MODEL_PROVIDER", "openai")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gpt-4o-mini")

    # Demo Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

settings = Settings()
