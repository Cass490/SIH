import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    BHUVAN_USER_ID = os.getenv("BHUVAN_USER_ID")
    BHUVAN_PASSWORD = os.getenv("BHUVAN_PASSWORD")
    INDIAN_API_KEY = os.getenv("INDIAN_API_KEY")
    WEATHERAPI_COM_KEY = os.getenv("WEATHERAPI_COM_KEY")

settings = Settings()
