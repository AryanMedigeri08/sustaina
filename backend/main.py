import os
import json
import urllib.request
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables from root .env
load_dotenv()

app = FastAPI(title="Sustaina V3 API Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sustaina-delta.vercel.app/", 
        "http://localhost:3000",
        "http://localhost:5173",],  # For local MVP development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, bit_depth: int = 16) -> bytes:
    """Prepends a 44-byte WAV header to raw PCM bytes."""
    num_samples = len(pcm_data)
    block_align = channels * (bit_depth // 8)
    byte_rate = sample_rate * block_align
    
    header = bytearray(44)
    # RIFF header
    header[0:4] = b'RIFF'
    header[4:8] = (36 + num_samples).to_bytes(4, 'little')
    header[8:12] = b'WAVE'
    # "fmt " subchunk
    header[12:16] = b'fmt '
    header[16:20] = (16).to_bytes(4, 'little') # subchunk1size (16 for PCM)
    header[20:22] = (1).to_bytes(2, 'little')  # audio format (1 for PCM)
    header[22:24] = channels.to_bytes(2, 'little')
    header[24:28] = sample_rate.to_bytes(4, 'little')
    header[28:32] = byte_rate.to_bytes(4, 'little')
    header[32:34] = block_align.to_bytes(2, 'little')
    header[34:36] = bit_depth.to_bytes(2, 'little')
    # "data" subchunk
    header[36:40] = b'data'
    header[40:44] = num_samples.to_bytes(4, 'little')
    
    return bytes(header) + pcm_data

def call_gemini_flash(prompt: str, system_instruction: str = None) -> dict:
    """Helper function to call Gemini via REST API with fallback support."""
    api_key = GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is not configured on the server."
        )
    
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite"
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

class ReportRequest(BaseModel):
    type: str # 'weekly', 'monthly', 'quarterly'
    period: str # e.g. 'May 2026'
    activities: list
    goals: list
    memory: dict
    simulations: list
    purchases: list

class UpdateMemoryRequest(BaseModel):
    activities: list
    simulations: list
    goals: list
    memory: dict

class SpeakRequest(BaseModel):
    text: str

class OnboardingNextQuestionRequest(BaseModel):
    current_data: dict
    history: List[str] = []


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
        "}\n\n"
        "Note: The user transcript may be in English, Hindi (Devanagari), or Hinglish (transliterated Hindi). "
        "Translate and understand their response accurately to update the profile JSON fields. "
        "If they mention values in Hindi or Hinglish (e.g. 'do log' or 'char log' for householdSize, 'shakahari' or 'veg' for diet), "
        "parse them correctly to match the exact schema values."
    )
    
    prompt = (
        f"Current Profile Data:\n{json.dumps(req.current_data)}\n\n"
        f"New User Conversation Transcript:\n\"{req.transcript}\"\n\n"
        f"Extract and return updated parameters in the Response Schema JSON format."
    )
    
    return call_gemini_flash(prompt, system_prompt)

@app.post("/api/onboarding-next-question")
def onboarding_next_question(req: OnboardingNextQuestionRequest):
    language = req.current_data.get("language", "english").lower()
    
    # If history is empty, bypass Gemini and return the exact requested opening message in the chosen language.
    if not req.history:
        if language == "hindi":
            return {"question": "नमस्ते! मैं जानती हूँ कि आपका समय बहुत कीमती है, लेकिन मुझे आपको ऑनबोर्ड करने के लिए केवल 2 मिनट चाहिए। शुरू करने के लिए, क्या आप मुझे अपना नाम बता सकते हैं?"}
        elif language == "hinglish":
            return {"question": "Hello! Mujhe pata hai aapka time bahut precious hai, lekin mujhe aapko onboard karne ke liye bas 2 minutes chahiye. Chaliye start karte hain, kya aap mujhe apna naam bata sakte hain?"}
        else:
            return {"question": "Hello! I know your time is precious, but I just need 2 minutes of it to onboard you. To get started, could you please tell me your name?"}

    lang_instruction = ""
    if language == "hindi":
        lang_instruction = (
            "You MUST speak and respond ONLY in Hindi using Devanagari script (देवनागरी लिपि). "
            "Do NOT write in English or Hinglish. Make sure your response is culturally warm, polite, and uses appropriate Hindi vocabulary."
        )
    elif language == "hinglish":
        lang_instruction = (
            "You MUST speak and respond ONLY in Hinglish (Hindi spoken language written in Latin/English letters). "
            "Do NOT write in Devanagari script. Use common Romanized Hindi wording, for example: "
            "'Aapka name/city kya hai?', 'Aap work ke liye kaise travel karte hain?', 'Aapki monthly electricity units kitni hain?'. "
            "Keep it extremely natural and conversational, exactly how people chat in India."
        )
    else:
        lang_instruction = (
            "You MUST speak and respond ONLY in clear, natural, friendly English."
        )

    system_prompt = (
        "You are Arya, the warm AI sustainability coach for Sustaina. Your goal is to guide the user through onboarding "
        "by asking them questions to collect their profile details in a natural, friendly, conversational manner.\n"
        f"{lang_instruction}\n\n"
        "Here are the fields you need to collect, and you MUST collect them strictly in this sequence:\n"
        "1. Name (already collected)\n"
        "2. City in India\n"
        "3. Primary transport mode and daily commute distance in km\n"
        "4. Average monthly electricity units (kWh)\n"
        "5. Household size and Diet type (vegan, vegetarian, non-vegetarian)\n\n"
        "Current profile state:\n"
        f"{json.dumps(req.current_data)}\n\n"
        "Conversation history so far:\n"
        f"{json.dumps(req.history)}\n\n"
        "Identify the next missing field in the sequence and formulate a natural, short, and friendly follow-up question in the selected language. "
        "Do not ask questions out of order. "
        "If all details are successfully collected, output exactly: 'Perfect! I have extracted all your details. Let's review them together now.' in the selected language:\n"
        "- English: 'Perfect! I have extracted all your details. Let\'s review them together now.'\n"
        "- Hindi: 'उत्कृष्ट! मैंने आपकी सभी जानकारी एकत्र कर ली है। आइए अब हम मिलकर इसकी समीक्षा करें।'\n"
        "- Hinglish: 'Perfect! Maine aapki saari details collect kar li hain. Chaliye ab ek baar inko review kar lete hain.'\n\n"
        "Format the output EXACTLY in the following JSON schema:\n"
        "{\n"
        "  \"question\": \"string (the question to speak to the user)\"\n"
        "}"
    )
    prompt = "Generate the next question based on the missing information and conversation history."
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


# ─── V3 AI Report & Advanced Memory Endpoints ─── #

@app.post("/api/generate-report")
def generate_report(req: ReportRequest):
    system_prompt = (
        "You are the Sustaina AI Reporting Engine. Compile a detailed monthly, weekly, or quarterly sustainability report.\n"
        "The report should contain summaries of savings, emissions, carbon twin progress, and a strategic plan for the next period.\n"
        "Use deterministic facts from the provided logs. Keep it highly personalized to their behavior.\n"
        "Return the compiled report in the following JSON format:\n"
        "{\n"
        "  \"summary\": \"string (1-2 paragraphs of key insights and encouraging feedback)\",\n"
        "  \"achievements\": \"string (highlighting major milestones reached, e.g. challenges completed)\",\n"
        "  \"savings\": \"string (e.g. 'You saved ₹840 and 42 kg of CO₂ this month')\",\n"
        "  \"emissionBreakdown\": \"string (summary of which sectors contributed what percentage)\",\n"
        "  \"topImpactSource\": \"string (their highest emission category and what to do about it)\",\n"
        "  \"carbonTwinProgress\": \"string (how close they are to their simulated Future Twin footprint)\",\n"
        "  \"recommendations\": [\"string 1\", \"string 2\", \"string 3\"],\n"
        "  \"nextMonthPlan\": \"string (a specific, realistic focus area for the upcoming month)\"\n"
        "}"
    )
    
    prompt = (
        f"Report Type: {req.type}\n"
        f"Report Period: {req.period}\n\n"
        f"User Activities Logged: {json.dumps(req.activities)}\n"
        f"Goals Setup: {json.dumps(req.goals)}\n"
        f"Arya Memory: {json.dumps(req.memory)}\n"
        f"Simulations Performed: {json.dumps(req.simulations)}\n"
        f"Purchase Analyses Run: {json.dumps(req.purchases)}\n\n"
        "Generate a structured, professional report."
    )
    
    return call_gemini_flash(prompt, system_prompt)

@app.post("/api/update-memory")
def update_memory(req: UpdateMemoryRequest):
    system_prompt = (
        "You are Arya's preference extraction engine. Analyze the user's historical activities, goals, and simulations.\n"
        "Extract behavioral traits, preferences, and interests. Specifically identify if they are:\n"
        "- Budget sensitive (interested in saving money)\n"
        "- Solar energy interested (run solar simulations or purchase solar templates)\n"
        "- Vegetarian preference (mostly vegetarian activity logs)\n"
        "- Commute preference (avoids public transit, prefers personal vehicle, or takes public transport)\n\n"
        "Format the output in this exact JSON schema:\n"
        "{\n"
        "  \"userPreferences\": {\n"
        "    \"budgetSensitive\": boolean,\n"
        "    \"prefersVegetarian\": boolean,\n"
        "    \"avoidsPublicTransport\": boolean,\n"
        "    \"interestedInSolar\": boolean\n"
        "  },\n"
        "  \"behaviorPatterns\": {\n"
        "    \"loggingFrequency\": \"string (high / medium / low)\",\n"
        "    \"dominantEmissionsSector\": \"string (transport / food / energy / shopping)\"\n"
        "  }\n"
        "}"
    )
    
    prompt = (
        f"Activities Logged: {json.dumps(req.activities)}\n"
        f"Simulations Performed: {json.dumps(req.simulations)}\n"
        f"Goals: {json.dumps(req.goals)}\n"
        f"Current Memory State: {json.dumps(req.memory)}\n"
        "Analyze these patterns and update preferences."
    )
    
    return call_gemini_flash(prompt, system_prompt)

@app.post("/api/speak")
def speak(req: SpeakRequest):
    api_key = GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is not configured on the server."
        )
    
    models_to_try = [
        "gemini-2.5-flash-preview-tts",
        "gemini-3.1-flash-tts-preview"
    ]
    
    last_error = ""
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": req.text}
                    ]
                }
            ],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": "Aoede" # friendly female voice
                        }
                    }
                }
            }
        }
        
        try:
            import base64
            req_obj = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req_obj) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidate = res_data.get("candidates", [{}])[0]
                parts = candidate.get("content", {}).get("parts", [])
                
                pcm_base64 = ""
                for part in parts:
                    if "inlineData" in part:
                        inline = part["inlineData"]
                        if inline.get("mimeType", "").startswith("audio/"):
                            pcm_base64 = inline.get("data", "")
                            break
                
                if not pcm_base64:
                    continue
                
                # Decode PCM base64
                pcm_data = base64.b64decode(pcm_base64)
                
                # Convert PCM to WAV
                wav_data = pcm_to_wav(pcm_data, sample_rate=24000)
                
                # Re-encode to base64
                wav_base64 = base64.b64encode(wav_data).decode("utf-8")
                
                return {"audio": wav_base64}
                
        except urllib.error.HTTPError as e:
            last_error = e.read().decode("utf-8")
            print(f"Gemini TTS Error with model {model_name}: {last_error}")
        except Exception as e:
            last_error = str(e)
            print(f"Server Error with model {model_name} during Gemini TTS: {last_error}")
            
    raise HTTPException(status_code=500, detail=f"All Gemini TTS models failed. Last error: {last_error}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
