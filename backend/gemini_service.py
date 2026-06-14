import os
import json
import urllib.request
import urllib.error
from fastapi import HTTPException

def call_gemini_flash(prompt: str, system_instruction: str = None, api_key: str = "") -> dict:
    """Helper function to call Gemini via REST API with fallback support."""
    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY", "")
    
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is not configured on the server."
        )
    
    models_to_try = [
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-1.5-flash"
    ]
    
    last_error = ""
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [
                    {"text": system_instruction}
                ]
            }
            
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidate = res_data.get("candidates", [{}])[0]
                text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
                return json.loads(text.strip())
        except urllib.error.HTTPError as e:
            last_error = e.read().decode("utf-8")
            print(f"Gemini API Error with model {model_name}: {last_error}")
        except Exception as e:
            last_error = str(e)
            print(f"Server Error with model {model_name} during Gemini Call: {last_error}")
            
    raise HTTPException(status_code=500, detail=f"All Gemini text models failed. Last error: {last_error}")
