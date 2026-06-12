// ═══════════════════════════════════════════
// SUSTAINA — Authentication Page
// ═══════════════════════════════════════════

import { signInUser, signUpUser, resetUserPassword } from '../services/supabase.js';
import { setState, getProfile, getActivities, getGoals, getMemory } from '../state/store.js';
import { navigate } from '../router.js';
import { icons } from '../components/icons.js';

let activeTab = 'login'; // 'login' or 'signup' or 'reset'

export function renderAuth(container) {
  // Hide standard layout shells for authentication
  const sidebarEl = document.getElementById('sidebar-container');
  const topbarEl = document.getElementById('topbar-container');
  const mainContent = document.getElementById('main-content');
  const pageContent = document.getElementById('page-content');
  
  if (sidebarEl) sidebarEl.style.display = 'none';
  if (topbarEl) topbarEl.style.display = 'none';
  if (mainContent) mainContent.style.marginLeft = '0';
  if (pageContent) { pageContent.style.padding = '0'; pageContent.style.maxWidth = 'none'; }

  renderAuthShell(container);
}

function renderAuthShell(container) {
  container.innerHTML = `
    <div class="onboarding-container page-enter" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-app);">
      <div class="card" style="width: 100%; max-width: 440px; padding: var(--space-8); box-shadow: var(--shadow-xl); background: white;">
        
        <!-- Logo Header -->
        <div style="text-align: center; margin-bottom: var(--space-6);">
          <div style="width: 48px; height: 48px; background: var(--green-800); border-radius: var(--radius-md); display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-bottom: var(--space-2);">🌱</div>
          <h1 style="font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 800; color: var(--green-800);">Sustaina</h1>
          <p class="text-xs text-secondary" style="margin-top: 2px;">Your AI Sustainability Companion</p>
        </div>

        <!-- Form Box -->
        <div id="auth-form-container">
          ${renderActiveForm()}
        </div>

        <!-- Guest Bypass Link -->
        <div style="text-align: center; margin-top: var(--space-6); border-top: 1px solid var(--border-light); padding-top: var(--space-4);">
          <button class="btn btn-ghost" id="auth-guest-btn" style="border: none; background: transparent; font-size: var(--text-xs); text-decoration: underline; color: var(--text-secondary);">
            Continue as Guest (localStorage Mode)
          </button>
        </div>
      </div>
    </div>
  `;

  attachAuthListeners(container);
}

function renderActiveForm() {
  if (activeTab === 'login') {
    return `
      <div style="display: flex; gap: var(--space-1); background: var(--neutral-100); padding: var(--space-1); border-radius: var(--radius-md); margin-bottom: var(--space-6);">
        <button class="tab-auth active" id="tab-login" style="flex: 1; padding: var(--space-2); border-radius: var(--radius-sm); border: none; font-size: var(--text-sm); font-weight: 600; cursor: pointer; background: white; color: var(--text-primary);">Log In</button>
        <button class="tab-auth" id="tab-signup" style="flex: 1; padding: var(--space-2); border-radius: var(--radius-sm); border: none; font-size: var(--text-sm); font-weight: 500; cursor: pointer; background: transparent; color: var(--text-secondary);">Sign Up</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-4);" class="page-enter">
        <div id="auth-error-msg" class="text-xs text-danger" style="color: var(--accent-red); font-weight: 600; text-align: center;"></div>
        <div>
          <label class="text-xs text-secondary font-semibold mb-1" style="display: block;">Email Address</label>
          <input type="email" id="auth-email" placeholder="email@example.com" required />
        </div>
        <div>
          <label class="text-xs text-secondary font-semibold mb-1" style="display: block;">Password</label>
          <input type="password" id="auth-password" placeholder="••••••••" required />
        </div>
        <div style="text-align: right;">
          <button id="forgot-password-link" style="font-size: var(--text-xs); color: var(--green-700); cursor: pointer; background: none; border: none;">Forgot Password?</button>
        </div>
        <button class="btn btn-primary btn-xl" id="btn-submit-auth" style="margin-top: var(--space-2);">Log In</button>
      </div>
    `;
  } else if (activeTab === 'signup') {
    return `
      <div style="display: flex; gap: var(--space-1); background: var(--neutral-100); padding: var(--space-1); border-radius: var(--radius-md); margin-bottom: var(--space-6);">
        <button class="tab-auth" id="tab-login" style="flex: 1; padding: var(--space-2); border-radius: var(--radius-sm); border: none; font-size: var(--text-sm); font-weight: 500; cursor: pointer; background: transparent; color: var(--text-secondary);">Log In</button>
        <button class="tab-auth active" id="tab-signup" style="flex: 1; padding: var(--space-2); border-radius: var(--radius-sm); border: none; font-size: var(--text-sm); font-weight: 600; cursor: pointer; background: white; color: var(--text-primary);">Sign Up</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-4);" class="page-enter">
        <div id="auth-error-msg" class="text-xs text-danger" style="color: var(--accent-red); font-weight: 600; text-align: center;"></div>
        <div>
          <label class="text-xs text-secondary font-semibold mb-1" style="display: block;">Full Name</label>
          <input type="text" id="auth-name" placeholder="Aryan Sharma" required />
        </div>
        <div>
          <label class="text-xs text-secondary font-semibold mb-1" style="display: block;">Email Address</label>
          <input type="email" id="auth-email" placeholder="email@example.com" required />
        </div>
        <div>
          <label class="text-xs text-secondary font-semibold mb-1" style="display: block;">Password</label>
          <input type="password" id="auth-password" placeholder="••••••••" required />
        </div>
        <button class="btn btn-primary btn-xl" id="btn-submit-auth" style="margin-top: var(--space-2);">Create Account</button>
      </div>
    `;
  } else {
    // Reset Password Form
    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-4);" class="page-enter">
        <h3 style="font-family: var(--font-heading); font-size: var(--text-md); font-weight: 700; text-align: center;">Reset Password</h3>
        <p class="text-xs text-secondary text-center" style="margin-bottom: var(--space-2);">Enter your email address and we'll send a password recovery link.</p>
        <div id="auth-error-msg" class="text-xs text-danger" style="color: var(--accent-red); font-weight: 600; text-align: center;"></div>
        <div>
          <label class="text-xs text-secondary font-semibold mb-1" style="display: block;">Email Address</label>
          <input type="email" id="auth-email" placeholder="email@example.com" required />
        </div>
        <button class="btn btn-primary btn-xl" id="btn-submit-auth">Send Recovery Email</button>
        <div style="text-align: center;">
          <button id="back-to-login-link" style="font-size: var(--text-xs); color: var(--green-700); cursor: pointer; background: none; border: none;">Back to Log In</button>
        </div>
      </div>
    `;
  }
}

function restoreLayoutShell() {
  const sidebarEl = document.getElementById('sidebar-container');
  const topbarEl = document.getElementById('topbar-container');
  const mainContent = document.getElementById('main-content');
  const pageContent = document.getElementById('page-content');
  
  if (sidebarEl) sidebarEl.style.display = '';
  if (topbarEl) topbarEl.style.display = '';
  if (mainContent) mainContent.style.marginLeft = '';
  if (pageContent) { pageContent.style.padding = ''; pageContent.style.maxWidth = ''; }
}

function attachAuthListeners(container) {
  // Switch tabs
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const forgotLink = document.getElementById('forgot-password-link');
  const backToLogin = document.getElementById('back-to-login-link');

  tabLogin?.addEventListener('click', () => {
    activeTab = 'login';
    renderAuthShell(container);
  });

  tabSignup?.addEventListener('click', () => {
    activeTab = 'signup';
    renderAuthShell(container);
  });

  forgotLink?.addEventListener('click', () => {
    activeTab = 'reset';
    renderAuthShell(container);
  });

  backToLogin?.addEventListener('click', () => {
    activeTab = 'login';
    renderAuthShell(container);
  });

  // Guest Mode
  document.getElementById('auth-guest-btn').addEventListener('click', () => {
    restoreLayoutShell();
    navigate('home');
    window.location.reload(); // Refresh to ensure layout matches
  });

  // Form Submit Action
  document.getElementById('btn-submit-auth')?.addEventListener('click', async () => {
    const errorMsg = document.getElementById('auth-error-msg');
    const email = document.getElementById('auth-email')?.value?.trim();
    const password = document.getElementById('auth-password')?.value;
    const name = document.getElementById('auth-name')?.value?.trim();

    if (!email) {
      errorMsg.textContent = 'Please enter an email address.';
      return;
    }

    try {
      errorMsg.textContent = 'Processing...';
      if (activeTab === 'login') {
        const data = await signInUser(email, password);
        if (data?.user) {
          // Set active session in state
          setState({ sessionUser: data.user });
          restoreLayoutShell();
          navigate('home');
          window.location.reload(); // Full sync
        }
      } else if (activeTab === 'signup') {
        if (!password || password.length < 6) {
          errorMsg.textContent = 'Password must be at least 6 characters.';
          return;
        }
        if (!name) {
          errorMsg.textContent = 'Please enter your full name.';
          return;
        }
        const data = await signUpUser(email, password, name);
        alert('Verification email sent! You can also check your credentials.');
        // Set user in state directly for local emulation ease
        if (data?.user) {
          setState({ sessionUser: data.user });
          restoreLayoutShell();
          navigate('home');
          window.location.reload();
        }
      } else if (activeTab === 'reset') {
        await resetUserPassword(email);
        alert('Password recovery link sent to your email.');
        activeTab = 'login';
        renderAuthShell(container);
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = err.message || 'Authentication failed.';
    }
  });
}
