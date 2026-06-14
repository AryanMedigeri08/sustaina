// ═══════════════════════════════════════════
// SUSTAINA — Gemini & Voice Integration Service
// Client-side wrappers for Web Speech APIs and FastAPI proxy calls
// ═══════════════════════════════════════════

import { 
  parseProfileLocally, 
  generateRecommendationsLocally, 
  generatePurchaseAdviceLocally, 
  generateReportLocally 
} from './localFallbacks.js';

const BACKEND_URL = 'http://127.0.0.1:8000';

/**
 * Checks if the local FastAPI backend is active and healthy.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'healthy' && data.has_key === true;
  } catch (e) {
    return false;
  }
}

/**
 * Calls FastAPI backend to generate the next onboarding question dynamically.
 */
export async function getNextOnboardingQuestion(currentData, history = []) {
  const isHealthy = await checkBackendHealth();
  if (isHealthy) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/onboarding-next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_data: currentData, history })
      });
      if (res.ok) {
        const data = await res.json();
        return data.question;
      }
    } catch (e) {
      console.warn('Backend onboarding-next-question failed:', e);
    }
  }
  return null;
}

/**
 * Calls FastAPI backend to extract user profile details from conversational text.
 */
export async function extractProfileFromVoice(transcript, currentData = {}) {
  const isHealthy = await checkBackendHealth();
  if (isHealthy) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/extract-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, current_data: currentData })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend extract-profile failed, using local parser:', e);
    }
  }
  return parseProfileLocally(transcript);
}

/**
 * Calls FastAPI backend to generate personalized coaching cards.
 */
export async function getCoachRecommendations(profile, activities = [], memory = {}) {
  const isHealthy = await checkBackendHealth();
  if (isHealthy) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/coach-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, activities, memory })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend coach-recommendations failed, using local generator:', e);
    }
  }
  return generateRecommendationsLocally(profile, activities, memory);
}

/**
 * Calls FastAPI backend to analyze a purchase decision.
 */
export async function getPurchaseAdvice(name, category, cost, runningCost, energyUsage, lifetime) {
  const isHealthy = await checkBackendHealth();
  if (isHealthy) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/purchase-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: name,
          product_category: category,
          product_cost: cost,
          running_cost: runningCost,
          energy_usage: energyUsage,
          expected_lifetime: lifetime
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend purchase-advice failed, using local generator:', e);
    }
  }
  return generatePurchaseAdviceLocally(name, category, cost, runningCost, energyUsage, lifetime);
}

/**
 * Calls FastAPI backend to compile an AI sustainability report.
 */
export async function getAIReport(type, period, activities, goals, memory, simulations, purchases) {
  const isHealthy = await checkBackendHealth();
  if (isHealthy) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, period, activities, goals, memory, simulations, purchases })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend generate-report failed, using local generator:', e);
    }
  }
  return generateReportLocally(type, period, activities);
}

/**
 * Calls FastAPI backend to update memory preferences based on activity patterns.
 */
export async function updateAIMemory(activities, simulations, goals, memory) {
  const isHealthy = await checkBackendHealth();
  if (isHealthy) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/update-memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities, simulations, goals, memory })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend update-memory failed:', e);
    }
  }
  return null;
}

// ─── Browser Web Speech API Wrappers ─── //

let activeAudio = null;

export async function speakText(text, onPlaying = null, onEnd = null, onLoading = null) {
  stopSpeaking();
  if (onLoading) onLoading();

  try {
    const res = await fetch(`${BACKEND_URL}/api/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.audio) {
        activeAudio = new Audio("data:audio/wav;base64," + data.audio);
        if (onPlaying) activeAudio.onplaying = onPlaying;
        if (onEnd) { activeAudio.onended = onEnd; activeAudio.onerror = onEnd; }
        await activeAudio.play();
        return;
      }
    }
  } catch (e) {
    console.warn('Gemini TTS failed, falling back to local SpeechSynthesis');
  }
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (/[\u0900-\u097F]/.test(text)) utterance.lang = 'hi-IN';
    if (onPlaying) utterance.onstart = onPlaying;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  } else {
    if (onPlaying) onPlaying();
    if (onEnd) onEnd();
  }
}

export function stopSpeaking() {
  if (activeAudio) { activeAudio.pause(); activeAudio = null; }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function initSpeechRecognition(onResult, onEnd, onError = null) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'en-IN';

  rec.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      transcript += e.results[i][0].transcript;
    }
    if (onResult) onResult(transcript);
  };
  rec.onend = () => onEnd && onEnd();
  rec.onerror = (e) => onError && onError(e);
  return rec;
}

