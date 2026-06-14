import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import os
import sys

# Add backend directory to path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "has_key" in data

@patch("main.call_gemini_flash")
def test_extract_profile_endpoint(mock_gemini):
    # Mock return value
    expected_response = {
        "name": "Aryan Medigeri",
        "city": "Pune",
        "primaryTransport": "bike",
        "dailyTransportKm": 18,
        "diet": "vegetarian",
        "householdSize": 4,
        "electricityUnits": 280,
        "lpgCylinders": 1
    }
    mock_gemini.return_value = expected_response

    payload = {
        "transcript": "My name is Aryan Medigeri and I live in Pune and ride a bike.",
        "current_data": {}
    }

    response = client.post("/api/extract-profile", json=payload)
    assert response.status_code == 200
    assert response.json() == expected_response
    mock_gemini.assert_called_once()

@patch("main.call_gemini_flash")
def test_onboarding_next_question_endpoint(mock_gemini):
    # Test case 1: Empty history (bypass Gemini)
    payload_empty = {
        "current_data": {"language": "english"},
        "history": []
    }
    response = client.post("/api/onboarding-next-question", json=payload_empty)
    assert response.status_code == 200
    assert "question" in response.json()
    assert "name" in response.json()["question"]
    mock_gemini.assert_not_called()

    # Test case 2: With history (calls Gemini)
    mock_gemini.return_value = {"question": "Which city do you live in?"}
    payload_history = {
        "current_data": {"language": "english", "name": "Aryan"},
        "history": ["Arya: Hello! What is your name?", "User: My name is Aryan"]
    }
    response = client.post("/api/onboarding-next-question", json=payload_history)
    assert response.status_code == 200
    assert response.json() == {"question": "Which city do you live in?"}
    mock_gemini.assert_called_once()

@patch("main.call_gemini_flash")
def test_coach_recommendations_endpoint(mock_gemini):
    expected_response = {
        "weekRange": "15 Jun – 21 Jun",
        "progressPct": 60,
        "recommendations": ["Rec 1", "Rec 2"],
        "cards": []
    }
    mock_gemini.return_value = expected_response

    payload = {
        "profile": {"city": "Pune", "primaryTransport": "bike"},
        "activities": [],
        "memory": {}
    }

    response = client.post("/api/coach-recommendations", json=payload)
    assert response.status_code == 200
    assert response.json() == expected_response

@patch("main.call_gemini_flash")
def test_purchase_advice_endpoint(mock_gemini):
    expected_response = {
        "recommendation": "Yes",
        "explanation": "This is a great eco purchase."
    }
    mock_gemini.return_value = expected_response

    payload = {
        "product_name": "Solar panels",
        "product_category": "solar",
        "product_cost": 150000.0,
        "running_cost": 0.0,
        "energy_usage": -3000.0,
        "expected_lifetime": 25.0
    }

    response = client.post("/api/purchase-advice", json=payload)
    assert response.status_code == 200
    assert response.json() == expected_response

@patch("main.call_gemini_flash")
def test_generate_report_endpoint(mock_gemini):
    expected_response = {
        "summary": "This is a report summary.",
        "achievements": "Unlocked level 2",
        "savings": "Saved 40kg CO2",
        "emissionBreakdown": "40% Transport",
        "topImpactSource": "Transport",
        "carbonTwinProgress": "On track",
        "recommendations": ["Switch to metro"],
        "nextMonthPlan": "Focus on diet"
    }
    mock_gemini.return_value = expected_response

    payload = {
        "type": "monthly",
        "period": "May 2026",
        "activities": [],
        "goals": [],
        "memory": {},
        "simulations": [],
        "purchases": []
    }

    response = client.post("/api/generate-report", json=payload)
    assert response.status_code == 200
    assert response.json() == expected_response

@patch("main.call_gemini_flash")
def test_update_memory_endpoint(mock_gemini):
    expected_response = {
        "userPreferences": {
            "budgetSensitive": True,
            "prefersVegetarian": True,
            "avoidsPublicTransport": False,
            "interestedInSolar": True
        },
        "behaviorPatterns": {
            "loggingFrequency": "high",
            "dominantEmissionsSector": "transport"
        }
    }
    mock_gemini.return_value = expected_response

    payload = {
        "activities": [],
        "simulations": [],
        "goals": [],
        "memory": {}
    }

    response = client.post("/api/update-memory", json=payload)
    assert response.status_code == 200
    assert response.json() == expected_response

@patch("urllib.request.urlopen")
def test_speak_endpoint_tts(mock_urlopen):
    # Mock urlopen context manager and response
    mock_response = MagicMock()
    # Aoede voice response base64 encoding helper
    import base64
    dummy_pcm_data = b"RIFFdummywaveheaderandcontentpcmbytesformockingpurposes"
    dummy_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": "audio/wav",
                                "data": base64.b64encode(dummy_pcm_data).decode("utf-8")
                            }
                        }
                    ]
                }
            }
        ]
    }
    
    import json
    mock_response.read.return_value = json.dumps(dummy_payload).encode("utf-8")
    mock_urlopen.return_value.__enter__.return_value = mock_response

    # Force environment key check to pass
    with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_key_value"}):
        # We need to mock pcm_to_wav as well, or let it run. Let's patch it to return simple bytes
        with patch("main.pcm_to_wav") as mock_pcm_to_wav:
            mock_pcm_to_wav.return_value = b"WAV_DATA"
            
            payload = {"text": "Hello, how can I help you?"}
            response = client.post("/api/speak", json=payload)
            
            assert response.status_code == 200
            assert "audio" in response.json()
