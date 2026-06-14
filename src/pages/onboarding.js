// ═══════════════════════════════════════════
// SUSTAINA — Voice Onboarding Flow
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
  extractProfileFromVoice,
  getNextOnboardingQuestion
} from '../services/gemini.js';

// Constants and Utils
import { 
  ONBOARDING_STEPS, 
  GOAL_OPTIONS, 
  INITIAL_ONBOARDING_DATA, 
  ARYA_STATUS_MESSAGES 
} from '../constants/onboarding.js';
import { formatCurrency, formatCarbon } from '../utils/formatters.js';

// State
let currentStep = 0;
let onboardingData = { ...INITIAL_ONBOARDING_DATA };

// Conversational engine state
let activeRecognition = null;
let isAryaSpeaking = false;
let isListening = false;
let conversationHistory = [];
let pendingExtraction = false;
let pendingQuestion = false;

/**
 * Main entry point for rendering the onboarding flow.
 * @param {HTMLElement} container 
 */
export function renderOnboarding(container) {
  toggleAppShell(false);

  const step = ONBOARDING_STEPS[currentStep];
  switch (step.key) {
    case 'welcome': renderWelcome(container); break;
    case 'conversation': renderConversation(container); break;
    case 'review': renderReview(container); break;
    case 'goals': renderGoalsSelection(container); break;
    case 'complete': renderComplete(container); break;
  }
}

/**
 * Toggles the visibility of the main app shell components.
 * @param {boolean} show 
 */
function toggleAppShell(show) {
  const sidebarEl = document.getElementById('sidebar-container');
  const topbarEl = document.getElementById('topbar-container');
  const mainContent = document.getElementById('main-content');
  const pageContent = document.getElementById('page-content');
  
  const display = show ? '' : 'none';
  const marginLeft = show ? '' : '0';
  const padding = show ? '' : '0';
  const maxWidth = show ? '' : 'none';

  if (sidebarEl) sidebarEl.style.display = display;
  if (topbarEl) topbarEl.style.display = display;
  if (mainContent) mainContent.style.marginLeft = marginLeft;
  if (pageContent) { 
    pageContent.style.padding = padding; 
    pageContent.style.maxWidth = maxWidth; 
  }
}

function getStepInfo() {
  return `
    <div class="onboarding-step-info">
      <span class="onboarding-step-label">Step ${currentStep + 1} of ${ONBOARDING_STEPS.length}</span>
      <button class="onboarding-end-session" id="end-session">End Session</button>
    </div>
  `;
}

function getProgressBar() {
  return `
    <div class="onboarding-progress" style="max-width: 500px; margin: 0 auto var(--space-6);">
      ${ONBOARDING_STEPS.map((_, i) => `
        <div class="onboarding-progress-step ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}"></div>
        ${i < ONBOARDING_STEPS.length - 1 ? `<div class="onboarding-progress-line ${i < currentStep ? 'completed' : ''}"></div>` : ''}
      `).join('')}
    </div>
  `;
}

function setupEndSession() {
  document.getElementById('end-session')?.addEventListener('click', () => {
    stopSpeaking();
    if (activeRecognition) activeRecognition.stop();
    currentStep = 0;
    toggleAppShell(true);
    navigate('home');
  });
}

/**
 * Shared sidebar layout for onboarding steps.
 */
function getOnboardingSidebarHTML() {
  return `
    <div class="onboarding-sidebar">
      <div style="margin-bottom: var(--space-6); text-align: center; display: flex; justify-content: center; width: 100%;">
        <img src="${sustainaLogo}" alt="Sustaina Logo" style="max-height: 48px; object-fit: contain; width: auto; max-width: 100%; display: block;" />
      </div>
      <div id="sidebar-step-content"></div>
    </div>
  `;
}

// ─── Step 1: Welcome ─── //
function renderWelcome(container) {
  onboardingData = { ...INITIAL_ONBOARDING_DATA };
  let selectedLang = 'english';

  container.innerHTML = `
    <div class="onboarding-container page-enter">
      ${getOnboardingSidebarHTML()}
      <div class="onboarding-main">
        <div class="onboarding-content">
          <h2 style="font-size: var(--text-3xl); margin-bottom: var(--space-2);">Welcome to Sustaina</h2>
          <p class="text-secondary mb-6">Set up your profile conversationally with Arya, your AI voice companion.</p>

          <div style="max-width: 400px; margin: 0 auto var(--space-6); text-align: left;" class="card">
            <h4 style="margin-bottom: var(--space-3); font-weight: 700; text-align: center; color: var(--green-800);">Select Arya's Language</h4>
            <div style="display: flex; gap: var(--space-3); justify-content: center;" role="group" aria-label="Arya's Language Selector">
              <button class="btn btn-primary lang-btn" data-lang="english" aria-pressed="true" style="background: var(--green-600); color: white; flex: 1; font-weight: 600; padding: var(--space-3); border-radius: var(--radius-md); border: none;">English</button>
              <button class="btn btn-secondary lang-btn" data-lang="hindi" aria-pressed="false" style="flex: 1; font-weight: 600; padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-default);">Hindi (हिंदी)</button>
              <button class="btn btn-secondary lang-btn" data-lang="hinglish" aria-pressed="false" style="flex: 1; font-weight: 600; padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-default);">Hinglish</button>
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

  // Language buttons
  container.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.replace('btn-primary', 'btn-secondary');
        b.style.background = ''; b.style.color = ''; b.style.border = '1px solid var(--border-default)';
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.replace('btn-secondary', 'btn-primary');
      btn.style.background = 'var(--green-600)'; btn.style.color = 'white'; btn.style.border = 'none';
      btn.setAttribute('aria-pressed', 'true');
      selectedLang = btn.dataset.lang;
    });
  });

  document.getElementById('start-onboarding').addEventListener('click', () => {
    onboardingData.language = selectedLang;
    currentStep = 1;
    conversationHistory = [];
    pendingQuestion = false;
    renderOnboarding(container);
  });

  document.getElementById('skip-onboarding-btn').addEventListener('click', () => {
    onboardingData = {
      ...INITIAL_ONBOARDING_DATA,
      language: selectedLang,
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
    currentStep = 2; 
    renderOnboarding(container);
  });
}

// ─── Step 2: Conversational Voice Chat ─── //
function renderConversation(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      ${getOnboardingSidebarHTML()}
      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}

        <div class="onboarding-content" style="max-width: 600px; padding: 0 var(--space-4);">
          <div class="arya-bubble mb-6" style="margin-top: 0;">
            <div class="arya-avatar">🌱</div>
            <div class="arya-message" id="arya-speech-text">Preparing session...</div>
          </div>

          <div class="waveform" id="onboarding-waveform" style="opacity: 0.2;">
            ${Array.from({ length: 14 }, () => '<div class="waveform-bar"></div>').join('')}
          </div>

          <div class="transcript-box" style="margin-bottom: var(--space-6);">
            <div style="flex: 1;">
              <div class="transcript-label" id="transcript-header">Press mic and start speaking...</div>
              <input type="text" class="transcript-text" id="voice-input-box" 
                     placeholder="Type your response here if microphone is off..." 
                     aria-labelledby="transcript-header"
                     style="border: none; background: transparent; padding: var(--space-2) 0; width: 100%;" />
            </div>
            <button id="send-text-btn" class="btn btn-ghost btn-icon" style="opacity: 0.7;" aria-label="Send response">
              ${icons.arrow_right || '➔'}
            </button>
          </div>
 
          <div style="text-align: center;">
            <div class="speak-btn" id="voice-mic-btn" title="Start listening" role="button" tabindex="0" aria-label="Microphone button" aria-pressed="false">
              ${icons.mic}
            </div>
            <div class="speak-btn-label" id="mic-status-text">Tap to Speak</div>
          </div>
 
          <div style="text-align: center; margin-top: var(--space-6);">
            <button class="btn btn-secondary" id="direct-to-review-btn">Skip to Review ➔</button>
          </div>
        </div>
      </div>
    </div>
  `;
 
  const sidebarContent = document.getElementById('sidebar-step-content');
  if (sidebarContent) {
    sidebarContent.innerHTML = `
      <div class="card" style="padding: var(--space-4); background: var(--neutral-50);">
        <h4 style="font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--space-4); color: var(--green-800);">Profile Extraction status</h4>
        <div class="extraction-list" id="extraction-status" style="margin: 0;"></div>
      </div>
    `;
  }

  setupEndSession();
  updateVisualChecklist();
 
  // Handlers
  const voiceInput = document.getElementById('voice-input-box');
  const micBtn = document.getElementById('voice-mic-btn');

  setTimeout(() => runConversationStep(container), 500);
 
  voiceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && voiceInput.value.trim()) {
      handleUserSpeechSubmit(container, voiceInput.value.trim());
      voiceInput.value = '';
    }
  });
 
  document.getElementById('send-text-btn').addEventListener('click', () => {
    if (voiceInput.value.trim()) {
      handleUserSpeechSubmit(container, voiceInput.value.trim());
      voiceInput.value = '';
    }
  });
 
  document.getElementById('direct-to-review-btn').addEventListener('click', () => {
    stopSpeaking();
    if (activeRecognition) activeRecognition.stop();
    currentStep = 2;
    renderOnboarding(container);
  });
 
  const toggleMicAction = () => {
    if (isAryaSpeaking) {
      stopSpeaking();
      isAryaSpeaking = false;
      document.getElementById('onboarding-waveform').style.opacity = '0.2';
    }
    isListening ? stopListening() : startListening(container);
  };

  micBtn.addEventListener('click', toggleMicAction);
  micBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); toggleMicAction();
    }
  });
}

function updateVisualChecklist() {
  const statusEl = document.getElementById('extraction-status');
  if (!statusEl) return;

  const items = [
    { label: 'Name', value: onboardingData.name },
    { label: 'City', value: onboardingData.city },
    { label: 'Transport', value: onboardingData.primaryTransport && onboardingData.dailyTransportKm ? `${onboardingData.primaryTransport} (${onboardingData.dailyTransportKm}km)` : null },
    { label: 'Energy', value: onboardingData.electricityUnits ? `${onboardingData.electricityUnits} units/mo` : null },
    { label: 'Household & Diet', value: onboardingData.householdSize && onboardingData.diet ? `${onboardingData.householdSize} people, ${onboardingData.diet}` : null },
  ];

  statusEl.innerHTML = items.map(item => `
    <div class="extraction-item ${item.value ? 'done' : ''}">
      <div class="extraction-check">${item.value ? '✓' : ''}</div>
      <span>${item.label}: <strong>${item.value || '⏳'}</strong></span>
    </div>
  `).join('');
}

async function runConversationStep(container) {
  if (pendingQuestion) return;
  pendingQuestion = true;

  const speechTextEl = document.getElementById('arya-speech-text');
  if (speechTextEl) speechTextEl.textContent = ARYA_STATUS_MESSAGES[Math.floor(Math.random() * ARYA_STATUS_MESSAGES.length)];
  
  const waveformEl = document.getElementById('onboarding-waveform');
  if (waveformEl) waveformEl.style.opacity = '0.5';

  let question = await getNextOnboardingQuestion(onboardingData, conversationHistory);
  pendingQuestion = false;

  const isCompleted = question && (
    question.includes("Perfect! I have extracted all your details") || 
    question.includes("उत्कृष्ट! मैंने आपकी सभी जानकारी") ||
    question.includes("Perfect! Maine aapki saari details")
  );

  conversationHistory.push(`Arya: ${question}`);

  speakText(question, 
    () => {
      isAryaSpeaking = true;
      if (speechTextEl) speechTextEl.textContent = question;
      if (waveformEl) waveformEl.style.opacity = '1';
    },
    () => {
      isAryaSpeaking = false;
      if (waveformEl) waveformEl.style.opacity = '0.2';
      if (isCompleted) {
        currentStep = 2; renderOnboarding(container);
      } else {
        startListening(container);
      }
    }
  );
}

function startListening(container) {
  if (isListening) return;
  const statusLabel = document.getElementById('transcript-header');
  const micBtn = document.getElementById('voice-mic-btn');

  activeRecognition = initSpeechRecognition(
    (text) => {
      document.getElementById('voice-input-box').value = text;
      statusLabel.textContent = "Listening...";
    },
    () => {
      isListening = false;
      micBtn.classList.remove('recording');
      statusLabel.textContent = "Processing speech...";
      const transcript = document.getElementById('voice-input-box').value.trim();
      if (transcript) handleUserSpeechSubmit(container, transcript);
    },
    () => {
      stopListening();
      statusLabel.textContent = "Microphone error, please type your response.";
    }
  );

  if (activeRecognition) {
    activeRecognition.start();
    isListening = true;
    micBtn.classList.add('recording');
    statusLabel.textContent = "Speak now...";
  }
}

function stopListening() {
  if (activeRecognition) activeRecognition.stop();
  isListening = false;
  document.getElementById('voice-mic-btn')?.classList.remove('recording');
}

async function handleUserSpeechSubmit(container, text) {
  if (!text.trim() || pendingExtraction) return;
  conversationHistory.push(`User: ${text}`);
  pendingExtraction = true;
  
  const statusLabel = document.getElementById('transcript-header');
  statusLabel.innerHTML = '<span>⚡</span> Gemini extracting details...';
  
  const updates = await extractProfileFromVoice(text, onboardingData);
  if (updates) {
    Object.keys(updates).forEach(key => {
      if (updates[key] != null) onboardingData[key] = updates[key];
    });
  }

  pendingExtraction = false;
  updateVisualChecklist();
  document.getElementById('voice-input-box').value = '';
  statusLabel.textContent = "Details extracted! Continuing...";
  setTimeout(() => runConversationStep(container), 1000);
}

// ─── Step 3: Review Table ─── //
function renderReview(container) {
  const data = onboardingData;
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      ${getOnboardingSidebarHTML()}
      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">Let's review what I've understood</h2>
          <p class="text-secondary mb-6">You can edit any value directly if needed.</p>

          <div class="review-table">
            ${renderReviewRow('Name', 'rev-input-name', 'text', data.name || 'Aryan Medigeri')}
            ${renderReviewRow('City', 'rev-input-city', 'text', data.city || 'Pune')}
            ${renderReviewRow('Household Size', 'rev-input-house', 'number', data.householdSize || 4)}
            <div class="review-row">
              <label for="rev-input-trans" class="review-label">Transport Mode</label>
              <select id="rev-input-trans" style="border: none; background: transparent; width: auto; font-weight: 600; text-align: right; direction: rtl;">
                <option value="bike" ${data.primaryTransport === 'bike' ? 'selected' : ''}>Bike</option>
                <option value="car_petrol" ${data.primaryTransport === 'car_petrol' ? 'selected' : ''}>Car (Petrol)</option>
                <option value="car_diesel" ${data.primaryTransport === 'car_diesel' ? 'selected' : ''}>Car (Diesel)</option>
                <option value="bus" ${data.primaryTransport === 'bus' ? 'selected' : ''}>Public Bus</option>
                <option value="metro" ${data.primaryTransport === 'metro' ? 'selected' : ''}>Metro</option>
              </select>
            </div>
            ${renderReviewRow('Daily Commute (km)', 'rev-input-km', 'number', data.dailyTransportKm || 15)}
            <div class="review-row">
              <label for="rev-input-diet" class="review-label">Diet</label>
              <select id="rev-input-diet" style="border: none; background: transparent; width: auto; font-weight: 600; text-align: right; direction: rtl;">
                <option value="vegetarian" ${data.diet === 'vegetarian' ? 'selected' : ''}>Vegetarian</option>
                <option value="vegan" ${data.diet === 'vegan' ? 'selected' : ''}>Vegan</option>
                <option value="non_vegetarian" ${data.diet === 'non_vegetarian' ? 'selected' : ''}>Non-Vegetarian</option>
              </select>
            </div>
            ${renderReviewRow('Electricity (units/mo)', 'rev-input-elec', 'number', data.electricityUnits || 280)}
          </div>

          <div class="flex items-center justify-center gap-4 mt-8">
            <button class="btn btn-ghost btn-lg" id="review-back">Restart</button>
            <button class="btn btn-success btn-lg" id="review-confirm">Looks Good</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupEndSession();

  document.getElementById('review-back')?.addEventListener('click', () => {
    currentStep = 0; conversationHistory = []; pendingQuestion = false; renderOnboarding(container);
  });

  document.getElementById('review-confirm')?.addEventListener('click', () => {
    onboardingData.name = document.getElementById('rev-input-name').value;
    onboardingData.city = document.getElementById('rev-input-city').value;
    onboardingData.householdSize = parseInt(document.getElementById('rev-input-house').value) || 4;
    onboardingData.primaryTransport = document.getElementById('rev-input-trans').value;
    onboardingData.dailyTransportKm = parseInt(document.getElementById('rev-input-km').value) || 15;
    onboardingData.diet = document.getElementById('rev-input-diet').value;
    onboardingData.electricityUnits = parseInt(document.getElementById('rev-input-elec').value) || 200;
    currentStep = 3; renderOnboarding(container);
  });
}

function renderReviewRow(label, id, type, value) {
  return `
    <div class="review-row">
      <label for="${id}" class="review-label">${label}</label>
      <input type="${type}" id="${id}" class="review-value-input" value="${value}" style="text-align: right; border: none; background: transparent; width: 150px; font-weight: 600;" />
    </div>
  `;
}

// ─── Step 4: Goals Selection ─── //
function renderGoalsSelection(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      ${getOnboardingSidebarHTML()}
      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">What are your sustainability goals?</h2>
          <p class="text-secondary mb-6">Select all that apply.</p>

          <div class="goals-grid" role="group" aria-label="Select sustainability goals">
            ${GOAL_OPTIONS.map(goal => {
              const isSelected = onboardingData.goals.includes(goal.value);
              return `
                <button class="goal-option ${isSelected ? 'selected' : ''}" 
                     data-value="${goal.value}" aria-pressed="${isSelected}" aria-label="${goal.text}">
                  <div class="goal-option-icon" style="color: var(--green-700); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" aria-hidden="true">${icons[goal.icon]}</div>
                  <span class="goal-option-text">${goal.text}</span>
                </button>
              `;
            }).join('')}
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
      const val = item.dataset.value;
      const isSelected = item.classList.contains('selected');
      item.setAttribute('aria-pressed', isSelected);
      onboardingData.goals = isSelected 
        ? [...onboardingData.goals, val] 
        : onboardingData.goals.filter(g => g !== val);
    });
  });

  document.getElementById('goals-back')?.addEventListener('click', () => {
    currentStep = 2; renderOnboarding(container);
  });

  document.getElementById('goals-continue')?.addEventListener('click', () => {
    currentStep = 4; renderOnboarding(container);
  });
}

// ─── Step 5: Complete ─── //
function renderComplete(container) {
  const annual = calcAnnualEmissions(onboardingData);
  const moneySaved = calcMoneySaved(Math.round(annual.total * 0.2));
  const trees = calcTreesEquivalent(Math.round(annual.total * 0.2));

  container.innerHTML = `
    <div class="onboarding-container page-enter">
      ${getOnboardingSidebarHTML()}
      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        <div class="onboarding-content" style="max-width: 500px;">
          <div class="completion-check">${icons.check}</div>
          <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">You're all set! 🎉</h2>
          <p class="text-secondary mb-8">Your sustainability profile is ready.</p>

          <div class="completion-stats">
            <div class="completion-stat">
              <div class="completion-stat-value">${(annual.total / 1000).toFixed(2)}</div>
              <div class="completion-stat-label">Estimated Carbon Footprint<br />tonnes CO₂e / year</div>
            </div>
            <div class="completion-stat">
              <div class="completion-stat-value">${formatCurrency(moneySaved)}</div>
              <div class="completion-stat-label">Potential Savings<br />per year</div>
            </div>
            <div class="completion-stat">
              <div class="completion-stat-value">${trees}</div>
              <div class="completion-stat-label">Trees You Can Help Save<br />trees per year</div>
            </div>
          </div>

          <button class="btn btn-primary btn-xl mt-8" id="go-to-dashboard">Go to Dashboard</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('go-to-dashboard')?.addEventListener('click', () => {
    setOnboardingComplete({
      ...onboardingData,
      state: 'Maharashtra',
      memberSince: new Date().toISOString(),
    });

    logTimelineEvent({
      type: 'onboarding_completed',
      title: 'Profile Created',
      description: 'Successfully completed the conversational voice onboarding setup.',
      icon: '🚀'
    });

    currentStep = 0; toggleAppShell(true);
    const stateObj = getState();
    if (!stateObj.sessionUser && confirm('Would you like to create an account to back up your data?')) {
      navigate('auth');
    } else {
      navigate('home'); window.location.reload();
    }
  });
}
