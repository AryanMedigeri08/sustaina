// ═══════════════════════════════════════════
// SUSTAINA — Voice Onboarding Flow
// Conversational setup using Web Speech APIs and Gemini Flash Extraction
// ═══════════════════════════════════════════

import { setOnboardingComplete, logTimelineEvent, getState } from '../state/store.js';
import { icons } from '../components/icons.js';
import sustainaLogo from '../assets/sustaina_logo.png';
import { navigate } from '../router.js';
import { calcAnnualEmissions, calcTreesEquivalent, calcMoneySaved } from '../data/emissions.js';
import { 
  initSpeechRecognition, 
  speakText, 
  stopSpeaking, 
  extractProfileFromVoice 
} from '../services/gemini.js';

// ─── Step Definitions ─── //
const STEPS = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'conversation', label: 'Voice Onboarding' },
  { key: 'review', label: 'Review & Complete' },
  { key: 'goals', label: 'Your Goals' },
  { key: 'complete', label: "You're all set!" },
];

const GOAL_OPTIONS = [
  { icon: 'globe', text: 'Reduce my carbon footprint', value: 'reduce_footprint' },
  { icon: 'money', text: 'Save money on monthly bills', value: 'save_money' },
  { icon: 'transport', text: 'Use public transport more', value: 'public_transport' },
  { icon: 'food', text: 'Eat more sustainably', value: 'eat_sustainable' },
  { icon: 'waste', text: 'Reduce waste', value: 'reduce_waste' },
  { icon: 'leaf', text: 'Live a more minimal lifestyle', value: 'minimal_lifestyle' },
  { icon: 'energy', text: 'Switch to clean energy', value: 'clean_energy' },
  { icon: 'tree', text: 'Plant more trees', value: 'plant_trees' },
];

let currentStep = 0;
let onboardingData = {
  name: '',
  city: '',
  householdSize: 4,
  homeType: 'Apartment',
  primaryTransport: 'bike',
  diet: 'vegetarian',
  workType: 'Office',
  electricitySource: 'MSEDCL (State Grid)',
  electricityUnits: 280,
  lpgCylinders: 1,
  dailyTransportKm: 18,
  goals: [],
};

// Conversational engine state
let activeRecognition = null;
let isAryaSpeaking = false;
let isListening = false;
let conversationHistory = [];
let pendingExtraction = false;

// ─── Render Onboarding ─── //
export function renderOnboarding(container) {
  // Hide sidebar/topbar for onboarding
  const sidebarEl = document.getElementById('sidebar-container');
  const topbarEl = document.getElementById('topbar-container');
  const mainContent = document.getElementById('main-content');
  const pageContent = document.getElementById('page-content');
  
  if (sidebarEl) sidebarEl.style.display = 'none';
  if (topbarEl) topbarEl.style.display = 'none';
  if (mainContent) mainContent.style.marginLeft = '0';
  if (pageContent) { pageContent.style.padding = '0'; pageContent.style.maxWidth = 'none'; }

  const step = STEPS[currentStep];

  switch (step.key) {
    case 'welcome': renderWelcome(container); break;
    case 'conversation': renderConversation(container); break;
    case 'review': renderReview(container); break;
    case 'goals': renderGoalsSelection(container); break;
    case 'complete': renderComplete(container); break;
  }
}

function restoreLayout() {
  const sidebarEl = document.getElementById('sidebar-container');
  const topbarEl = document.getElementById('topbar-container');
  const mainContent = document.getElementById('main-content');
  const pageContent = document.getElementById('page-content');
  
  if (sidebarEl) sidebarEl.style.display = '';
  if (topbarEl) topbarEl.style.display = '';
  if (mainContent) mainContent.style.marginLeft = '';
  if (pageContent) { pageContent.style.padding = ''; pageContent.style.maxWidth = ''; }
}

function getStepInfo() {
  return `
    <div class="onboarding-step-info">
      <span class="onboarding-step-label">Step ${currentStep + 1} of ${STEPS.length}</span>
      <button class="onboarding-end-session" id="end-session">End Session</button>
    </div>
  `;
}

function getProgressBar() {
  return `
    <div class="onboarding-progress" style="max-width: 500px; margin: 0 auto var(--space-6);">
      ${STEPS.map((_, i) => `
        <div class="onboarding-progress-step ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}"></div>
        ${i < STEPS.length - 1 ? `<div class="onboarding-progress-line ${i < currentStep ? 'completed' : ''}"></div>` : ''}
      `).join('')}
    </div>
  `;
}

function setupEndSession() {
  document.getElementById('end-session')?.addEventListener('click', () => {
    stopSpeaking();
    if (activeRecognition) {
      activeRecognition.stop();
    }
    currentStep = 0;
    restoreLayout();
    navigate('home');
  });
}

// ─── Step 1: Welcome ─── //
function renderWelcome(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div style="margin-bottom: var(--space-6); text-align: center; display: flex; justify-content: center; width: 100%;">
          <img src="${sustainaLogo}" alt="Sustaina Logo" style="max-height: 48px; object-fit: contain; width: auto; max-width: 100%; display: block;" />
        </div>
        <div style="opacity: 0.3; pointer-events: none; display: flex; flex-direction: column; gap: var(--space-2);">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4); display: flex; gap: var(--space-2); align-items: center;">${icons.home} <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4); display: flex; gap: var(--space-2); align-items: center;">${icons.activity} <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4); display: flex; gap: var(--space-2); align-items: center;">${icons.coach} <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4); display: flex; gap: var(--space-2); align-items: center;">${icons.insights} <span>Insights</span></div>
        </div>
      </div>

      <div class="onboarding-main">
        <div class="onboarding-content">
          <h2 style="font-size: var(--text-3xl); margin-bottom: var(--space-2);">Welcome to Sustaina</h2>
          <p class="text-secondary mb-8">Set up your profile conversationally with Arya, your AI voice companion.</p>

          <div class="pulse-ring">
            <div class="pulse-inner" style="display: flex; align-items: center; justify-content: center;">
              <span style="display: flex; align-items: center; justify-content: center; color: var(--green-600); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));">
                ${icons.leaf.replace('width="20" height="20"', 'width="40" height="40"')}
              </span>
            </div>
          </div>

          <div style="max-width: 400px; margin: 0 auto; text-align: left;" class="card mb-8">
            <h4 style="margin-bottom: var(--space-3); font-weight: 700;">How it works:</h4>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); font-size: var(--text-sm);">
              <div style="display: flex; gap: var(--space-2); align-items: center;"><span style="color: var(--green-600); display: flex;">${icons.mic.replace('width="28" height="28"', 'width="16" height="16"')}</span> <span>Speak naturally in English to Arya.</span></div>
              <div style="display: flex; gap: var(--space-2); align-items: center;"><span style="color: var(--accent-amber); display: flex;">${icons.energy.replace('width="20" height="20"', 'width="16" height="16"')}</span> <span>Gemini extracts details (Name, City, Diet, etc.) automatically.</span></div>
              <div style="display: flex; gap: var(--space-2); align-items: center;"><span style="color: var(--green-600); display: flex;">${icons.edit.replace('width="16" height="16"', 'width="16" height="16"')}</span> <span>You can edit or type anything at the end.</span></div>
            </div>
          </div>

          <button class="btn btn-primary btn-xl" id="start-onboarding" style="max-width: 400px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: var(--space-2);">
            ${icons.mic.replace('width="28" height="28"', 'width="20" height="20"')} Start Voice Onboarding
          </button>
          
          <div class="text-center mt-4">
            <button class="btn btn-ghost" id="skip-onboarding-btn" style="border: none; background: transparent; font-size: var(--text-xs); text-decoration: underline;">
              Skip voice and prefill profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('start-onboarding').addEventListener('click', () => {
    currentStep = 1;
    renderOnboarding(container);
  });

  document.getElementById('skip-onboarding-btn').addEventListener('click', () => {
    onboardingData = {
      name: 'Aryan Medigeri',
      city: 'Pune',
      householdSize: 4,
      homeType: 'Apartment',
      primaryTransport: 'bike',
      diet: 'vegetarian',
      workType: 'Office',
      electricitySource: 'MSEDCL (State Grid)',
      electricityUnits: 280,
      lpgCylinders: 1,
      dailyTransportKm: 18,
      goals: ['reduce_footprint', 'save_money'],
    };
    currentStep = 2; // Jump straight to Review
    renderOnboarding(container);
  });
}

// ─── Step 2: Conversational Voice Chat ─── //
function renderConversation(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div style="margin-bottom: var(--space-6); text-align: center; display: flex; justify-content: center; width: 100%;">
          <img src="${sustainaLogo}" alt="Sustaina Logo" style="max-height: 48px; object-fit: contain; width: auto; max-width: 100%; display: block;" />
        </div>
        
        <!-- Checklist panel -->
        <div class="card" style="padding: var(--space-4); background: var(--neutral-50);">
          <h4 style="font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--space-4); color: var(--green-800);">Profile Extraction status</h4>
          <div class="extraction-list" id="extraction-status" style="margin: 0;">
            <div class="extraction-item" id="ext-name">
              <div class="extraction-check">${onboardingData.name ? '✓' : ''}</div>
              <span>Name: <strong id="val-name">${onboardingData.name || '⏳'}</strong></span>
            </div>
            <div class="extraction-item" id="ext-city">
              <div class="extraction-check">${onboardingData.city ? '✓' : ''}</div>
              <span>City: <strong id="val-city">${onboardingData.city || '⏳'}</strong></span>
            </div>
            <div class="extraction-item" id="ext-transport">
              <div class="extraction-check">${onboardingData.primaryTransport && onboardingData.dailyTransportKm ? '✓' : ''}</div>
              <span>Transport: <strong id="val-transport">${onboardingData.primaryTransport ? `${onboardingData.primaryTransport} (${onboardingData.dailyTransportKm}km)` : '⏳'}</strong></span>
            </div>
            <div class="extraction-item" id="ext-diet">
              <div class="extraction-check">${onboardingData.diet ? '✓' : ''}</div>
              <span>Diet: <strong id="val-diet">${onboardingData.diet || '⏳'}</strong></span>
            </div>
            <div class="extraction-item" id="ext-household">
              <div class="extraction-check">${onboardingData.householdSize && onboardingData.electricityUnits ? '✓' : ''}</div>
              <span>Household: <strong id="val-household">${onboardingData.electricityUnits ? `${onboardingData.householdSize} people (${onboardingData.electricityUnits} units)` : '⏳'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}

        <div class="onboarding-content" style="max-width: 600px; padding: 0 var(--space-4);">
          <!-- Speech Bubble -->
          <div class="arya-bubble mb-6" style="margin-top: 0;">
            <div class="arya-avatar">🌱</div>
            <div class="arya-message" id="arya-speech-text">Preparing session...</div>
          </div>

          <!-- Waveform Animation -->
          <div class="waveform" id="onboarding-waveform" style="opacity: 0.2;">
            ${Array.from({ length: 14 }, () => '<div class="waveform-bar"></div>').join('')}
          </div>

          <!-- Live Transcript Box -->
          <div class="transcript-box" style="margin-bottom: var(--space-6);">
            <div style="flex: 1;">
              <div class="transcript-label" id="transcript-header">Press mic and start speaking...</div>
              <input type="text" class="transcript-text" id="voice-input-box" 
                     placeholder="Type your response here if microphone is off..." 
                     style="border: none; background: transparent; padding: var(--space-2) 0; width: 100%;" />
            </div>
            <button id="send-text-btn" class="btn btn-ghost btn-icon" style="opacity: 0.7;">
              ${icons.arrow_right || '➔'}
            </button>
          </div>

          <!-- Mic button -->
          <div style="text-align: center;">
            <div class="speak-btn" id="voice-mic-btn" title="Start listening">
              ${icons.mic}
            </div>
            <div class="speak-btn-label" id="mic-status-text">Tap to Speak</div>
          </div>

          <div style="text-align: center; margin-top: var(--space-6);">
            <button class="btn btn-secondary" id="direct-to-review-btn">
              Skip to Review ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupEndSession();
  updateVisualChecklist();

  // Attach event handlers
  const voiceInput = document.getElementById('voice-input-box');
  const sendBtn = document.getElementById('send-text-btn');
  const micBtn = document.getElementById('voice-mic-btn');
  const skipBtn = document.getElementById('direct-to-review-btn');

  // Trigger conversational flow start after a brief moment
  setTimeout(() => {
    runConversationStep(container);
  }, 500);

  // Keyboard Submission
  voiceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && voiceInput.value.trim()) {
      handleUserSpeechSubmit(container, voiceInput.value.trim());
      voiceInput.value = '';
    }
  });

  sendBtn.addEventListener('click', () => {
    if (voiceInput.value.trim()) {
      handleUserSpeechSubmit(container, voiceInput.value.trim());
      voiceInput.value = '';
    }
  });

  // Direct skip to review
  skipBtn.addEventListener('click', () => {
    stopSpeaking();
    if (activeRecognition) activeRecognition.stop();
    currentStep = 2; // review
    renderOnboarding(container);
  });

  // Mic Button Toggle
  micBtn.addEventListener('click', () => {
    if (isAryaSpeaking) {
      // If Arya is speaking, stop it
      stopSpeaking();
      isAryaSpeaking = false;
      document.getElementById('onboarding-waveform').style.opacity = '0.2';
    }

    if (isListening) {
      stopListening();
    } else {
      startListening(container);
    }
  });
}

function updateVisualChecklist() {
  const check = (val) => val ? '✓' : '';
  const itemClass = (val) => val ? 'extraction-item done' : 'extraction-item';

  const updateItem = (id, hasVal, valText) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = itemClass(hasVal);
    el.querySelector('.extraction-check').textContent = check(hasVal);
    el.querySelector('strong').textContent = valText || '⏳';
  };

  updateItem('ext-name', onboardingData.name, onboardingData.name);
  updateItem('ext-city', onboardingData.city, onboardingData.city);
  updateItem('ext-transport', onboardingData.primaryTransport && onboardingData.dailyTransportKm, 
    onboardingData.primaryTransport ? `${onboardingData.primaryTransport} (${onboardingData.dailyTransportKm}km)` : '');
  updateItem('ext-diet', onboardingData.diet, onboardingData.diet);
  updateItem('ext-household', onboardingData.householdSize && onboardingData.electricityUnits,
    onboardingData.electricityUnits ? `${onboardingData.householdSize} people (${onboardingData.electricityUnits} units)` : '');
}

/**
 * Dialog State Machine. Chooses next question and speaks it.
 */
function runConversationStep(container) {
  let question = '';
  
  if (!onboardingData.name || !onboardingData.city) {
    question = "Hello! I am Arya. Let's get to know you. What is your name, and which city do you live in?";
  } else if (!onboardingData.primaryTransport || !onboardingData.dailyTransportKm) {
    question = `Nice to meet you, ${onboardingData.name.split(' ')[0]}! Next, how do you usually travel to work or college, and what is your daily commute distance in kilometers?`;
  } else if (!onboardingData.diet) {
    question = "Got it! How would you describe your daily diet? Are you vegetarian, vegan, or non-vegetarian?";
  } else if (!onboardingData.householdSize || !onboardingData.electricityUnits) {
    question = "Understood. Finally, how many people live in your household, and what is your average monthly electricity usage in units?";
  } else {
    // Everything extracted!
    question = "Perfect! I have extracted all your details. Let's review them together now.";
    speakText(question, 
      () => {
        isAryaSpeaking = true;
        document.getElementById('arya-speech-text').textContent = question;
        document.getElementById('onboarding-waveform').style.opacity = '1';
      }, 
      () => {
        isAryaSpeaking = false;
        document.getElementById('onboarding-waveform').style.opacity = '0.2';
        currentStep = 2; // Move to Review
        renderOnboarding(container);
      }
    );
    return;
  }

  // Speak the question
  speakText(question, 
    () => {
      isAryaSpeaking = true;
      document.getElementById('arya-speech-text').textContent = question;
      document.getElementById('onboarding-waveform').style.opacity = '1';
    },
    () => {
      isAryaSpeaking = false;
      document.getElementById('onboarding-waveform').style.opacity = '0.2';
      // Auto-start recording after question ends
      startListening(container);
    }
  );
}

function startListening(container) {
  if (isListening) return;

  const statusLabel = document.getElementById('transcript-header');
  const statusText = document.getElementById('mic-status-text');
  const micBtn = document.getElementById('voice-mic-btn');

  activeRecognition = initSpeechRecognition(
    (text) => {
      // Live transcript updating
      document.getElementById('voice-input-box').value = text;
      statusLabel.textContent = "Listening...";
    },
    () => {
      isListening = false;
      micBtn.classList.remove('recording');
      statusText.textContent = "Tap to Speak";
      statusLabel.textContent = "Processing speech...";
      
      const transcript = document.getElementById('voice-input-box').value.trim();
      if (transcript) {
        handleUserSpeechSubmit(container, transcript);
      }
    },
    (err) => {
      stopListening();
      statusLabel.textContent = "Microphone error, please type your response.";
    }
  );

  if (activeRecognition) {
    try {
      activeRecognition.start();
      isListening = true;
      micBtn.classList.add('recording');
      statusText.textContent = "Listening...";
      statusLabel.textContent = "Speak now...";
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  }
}

function stopListening() {
  if (activeRecognition) {
    activeRecognition.stop();
  }
  isListening = false;
  const micBtn = document.getElementById('voice-mic-btn');
  const statusText = document.getElementById('mic-status-text');
  if (micBtn) micBtn.classList.remove('recording');
  if (statusText) statusText.textContent = "Tap to Speak";
}

async function handleUserSpeechSubmit(container, text) {
  if (!text.trim() || pendingExtraction) return;

  pendingExtraction = true;
  const statusLabel = document.getElementById('transcript-header');
  statusLabel.innerHTML = '<span>⚡</span> Gemini extracting details...';
  
  // Call backend extraction proxy
  const updates = await extractProfileFromVoice(text, onboardingData);
  
  // Apply updates
  if (updates) {
    for (const [key, val] of Object.entries(updates)) {
      if (val !== null && val !== undefined) {
        onboardingData[key] = val;
      }
    }
  }

  pendingExtraction = false;
  updateVisualChecklist();

  // Reset transcript display
  document.getElementById('voice-input-box').value = '';
  statusLabel.textContent = "Details extracted! Continuing...";

  // Call next conversational dialog step after a brief delay
  setTimeout(() => {
    runConversationStep(container);
  }, 1000);
}

// ─── Step 3: Review Table ─── //
function renderReview(container) {
  const data = onboardingData;

  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div style="margin-bottom: var(--space-6); text-align: center; display: flex; justify-content: center; width: 100%;">
          <img src="${sustainaLogo}" alt="Sustaina Logo" style="max-height: 48px; object-fit: contain; width: auto; max-width: 100%; display: block;" />
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">Let's review what I've understood</h2>
          <p class="text-secondary mb-6">You can edit any value directly if needed.</p>

          <div class="review-table">
            <div class="review-row">
              <span class="review-label">Name</span>
              <input type="text" id="rev-input-name" class="review-value-input" value="${data.name || 'Aryan Medigeri'}" style="text-align: right; border: none; background: transparent; width: 180px; font-weight: 600;" />
            </div>
            <div class="review-row">
              <span class="review-label">City</span>
              <input type="text" id="rev-input-city" class="review-value-input" value="${data.city || 'Pune'}" style="text-align: right; border: none; background: transparent; width: 180px; font-weight: 600;" />
            </div>
            <div class="review-row">
              <span class="review-label">Household Size</span>
              <input type="number" id="rev-input-house" class="review-value-input" value="${data.householdSize || 4}" style="text-align: right; border: none; background: transparent; width: 80px; font-weight: 600;" />
            </div>
            <div class="review-row">
              <span class="review-label">Transport Mode</span>
              <select id="rev-input-trans" style="border: none; background: transparent; width: auto; font-weight: 600; text-align: right; direction: rtl;">
                <option value="bike" ${data.primaryTransport === 'bike' ? 'selected' : ''}>Bike (Two-wheeler)</option>
                <option value="car_petrol" ${data.primaryTransport === 'car_petrol' ? 'selected' : ''}>Car (Petrol)</option>
                <option value="car_diesel" ${data.primaryTransport === 'car_diesel' ? 'selected' : ''}>Car (Diesel)</option>
                <option value="bus" ${data.primaryTransport === 'bus' ? 'selected' : ''}>Public Bus</option>
                <option value="metro" ${data.primaryTransport === 'metro' ? 'selected' : ''}>Metro</option>
                <option value="walk" ${data.primaryTransport === 'walk' ? 'selected' : ''}>Walk</option>
              </select>
            </div>
            <div class="review-row">
              <span class="review-label">Daily Commute (km)</span>
              <input type="number" id="rev-input-km" class="review-value-input" value="${data.dailyTransportKm || 15}" style="text-align: right; border: none; background: transparent; width: 80px; font-weight: 600;" />
            </div>
            <div class="review-row">
              <span class="review-label">Diet</span>
              <select id="rev-input-diet" style="border: none; background: transparent; width: auto; font-weight: 600; text-align: right; direction: rtl;">
                <option value="vegetarian" ${data.diet === 'vegetarian' ? 'selected' : ''}>Vegetarian</option>
                <option value="vegan" ${data.diet === 'vegan' ? 'selected' : ''}>Vegan</option>
                <option value="occasional_nonveg" ${data.diet === 'occasional_nonveg' ? 'selected' : ''}>Occasional Non-Veg</option>
                <option value="non_vegetarian" ${data.diet === 'non_vegetarian' ? 'selected' : ''}>Non-Vegetarian</option>
              </select>
            </div>
            <div class="review-row">
              <span class="review-label">Electricity (units/mo)</span>
              <input type="number" id="rev-input-elec" class="review-value-input" value="${data.electricityUnits || 280}" style="text-align: right; border: none; background: transparent; width: 80px; font-weight: 600;" />
            </div>
          </div>

          <div class="flex items-center justify-center gap-4 mt-8">
            <button class="btn btn-ghost btn-lg" id="review-back">Restart Onboarding</button>
            <button class="btn btn-success btn-lg" id="review-confirm">Looks Good</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupEndSession();

  document.getElementById('review-back')?.addEventListener('click', () => {
    currentStep = 1; // back to chat
    renderOnboarding(container);
  });

  document.getElementById('review-confirm')?.addEventListener('click', () => {
    // Save table input values back to onboardingData
    onboardingData.name = document.getElementById('rev-input-name').value;
    onboardingData.city = document.getElementById('rev-input-city').value;
    onboardingData.householdSize = parseInt(document.getElementById('rev-input-house').value) || 4;
    onboardingData.primaryTransport = document.getElementById('rev-input-trans').value;
    onboardingData.dailyTransportKm = parseInt(document.getElementById('rev-input-km').value) || 15;
    onboardingData.diet = document.getElementById('rev-input-diet').value;
    onboardingData.electricityUnits = parseInt(document.getElementById('rev-input-elec').value) || 200;

    currentStep = 3; // goals
    renderOnboarding(container);
  });
}

// ─── Step 4: Goals Selection ─── //
function renderGoalsSelection(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div style="margin-bottom: var(--space-6); text-align: center; display: flex; justify-content: center; width: 100%;">
          <img src="${sustainaLogo}" alt="Sustaina Logo" style="max-height: 48px; object-fit: contain; width: auto; max-width: 100%; display: block;" />
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">What are your sustainability goals?</h2>
          <p class="text-secondary mb-6">Select all that apply.</p>

          <div class="goals-grid">
            ${GOAL_OPTIONS.map(goal => `
              <div class="goal-option ${onboardingData.goals.includes(goal.value) ? 'selected' : ''}" data-value="${goal.value}">
                <div class="goal-option-icon" style="color: var(--green-700); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">${icons[goal.icon]}</div>
                <span class="goal-option-text">${goal.text}</span>
              </div>
            `).join('')}
          </div>

          <div class="flex items-center justify-center gap-4 mt-8">
            <button class="btn btn-ghost btn-lg" id="goals-back">Back</button>
            <button class="btn btn-primary btn-lg" id="goals-continue">Continue</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupEndSession();

  container.querySelectorAll('.goal-option').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      const value = item.dataset.value;
      if (onboardingData.goals.includes(value)) {
        onboardingData.goals = onboardingData.goals.filter(g => g !== value);
      } else {
        onboardingData.goals.push(value);
      }
    });
  });

  document.getElementById('goals-back')?.addEventListener('click', () => {
    currentStep = 2; // review
    renderOnboarding(container);
  });

  document.getElementById('goals-continue')?.addEventListener('click', () => {
    currentStep = 4; // complete
    renderOnboarding(container);
  });
}

// ─── Step 5: Complete ─── //
function renderComplete(container) {
  const data = onboardingData;
  const profileForCalc = {
    primaryTransport: data.primaryTransport,
    dailyTransportKm: data.dailyTransportKm,
    diet: data.diet,
    electricityUnits: data.electricityUnits,
    lpgCylinders: data.lpgCylinders,
    city: data.city || 'Pune'
  };
  const annual = calcAnnualEmissions(profileForCalc);
  const annualTonnes = (annual.total / 1000).toFixed(2);
  const moneySaved = calcMoneySaved(Math.round(annual.total * 0.2));
  const trees = calcTreesEquivalent(Math.round(annual.total * 0.2));

  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div style="margin-bottom: var(--space-6); text-align: center; display: flex; justify-content: center; width: 100%;">
          <img src="${sustainaLogo}" alt="Sustaina Logo" style="max-height: 48px; object-fit: contain; width: auto; max-width: 100%; display: block;" />
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        <div class="onboarding-content" style="max-width: 500px;">
          <div class="completion-check">
            ${icons.check}
          </div>

          <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">You're all set! 🎉</h2>
          <p class="text-secondary mb-8">Your sustainability profile is ready.</p>

          <div class="completion-stats">
            <div class="completion-stat">
              <div class="completion-stat-value">${annualTonnes}</div>
              <div class="completion-stat-label">Estimated Carbon Footprint<br />tonnes CO₂e / year</div>
            </div>
            <div class="completion-stat">
              <div class="completion-stat-value">₹${moneySaved.toLocaleString('en-IN')}</div>
              <div class="completion-stat-label">Potential Savings<br />per year</div>
            </div>
            <div class="completion-stat">
              <div class="completion-stat-value">${trees}</div>
              <div class="completion-stat-label">Trees You Can Help Save<br />trees per year</div>
            </div>
          </div>

          <button class="btn btn-primary btn-xl mt-8" id="go-to-dashboard">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('go-to-dashboard')?.addEventListener('click', () => {
    setOnboardingComplete({
      name: data.name || 'Aryan Medigeri',
      city: data.city || 'Pune',
      state: 'Maharashtra',
      householdSize: data.householdSize,
      homeType: data.homeType,
      primaryTransport: data.primaryTransport,
      diet: data.diet,
      dailyTransportKm: data.dailyTransportKm,
      electricityUnits: data.electricityUnits,
      lpgCylinders: data.lpgCylinders,
      sustainabilityGoals: data.goals,
      memberSince: new Date().toISOString(),
    });

    logTimelineEvent({
      type: 'onboarding_completed',
      title: 'Profile Created',
      description: 'Successfully completed the conversational voice onboarding setup.',
      icon: '🚀'
    });

    currentStep = 0;
    restoreLayout();

    const stateObj = getState();
    if (!stateObj.sessionUser) {
      if (confirm('Onboarding complete! Would you like to create an account to back up your data to the cloud and enable syncing?')) {
        navigate('auth');
      } else {
        navigate('home');
        window.location.reload();
      }
    } else {
      navigate('home');
      window.location.reload();
    }
  });
}
