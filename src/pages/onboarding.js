// ═══════════════════════════════════════════
// SUSTAINA — Voice Onboarding Flow
// Complete multi-step onboarding with simulated voice
// ═══════════════════════════════════════════

import { setOnboardingComplete, setState, getState } from '../state/store.js';
import { icons } from '../components/icons.js';
import { navigate } from '../router.js';
import { calcAnnualEmissions, calcSustainabilityScore, getScoreBand, calcTreesEquivalent, calcMoneySaved } from '../data/emissions.js';

// ─── Step Definitions ─── //
const STEPS = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'name', label: 'Getting to know you' },
  { key: 'city', label: 'Your home & energy' },
  { key: 'transport', label: 'Your transport' },
  { key: 'diet', label: 'Your diet & food habits' },
  { key: 'household', label: 'Your household' },
  { key: 'review', label: 'Review & complete' },
  { key: 'goals', label: 'Your goals' },
  { key: 'complete', label: 'You\'re all set!' },
];

const TRANSPORT_OPTIONS = [
  { icon: '🏍️', label: 'Bike', value: 'bike' },
  { icon: '🚗', label: 'Car', value: 'car_petrol' },
  { icon: '🚌', label: 'Public Transport', value: 'bus' },
  { icon: '🚶', label: 'Walk', value: 'walk' },
  { icon: '🏢', label: 'Work From Home', value: 'walk' },
];

const DIET_OPTIONS = [
  { icon: '🥗', label: 'Vegetarian', value: 'vegetarian' },
  { icon: '🥩', label: 'Non-Vegetarian', value: 'occasional_nonveg' },
  { icon: '🌱', label: 'Vegan', value: 'vegan' },
  { icon: '🥬', label: 'Mostly Veg', value: 'vegetarian' },
];

const GOAL_OPTIONS = [
  { icon: '🌍', text: 'Reduce my carbon footprint', value: 'reduce_footprint' },
  { icon: '💰', text: 'Save money on monthly bills', value: 'save_money' },
  { icon: '🚌', text: 'Use public transport more', value: 'public_transport' },
  { icon: '🥗', text: 'Eat more sustainably', value: 'eat_sustainable' },
  { icon: '♻️', text: 'Reduce waste', value: 'reduce_waste' },
  { icon: '🌿', text: 'Live a more minimal lifestyle', value: 'minimal_lifestyle' },
  { icon: '⚡', text: 'Switch to clean energy', value: 'clean_energy' },
  { icon: '🌳', text: 'Plant more trees', value: 'plant_trees' },
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
    case 'name': renderQuestion(container, 'name'); break;
    case 'city': renderQuestion(container, 'city'); break;
    case 'transport': renderTransportStep(container); break;
    case 'diet': renderDietStep(container); break;
    case 'household': renderQuestion(container, 'household'); break;
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
  if (currentStep === 0) return '';
  return `
    <div class="onboarding-step-info">
      <span class="onboarding-step-label">Step ${currentStep} of ${STEPS.length - 2}</span>
      <button class="onboarding-end-session" id="end-session">End Session</button>
    </div>
  `;
}

function getProgressBar() {
  if (currentStep === 0 || currentStep >= STEPS.length - 1) return '';
  return `
    <div class="onboarding-progress">
      ${STEPS.slice(1, -1).map((_, i) => `
        <div class="onboarding-progress-step ${i < currentStep ? 'completed' : ''} ${i === currentStep - 1 ? 'active' : ''}"></div>
        ${i < STEPS.length - 3 ? `<div class="onboarding-progress-line ${i < currentStep - 1 ? 'completed' : ''}"></div>` : ''}
      `).join('')}
    </div>
  `;
}

function setupEndSession(container) {
  document.getElementById('end-session')?.addEventListener('click', () => {
    currentStep = 0;
    restoreLayout();
    navigate('home');
  });
}

// ─── Step: Welcome ─── //
function renderWelcome(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div class="sidebar-logo" style="margin-bottom: var(--space-6);">
          <div class="sidebar-logo-icon">🌱</div>
          <h1 style="font-size: var(--text-xl); font-weight: 700; color: var(--green-800);">Sustaina</h1>
        </div>
        <p class="text-xs text-secondary" style="margin-bottom: var(--space-8);">Your AI Sustainability Companion</p>
        
        <div style="opacity: 0.3; pointer-events: none;">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🏠</span> <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📝</span> <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🤖</span> <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📊</span> <span>Insights</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🌍</span> <span>Carbon Twin</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📋</span> <span>Reports</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🎯</span> <span>Goals</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👥</span> <span>Community</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👤</span> <span>Profile</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>⚙️</span> <span>Settings</span></div>
        </div>

        <div class="sidebar-footer" style="margin-top: auto;">
          <div class="sidebar-footer-item"><span>❓</span> <span>Help & Support</span></div>
        </div>
      </div>

      <div class="onboarding-main">
        <div class="onboarding-content">
          <div style="display: flex; align-items: center; justify-content: flex-end; margin-bottom: var(--space-4);">
            <div class="flex items-center gap-2" style="background: white; padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-light); cursor: pointer;">
              <span class="text-sm">English</span>
              <span style="color: var(--text-tertiary);">▾</span>
            </div>
          </div>

          <h2 style="font-size: var(--text-3xl); margin-bottom: var(--space-2);">Welcome to Sustaina 🌿</h2>
          <p class="text-secondary mb-6">Let's build your sustainability profile with Arya</p>

          <div class="pulse-ring">
            <div class="pulse-inner">
              <span style="font-size: 40px;">🌱</span>
            </div>
          </div>

          <div class="onboarding-steps" style="max-width: 300px; margin: 0 auto;">
            <h4 style="margin-bottom: var(--space-3);">Onboarding Steps</h4>
            ${STEPS.slice(1, -1).map((step, i) => `
              <div class="step-item ${i === 0 ? 'active' : ''}">
                <span class="step-dot"></span>
                <span>${step.label}</span>
              </div>
            `).join('')}
          </div>

          <div class="onboarding-features mt-8">
            <div class="onboarding-feature">
              <div class="onboarding-feature-icon">🎤</div>
              <div class="onboarding-feature-title">Voice-first</div>
              <div class="onboarding-feature-desc">Talk naturally with Arya</div>
            </div>
            <div class="onboarding-feature">
              <div class="onboarding-feature-icon">🎯</div>
              <div class="onboarding-feature-title">Personalized</div>
              <div class="onboarding-feature-desc">Insights tailored to your lifestyle</div>
            </div>
            <div class="onboarding-feature">
              <div class="onboarding-feature-icon">💚</div>
              <div class="onboarding-feature-title">Impactful</div>
              <div class="onboarding-feature-desc">Take actions that truly matter</div>
            </div>
          </div>

          <button class="btn btn-primary btn-xl mt-8" id="start-onboarding" style="max-width: 400px; margin: var(--space-8) auto 0;">
            🌱 Start Voice Onboarding
          </button>
          <p class="text-xs text-secondary mt-4">It'll take less than 5 minutes</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('start-onboarding').addEventListener('click', () => {
    currentStep = 1;
    renderOnboarding(container);
  });
}

// ─── Step: Text Question ─── //
function renderQuestion(container, type) {
  let question = '';
  let placeholder = '';
  let inputType = 'text';

  switch (type) {
    case 'name':
      question = "Thanks for starting! 🌱 What's your name?";
      placeholder = 'Enter your name';
      break;
    case 'city':
      question = `Great to meet you${onboardingData.name ? ', ' + onboardingData.name : ''}! 🏙️ Which city do you live in?`;
      placeholder = 'e.g., Pune, Mumbai, Delhi';
      break;
    case 'household':
      question = `Almost there! 🏡 How many people live in your household?`;
      placeholder = 'e.g., 4';
      inputType = 'number';
      break;
  }

  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div class="sidebar-logo" style="margin-bottom: var(--space-6);">
          <div class="sidebar-logo-icon">🌱</div>
          <h1 style="font-size: var(--text-xl); font-weight: 700; color: var(--green-800);">Sustaina</h1>
        </div>
        <p class="text-xs text-secondary" style="margin-bottom: var(--space-8);">Your AI Sustainability Companion</p>
        
        <div style="opacity: 0.3; pointer-events: none;">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🏠</span> <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📝</span> <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🤖</span> <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📊</span> <span>Insights</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🌍</span> <span>Carbon Twin</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📋</span> <span>Reports</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🎯</span> <span>Goals</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👥</span> <span>Community</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👤</span> <span>Profile</span></div>
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <div class="arya-bubble">
            <div class="arya-avatar">🌱</div>
            <div class="arya-message">${question}</div>
          </div>

          <div class="waveform" style="opacity: 0.3;">
            ${Array.from({ length: 12 }, () => '<div class="waveform-bar"></div>').join('')}
          </div>

          <div class="transcript-box">
            <div style="flex: 1;">
              <div class="transcript-label">Live Transcript</div>
              <input type="${inputType}" class="transcript-text" id="onboarding-input" 
                     placeholder="${placeholder}" 
                     style="border: none; background: transparent; padding: var(--space-2) 0; width: 100%;" 
                     autofocus />
            </div>
            <span class="transcript-edit">${icons.edit}</span>
          </div>

          <div class="speak-btn" id="speak-btn" title="Tap to speak">
            ${icons.mic}
          </div>
          <div class="speak-btn-label">Tap to Speak</div>
        </div>
      </div>
    </div>
  `;

  setupEndSession(container);

  // Handle input submission
  const input = document.getElementById('onboarding-input');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      saveQuestionData(type, input.value.trim());
      currentStep++;
      renderOnboarding(container);
    }
  });

  // Speak button simulates input
  document.getElementById('speak-btn')?.addEventListener('click', () => {
    if (input.value.trim()) {
      saveQuestionData(type, input.value.trim());
      currentStep++;
      renderOnboarding(container);
    } else {
      input.focus();
    }
  });
}

function saveQuestionData(type, value) {
  switch (type) {
    case 'name': onboardingData.name = value; break;
    case 'city': onboardingData.city = value; break;
    case 'household': onboardingData.householdSize = parseInt(value) || 4; break;
  }
}

// ─── Step: Transport Selection ─── //
function renderTransportStep(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div class="sidebar-logo" style="margin-bottom: var(--space-6);">
          <div class="sidebar-logo-icon">🌱</div>
          <h1 style="font-size: var(--text-xl); font-weight: 700; color: var(--green-800);">Sustaina</h1>
        </div>
        <p class="text-xs text-secondary" style="margin-bottom: var(--space-8);">Your AI Sustainability Companion</p>
        <div style="opacity: 0.3; pointer-events: none;">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🏠</span> <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📝</span> <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🤖</span> <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📊</span> <span>Insights</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🌍</span> <span>Carbon Twin</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📋</span> <span>Reports</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🎯</span> <span>Goals</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👥</span> <span>Community</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👤</span> <span>Profile</span></div>
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <div class="arya-bubble">
            <div class="arya-avatar">🌱</div>
            <div class="arya-message">Got it! How do you usually travel to work or college?</div>
          </div>

          <div class="option-grid">
            ${TRANSPORT_OPTIONS.map(opt => `
              <div class="option-item ${onboardingData.primaryTransport === opt.value ? 'selected' : ''}" data-value="${opt.value}">
                <span class="option-item-icon">${opt.icon}</span>
                <span class="option-item-label">${opt.label}</span>
              </div>
            `).join('')}
          </div>

          <div class="transcript-box">
            <div style="flex: 1;">
              <div class="transcript-label">Live Transcript</div>
              <div class="transcript-text" id="transport-transcript">I usually go by bike.</div>
            </div>
            <span class="transcript-edit">${icons.edit}</span>
          </div>

          <div class="speak-btn" id="speak-btn">${icons.mic}</div>
          <div class="speak-btn-label">Tap to Speak</div>
        </div>
      </div>
    </div>
  `;

  setupEndSession(container);

  container.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', () => {
      container.querySelectorAll('.option-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      onboardingData.primaryTransport = item.dataset.value;
      document.getElementById('transport-transcript').textContent = `I usually go by ${item.querySelector('.option-item-label').textContent.toLowerCase()}.`;
      
      setTimeout(() => {
        currentStep++;
        renderOnboarding(container);
      }, 600);
    });
  });
}

// ─── Step: Diet Selection ─── //
function renderDietStep(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div class="sidebar-logo" style="margin-bottom: var(--space-6);">
          <div class="sidebar-logo-icon">🌱</div>
          <h1 style="font-size: var(--text-xl); font-weight: 700; color: var(--green-800);">Sustaina</h1>
        </div>
        <p class="text-xs text-secondary" style="margin-bottom: var(--space-8);">Your AI Sustainability Companion</p>
        <div style="opacity: 0.3; pointer-events: none;">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🏠</span> <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📝</span> <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🤖</span> <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📊</span> <span>Insights</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🌍</span> <span>Carbon Twin</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📋</span> <span>Reports</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🎯</span> <span>Goals</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👥</span> <span>Community</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👤</span> <span>Profile</span></div>
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <div class="arya-bubble">
            <div class="arya-avatar">🌱</div>
            <div class="arya-message">How would you describe your diet?</div>
          </div>

          <div class="option-grid">
            ${DIET_OPTIONS.map(opt => `
              <div class="option-item ${onboardingData.diet === opt.value ? 'selected' : ''}" data-value="${opt.value}">
                <span class="option-item-icon">${opt.icon}</span>
                <span class="option-item-label">${opt.label}</span>
              </div>
            `).join('')}
          </div>

          <div class="transcript-box">
            <div style="flex: 1;">
              <div class="transcript-label">Live Transcript</div>
              <div class="transcript-text">I am mostly vegetarian.</div>
            </div>
            <span class="transcript-edit">${icons.edit}</span>
          </div>

          <div class="speak-btn" id="speak-btn">${icons.mic}</div>
          <div class="speak-btn-label">Tap to Speak</div>
        </div>
      </div>
    </div>
  `;

  setupEndSession(container);

  container.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', () => {
      container.querySelectorAll('.option-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      onboardingData.diet = item.dataset.value;
      
      setTimeout(() => {
        currentStep++;
        renderOnboarding(container);
      }, 600);
    });
  });
}

// ─── Step: Review ─── //
function renderReview(container) {
  const data = onboardingData;

  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div class="sidebar-logo" style="margin-bottom: var(--space-6);">
          <div class="sidebar-logo-icon">🌱</div>
          <h1 style="font-size: var(--text-xl); font-weight: 700; color: var(--green-800);">Sustaina</h1>
        </div>
        <p class="text-xs text-secondary" style="margin-bottom: var(--space-8);">Your AI Sustainability Companion</p>
        <div style="opacity: 0.3; pointer-events: none;">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🏠</span> <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📝</span> <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🤖</span> <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📊</span> <span>Insights</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🌍</span> <span>Carbon Twin</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📋</span> <span>Reports</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🎯</span> <span>Goals</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👥</span> <span>Community</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👤</span> <span>Profile</span></div>
        </div>
      </div>

      <div class="onboarding-main">
        ${getStepInfo()}
        ${getProgressBar()}
        
        <div class="onboarding-content">
          <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2);">Let's review what I've understood</h2>
          <p class="text-secondary mb-6">You can edit anything if needed.</p>

          <div class="review-table">
            <div class="review-row">
              <span class="review-label">Name</span>
              <span class="review-value">${data.name || 'Aryan Sharma'} <span class="review-edit">${icons.edit}</span></span>
            </div>
            <div class="review-row">
              <span class="review-label">City</span>
              <span class="review-value">${data.city || 'Pune'}, Maharashtra <span class="review-edit">${icons.edit}</span></span>
            </div>
            <div class="review-row">
              <span class="review-label">Household Size</span>
              <span class="review-value">${data.householdSize} Members <span class="review-edit">${icons.edit}</span></span>
            </div>
            <div class="review-row">
              <span class="review-label">Home Type</span>
              <span class="review-value">${data.homeType} <span class="review-edit">${icons.edit}</span></span>
            </div>
            <div class="review-row">
              <span class="review-label">Transport</span>
              <span class="review-value">${data.primaryTransport === 'bike' ? 'Bike' : data.primaryTransport === 'car_petrol' ? 'Car' : data.primaryTransport === 'bus' ? 'Public Transport' : 'Walk'} <span class="review-edit">${icons.edit}</span></span>
            </div>
            <div class="review-row">
              <span class="review-label">Diet</span>
              <span class="review-value">${data.diet === 'vegetarian' ? 'Mostly Vegetarian' : data.diet === 'vegan' ? 'Vegan' : 'Non-Vegetarian'} <span class="review-edit">${icons.edit}</span></span>
            </div>
            <div class="review-row">
              <span class="review-label">Work Type</span>
              <span class="review-value">${data.workType} <span class="review-edit">${icons.edit}</span></span>
            </div>
            <div class="review-row">
              <span class="review-label">Electricity Source</span>
              <span class="review-value">${data.electricitySource} <span class="review-edit">${icons.edit}</span></span>
            </div>
          </div>

          <div class="flex items-center justify-center gap-4 mt-8">
            <button class="btn btn-ghost btn-lg" id="review-back">Back</button>
            <button class="btn btn-success btn-lg" id="review-confirm">Looks Good</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupEndSession(container);

  document.getElementById('review-back')?.addEventListener('click', () => {
    currentStep--;
    renderOnboarding(container);
  });

  document.getElementById('review-confirm')?.addEventListener('click', () => {
    currentStep++;
    renderOnboarding(container);
  });
}

// ─── Step: Goals Selection ─── //
function renderGoalsSelection(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter">
      <div class="onboarding-sidebar">
        <div class="sidebar-logo" style="margin-bottom: var(--space-6);">
          <div class="sidebar-logo-icon">🌱</div>
          <h1 style="font-size: var(--text-xl); font-weight: 700; color: var(--green-800);">Sustaina</h1>
        </div>
        <p class="text-xs text-secondary" style="margin-bottom: var(--space-8);">Your AI Sustainability Companion</p>
        <div style="opacity: 0.3; pointer-events: none;">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🏠</span> <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📝</span> <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🤖</span> <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📊</span> <span>Insights</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🌍</span> <span>Carbon Twin</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📋</span> <span>Reports</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🎯</span> <span>Goals</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👥</span> <span>Community</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👤</span> <span>Profile</span></div>
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
                <div class="goal-option-icon">${goal.icon}</div>
                <span class="goal-option-text">${goal.text}</span>
              </div>
            `).join('')}
          </div>

          <div class="transcript-box mt-6" style="max-width: 500px;">
            <div style="flex: 1;">
              <div class="transcript-label">Anything else you'd like to achieve?</div>
              <input type="text" id="custom-goal" placeholder="Type or speak your goals..." 
                     style="border: none; background: transparent; padding: var(--space-2) 0; width: 100%;" />
            </div>
            <span style="font-size: 20px; cursor: pointer;">🎤</span>
          </div>

          <div class="flex items-center justify-center gap-4 mt-8">
            <button class="btn btn-ghost btn-lg" id="goals-back">Back</button>
            <button class="btn btn-primary btn-lg" id="goals-continue">Continue</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupEndSession(container);

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
    currentStep--;
    renderOnboarding(container);
  });

  document.getElementById('goals-continue')?.addEventListener('click', () => {
    currentStep++;
    renderOnboarding(container);
  });
}

// ─── Step: Complete ─── //
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
        <div class="sidebar-logo" style="margin-bottom: var(--space-6);">
          <div class="sidebar-logo-icon">🌱</div>
          <h1 style="font-size: var(--text-xl); font-weight: 700; color: var(--green-800);">Sustaina</h1>
        </div>
        <p class="text-xs text-secondary" style="margin-bottom: var(--space-8);">Your AI Sustainability Companion</p>
        <div style="opacity: 0.3; pointer-events: none;">
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🏠</span> <span>Home</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📝</span> <span>Activity Log</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🤖</span> <span>Arya Coach</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📊</span> <span>Insights</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🌍</span> <span>Carbon Twin</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>📋</span> <span>Reports</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>🎯</span> <span>Goals</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👥</span> <span>Community</span></div>
          <div class="sidebar-nav-item" style="padding: var(--space-3) var(--space-4);"><span>👤</span> <span>Profile</span></div>
        </div>
      </div>

      <div class="onboarding-main">
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
    // Save profile
    setOnboardingComplete({
      name: data.name || 'Aryan Sharma',
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

    currentStep = 0;
    restoreLayout();
    navigate('home');
    // Force full re-render
    window.location.reload();
  });
}
