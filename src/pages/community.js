// ═══════════════════════════════════════════
// SUSTAINA — Community Page (Coming Soon)
// ═══════════════════════════════════════════

export function renderCommunity(container) {
  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Community</h1>
          <p class="page-subtitle">Connect with fellow sustainability champions.</p>
        </div>
      </div>

      <div class="community-coming-soon">
        <div class="community-coming-soon-icon">🌍</div>
        <h2>Coming Soon!</h2>
        <p>We're building something amazing. Soon you'll be able to join challenges, compete on leaderboards, and share your sustainability wins with the Sustaina community.</p>
        
        <div class="grid-3 mt-8" style="max-width: 600px; margin-left: auto; margin-right: auto;">
          <div class="card text-center">
            <div style="font-size: 32px; margin-bottom: var(--space-3);">🏆</div>
            <h4>Leaderboards</h4>
            <p class="text-xs text-secondary mt-2">Compete with your city</p>
          </div>
          <div class="card text-center">
            <div style="font-size: 32px; margin-bottom: var(--space-3);">🤝</div>
            <h4>Team Challenges</h4>
            <p class="text-xs text-secondary mt-2">Join group sustainability challenges</p>
          </div>
          <div class="card text-center">
            <div style="font-size: 32px; margin-bottom: var(--space-3);">📢</div>
            <h4>Share Wins</h4>
            <p class="text-xs text-secondary mt-2">Celebrate your achievements</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
