# in backend/src/core/config.py

import os
from dotenv import load_dotenv

load_dotenv() # <--- THIS LINE READS your .env file and loads the variables.

# This line now securely gets the value from the loaded environment.
MONGO_DETAILS = os.getenv("MONGO_DETAILS")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# ... (other imports)
WEATHERAPI_COM_KEY = os.getenv("WEATHERAPI_COM_KEY") 