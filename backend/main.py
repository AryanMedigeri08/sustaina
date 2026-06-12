import os
import json
import urllib.request
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Sustaina V2 API Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local MVP development, allows Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def call_gemini_flash(prompt: str, system_instruction: str = None) -> dict:
    """Helper function to call Gemini 1.5 Flash via REST API."""
    api_key = GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is not configured on the server."
        )
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
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
            
            # Extract candidate text
            candidate = res_data.get("candidates", [{}])[0]
            text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
            
            # Return parsed JSON content
            return json.loads(text.strip())
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        print(f"Gemini API Error: {error_msg}")
        raise HTTPException(status_code=e.code, detail=f"Gemini API call failed: {error_msg}")
    except Exception as e:
        print(f"Server Error during Gemini Call: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to communicate with Gemini: {str(e)}")


# ─── Pydantic Models for Requests ─── #

class OnboardingExtractionRequest(BaseModel):
    transcript: str
    current_data: dict

class CoachRequest(BaseModel):
    profile: dict
    activities: list
    memory: dict

class PurchaseRequest(BaseModel):
    product_name: str
    product_category: str
    product_cost: float
    running_cost: float
    energy_usage: float
    expected_lifetime: float


# ─── API Endpoints ─── #

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "has_key": bool(GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY"))
    }

@app.post("/api/extract-profile")
def extract_profile(req: OnboardingExtractionRequest):
    system_prompt = (
        "You are Arya, the voice companion for Sustaina, an Indian AI-powered sustainability app.\n"
        "Your task is to analyze the user's conversational transcript and extract/update their profile parameters.\n"
        "Return a JSON object containing the updated fields. Only include fields that have been explicitly mentioned.\n"
        "Do NOT hallucinate values. Keep other values null if not mentioned.\n\n"
        "Available fields to extract:\n"
        "- name (string)\n"
        "- city (string, normalized to Indian cities like Pune, Mumbai, Bangalore, Delhi, Chennai, Hyderabad, Kochi, Kolkata, Jaipur, Lucknow, Ahmedabad)\n"
        "- primaryTransport (string: 'car_petrol', 'car_diesel', 'car_shared', 'bike', 'auto', 'bus', 'metro', 'train', 'walk', 'cycle')\n"
        "- dailyTransportKm (number)\n"
        "- diet (string: 'vegan', 'vegetarian', 'occasional_nonveg', 'non_vegetarian')\n"
        "- householdSize (number)\n"
        "- electricityUnits (number, average monthly electricity consumption in kWh)\n"
        "- lpgCylinders (number, monthly cylinder count)\n\n"
        "Response Schema:\n"
        "{\n"
        "  \"name\": string or null,\n"
        "  \"city\": string or null,\n"
        "  \"primaryTransport\": string or null,\n"
        "  \"dailyTransportKm\": number or null,\n"
        "  \"diet\": string or null,\n"
        "  \"householdSize\": number or null,\n"
        "  \"electricityUnits\": number or null,\n"
        "  \"lpgCylinders\": number or null\n"
        "}"
    )
    
    prompt = (
        f"Current Profile Data:\n{json.dumps(req.current_data)}\n\n"
        f"New User Conversation Transcript:\n\"{req.transcript}\"\n\n"
        f"Extract and return updated parameters in the Response Schema JSON format."
    )
    
    return call_gemini_flash(prompt, system_prompt)

@app.post("/api/coach-recommendations")
def coach_recommendations(req: CoachRequest):
    system_prompt = (
        "You are Arya, the AI sustainability coach. Analyze the user's carbon footprint profile, activity logs, and memory.\n"
        "Generate 4 highly tailored recommendations representing:\n"
        "1. Biggest Impact (high carbon reduction)\n"
        "2. Cheapest Improvement (low cost, decent reduction)\n"
        "3. Easy Win (minimal effort, high consistency potential)\n"
        "4. Weekly Challenge (a challenge to join)\n\n"
        "Also generate a weekly plan greeting summary and list of 4 bullet points.\n"
        "Verify: Recommendations must be realistic for an Indian user in their specific city.\n"
        "Consider Memory: Do not recommend items they have ignored recently. Personalize based on what they accepted.\n"
        "Format output EXACTLY in the following JSON schema:\n"
        "{\n"
        "  \"weekRange\": \"string (e.g., '15 Jun – 21 Jun')\",\n"
        "  \"progressPct\": number (0-100 progress estimate),\n"
        "  \"recommendations\": [\"string 1\", \"string 2\", \"string 3\", \"string 4\"],\n"
        "  \"cards\": [\n"
        "    {\n"
        "      \"type\": \"biggest_impact\",\n"
        "      \"title\": \"Biggest Impact\",\n"
        "      \"desc\": \"string (description of action)\",\n"
        "      \"impact\": \"string (e.g. '− save 4.2 kg CO₂')\",\n"
        "      \"secondary\": \"string (e.g. '+ save ₹114')\",\n"
        "      \"icon\": \"🔥\",\n"
        "      \"bgColor\": \"#fff5e5\"\n"
        "    },\n"
        "    {\n"
        "      \"type\": \"cheapest_improvement\",\n"
        "      \"title\": \"Cheapest Improvement\",\n"
        "      \"desc\": \"string\",\n"
        "      \"impact\": \"string\",\n"
        "      \"secondary\": \"string\",\n"
        "      \"icon\": \"⚡\",\n"
        "      \"bgColor\": \"#e5f5e5\"\n"
        "    },\n"
        "    {\n"
        "      \"type\": \"easy_win\",\n"
        "      \"title\": \"Easy Win\",\n"
        "      \"desc\": \"string\",\n"
        "      \"impact\": \"string\",\n"
        "      \"secondary\": \"string\",\n"
        "      \"icon\": \"🥗\",\n"
        "      \"bgColor\": \"#f0f8ea\"\n"
        "    },\n"
        "    {\n"
        "      \"type\": \"weekly_challenge\",\n"
        "      \"title\": \"Weekly Challenge\",\n"
        "      \"desc\": \"string\",\n"
        "      \"impact\": \"string\",\n"
        "      \"secondary\": \"string\",\n"
        "      \"icon\": \"🏆\",\n"
        "      \"bgColor\": \"#fef3d0\"\n"
        "    }\n"
        "  ]\n"
        "}"
    )
    
    prompt = (
        f"User Profile: {json.dumps(req.profile)}\n"
        f"Recent Logged Activities: {json.dumps(req.activities)}\n"
        f"Arya Memory History: {json.dumps(req.memory)}\n\n"
        "Generate the weekly plan recommendations."
    )
    
    return call_gemini_flash(prompt, system_prompt)

@app.post("/api/purchase-advice")
def purchase_advice(req: PurchaseRequest):
    system_prompt = (
        "You are Arya, the Smart Purchase Advisor. Analyze the user's purchase metrics and provide sustainability-focused recommendation.\n"
        "Be extremely objective. Tell them whether to buy, consider, or avoid.\n"
        "Provide a concise, premium text explanation in 2-3 sentences. Focus on payback and environmental savings.\n"
        "Return the recommendation in the following JSON format:\n"
        "{\n"
        "  \"recommendation\": \"string (Yes / No / Consider)\",\n"
        "  \"explanation\": \"string (2-3 sentences explaining pros, cons, and environmental/cost context)\"\n"
        "}"
    )
    
    prompt = (
        f"Product Name: {req.product_name}\n"
        f"Category: {req.product_category}\n"
        f"Product Cost: ₹{req.product_cost}\n"
        f"Running Cost: ₹{req.running_cost}/month\n"
        f"Energy Usage: {req.energy_usage} kWh/year\n"
        f"Expected Lifetime: {req.expected_lifetime} years\n"
        "Evaluate this purchase."
    )
    
    return call_gemini_flash(prompt, system_prompt)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
