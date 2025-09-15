import requests
import json
from config import settings

API_URL = "https://api.sarvam.ai/translate"

def translate_text(input_text, target_language_code):
    if not settings.SARVAM_API_KEY:
        return "API KEY Error"

    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "input": input_text,
        "source_language_code": "en-IN"
    }

    # Santali 'sd-IN' requires the sarvam-translate:v1 model.
    if target_language_code == "sd-IN":
        payload["model"] = "sarvam-translate:v1"
        payload["target_language_code"] = "sd-IN"
    elif target_language_code == "hi-IN":
        payload["model"] = "mayura:v1" # Using the default sarvam model for Hindi
        payload["target_language_code"] = "hi-IN"
    else:
        return "Error: Unsupported language."

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()  
        
        result = response.json()
        return result.get("translated_text", "Error: Empty Response")

    except requests.exceptions.HTTPError as e:
        return f"HTTP Error: {e}\nResponse: {e.response.text}"
    except requests.exceptions.RequestException as e:
        return f"A network error occurred: {e}"

if __name__ == "__main__":
    english_text = input("Please enter the English text you want to translate:\n> ")

    while True:
        choice = input("\nChoose a language to translate to:\n1. Hindi\n2. Santali\n:")
        if choice == '1':
            target_code = "hi-IN"
            break
        elif choice == '2':
            target_code = "sd-IN"
            break
        else:
            print("Invalid choice")
            
    translated_output = translate_text(english_text, target_code)

    print(f"Translated Text: {translated_output}")