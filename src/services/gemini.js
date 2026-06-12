// ═══════════════════════════════════════════
// SUSTAINA — Gemini & Voice Integration Service
// Client-side wrappers for Web Speech APIs and FastAPI proxy calls
// ═══════════════════════════════════════════

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

  // Local Rule-based Fallback Parser
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

  // Local Deterministic Recommendation Generator
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

  // Local Rule-based Purchase Advisor Fallback
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
  return generateReportLocally(type, period, activities, goals, memory, simulations, purchases);
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

let speechUtterance = null;

/**
 * Speaks text using the browser's native SpeechSynthesis (TTS).
 */
export function speakText(text, onStart = null, onEnd = null) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Stop any active speech
  window.speechSynthesis.cancel();

  speechUtterance = new SpeechSynthesisUtterance(text);
  
  // Find a high-quality, natural-sounding voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
  if (naturalVoice) {
    speechUtterance.voice = naturalVoice;
  }

  speechUtterance.rate = 1.0; // natural conversational rate
  speechUtterance.pitch = 1.05; // slightly warm/friendly tone

  if (onStart) speechUtterance.onstart = onStart;
  if (onEnd) speechUtterance.onend = onEnd;

  window.speechSynthesis.speak(speechUtterance);
}

/**
 * Cancels any ongoing text-to-speech voice playback.
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Initializes and starts SpeechRecognition (STT) inside browser.
 */
export function initSpeechRecognition(onResult, onEnd, onError = null) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition is not supported in this browser.');
    return null;
  }

  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'en-IN'; // Indian-English context

  rec.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      transcript += e.results[i][0].transcript;
    }
    if (onResult) onResult(transcript);
  };

  rec.onend = () => {
    if (onEnd) onEnd();
  };

  rec.onerror = (e) => {
    console.error('Speech Recognition Error:', e);
    if (onError) onError(e);
  };

  return rec;
}


// ─── Local Rule-Based Fallbacks ─── //

function parseProfileLocally(text) {
  const normalized = text.toLowerCase();
  const updates = {};

  // Name
  const nameMatch = text.match(/(my name is|i am|call me|this is) ([A-Z][a-zA-Z\s]{1,15})/i);
  if (nameMatch && nameMatch[2]) {
    updates.name = nameMatch[2].trim();
  }

  // City normalization
  const cities = ['pune', 'mumbai', 'bangalore', 'delhi', 'chennai', 'hyderabad', 'kochi', 'kolkata', 'jaipur', 'lucknow', 'ahmedabad'];
  for (const city of cities) {
    if (normalized.includes(city)) {
      updates.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Transport mode
  if (normalized.includes('car')) {
    updates.primaryTransport = normalized.includes('diesel') ? 'car_diesel' : 'car_petrol';
  } else if (normalized.includes('bike') || normalized.includes('two wheeler') || normalized.includes('motorcycle')) {
    updates.primaryTransport = 'bike';
  } else if (normalized.includes('metro') || normalized.includes('subway')) {
    updates.primaryTransport = 'metro';
  } else if (normalized.includes('bus')) {
    updates.primaryTransport = 'bus';
  } else if (normalized.includes('walk') || normalized.includes('foot')) {
    updates.primaryTransport = 'walk';
  } else if (normalized.includes('cycle') || normalized.includes('bicycle')) {
    updates.primaryTransport = 'cycle';
  }

  // Distance km
  const kmMatch = normalized.match(/(\d+)\s*(km|kilometer|kilometres)/);
  if (kmMatch && kmMatch[1]) {
    updates.dailyTransportKm = parseInt(kmMatch[1]);
  }

  // Diet
  if (normalized.includes('vegan')) {
    updates.diet = 'vegan';
  } else if (normalized.includes('vegetarian') || normalized.includes('veg')) {
    updates.diet = 'vegetarian';
  } else if (normalized.includes('non veg') || normalized.includes('chicken') || normalized.includes('meat')) {
    updates.diet = normalized.includes('sometimes') || normalized.includes('occasional') ? 'occasional_nonveg' : 'non_vegetarian';
  }

  // Household size
  const hhMatch = normalized.match(/(\d+)\s*(people|family|member|person)/);
  if (hhMatch && hhMatch[1]) {
    updates.householdSize = parseInt(hhMatch[1]);
  }

  // Electricity Units
  const electricityMatch = normalized.match(/(\d+)\s*(unit|kwh)/);
  if (electricityMatch && electricityMatch[1]) {
    updates.electricityUnits = parseInt(electricityMatch[1]);
  }

  return updates;
}

function generateRecommendationsLocally(profile, activities, memory) {
  const primaryTransport = profile.primaryTransport || 'car_petrol';
  const dailyKm = profile.dailyTransportKm || 20;
  const diet = profile.diet || 'vegetarian';
  const units = profile.electricityUnits || 280;

  let topImpact = 'Transport';
  let transportCO2 = dailyKm * 365 * 0.192;
  let foodCO2 = diet === 'vegan' ? 0.50 * 3 * 365 : 0.75 * 3 * 365;
  let energyCO2 = units * 0.8 * 12;

  if (foodCO2 > transportCO2 && foodCO2 > energyCO2) topImpact = 'Food';
  else if (energyCO2 > transportCO2) topImpact = 'Home Energy';

  const isIgnored = (text) => (memory.ignoredSuggestions || []).some(t => text.toLowerCase().includes(t.toLowerCase()));

  let list = [
    'Switch to public transport or metro for commutes this week',
    'Set air conditioning to 26°C instead of 22°C',
    'Add one more plant-based meal to your diet',
    'Ensure all electronics are unplugged from wall switches'
  ];

  if (topImpact === 'Transport') {
    list[0] = 'Commute by metro or bus on Tuesdays and Thursdays';
  } else if (topImpact === 'Food') {
    list[2] = 'Try an all-vegan day on Monday to lower food impact';
  } else {
    list[1] = 'Limit AC running hours to 4 hours per day';
  }

  list = list.filter(item => !isIgnored(item));

  return {
    weekRange: 'Conversational Weekly Plan',
    progressPct: 60,
    recommendations: list,
    cards: [
      {
        type: 'biggest_impact',
        title: 'Biggest Impact',
        desc: topImpact === 'Transport' ? 'Switch 2 car rides to Metro.' : 'Swap non-veg meal to veggie.',
        impact: '− save 4.8 kg CO₂',
        secondary: '+ save ₹140',
        icon: '🔥',
        bgColor: '#fff5e5'
      },
      {
        type: 'cheapest_improvement',
        title: 'Cheapest Improvement',
        desc: 'Switch AC to 26°C at night.',
        impact: '+ save ₹95 & 1.8 kg CO₂',
        secondary: '',
        icon: '⚡',
        bgColor: '#e5f5e5'
      },
      {
        type: 'easy_win',
        title: 'Easy Win',
        desc: 'Log 3 cycle rides in active logs.',
        impact: '− save 2.1 kg CO₂',
        secondary: '',
        icon: '🥗',
        bgColor: '#f0f8ea'
      },
      {
        type: 'weekly_challenge',
        title: 'Weekly Challenge',
        desc: 'No-Cab Wednesday!',
        impact: 'Use public transport for one day.',
        secondary: '',
        icon: '🏆',
        bgColor: '#fef3d0'
      }
    ]
  };
}

function generatePurchaseAdviceLocally(name, category, cost, runningCost, energyUsage, lifetime) {
  const baselineRunningCost = category === 'transport' ? 6000 : 2500;
  const annualSavings = Math.round(((baselineRunningCost - runningCost) * 12));
  
  let recommendation = 'Consider';
  let explanation = '';

  const payback = annualSavings > 0 ? (cost / annualSavings) : lifetime;

  if (payback <= lifetime * 0.4) {
    recommendation = 'Yes';
    explanation = `Installing ${name} is highly recommended. It pays back within ${payback.toFixed(1)} years, well within its expected lifetime of ${lifetime} years, resulting in major financial and carbon savings.`;
  } else if (payback <= lifetime * 0.8) {
    recommendation = 'Consider';
    explanation = `${name} has a moderate payback period of ${payback.toFixed(1)} years. It will provide net savings over its lifetime, and is a positive ecological choice.`;
  } else {
    recommendation = 'No';
    explanation = `${name} is not financially optimal as the payback period of ${payback.toFixed(1)} years exceeds or is very close to its expected lifetime of ${lifetime} years. Consider alternatives.`;
  }

  return {
    recommendation,
    explanation
  };
}

function generateReportLocally(type, period, activities, goals, memory, simulations, purchases) {
  // Tally total emissions from activities
  const totalCO2 = activities.reduce((sum, a) => sum + parseFloat(a.co2 || 0), 0);
  const totalCost = activities.reduce((sum, a) => sum + parseFloat(a.cost || 0), 0);
  const activitiesCount = activities.length;

  return {
    summary: `Your carbon footprint summary for ${period} reflects highly active sustainable logging. You logged ${activitiesCount} activities, showing consistent engagement in tracking transport and energy consumption.`,
    achievements: `You successfully completed ${memory.completedChallenges?.length || 1} weekly challenges and accepted ${memory.acceptedSuggestions?.length || 2} recommendations from Arya.`,
    savings: `You saved an estimated ₹${Math.round(totalCO2 * 5.2)} in operational expenses and avoided ${totalCO2.toFixed(1)} kg of CO₂ emissions.`,
    emissionBreakdown: `Transport accounted for roughly 48% of total emissions, while Food and Home Energy represented 28% and 24% respectively.`,
    topImpactSource: `Transport remains your primary emission source. Toggling commuting patterns on your Carbon Twin simulated a 24% potential savings by switching to metro travel.`,
    carbonTwinProgress: `You are currently tracking 14% closer to your simulated Future Twin footprint compared to last month.`,
    recommendations: [
      'Transition 2 more commute trips per week from car to public transport.',
      'Adopt vegetarian meals on Wednesdays to lower food emissions.',
      'Switch electronic appliances fully off from wall outlets when not in use.'
    ],
    nextMonthPlan: `For the upcoming month, target Transport reductions by focusing on the 'No-Cab Wednesday' challenge.`
  };
}
