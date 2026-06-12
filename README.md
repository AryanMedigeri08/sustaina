# 🌱 Sustaina — Your AI Sustainability Companion

**India's most intelligent personal carbon footprint tracker**, powered by **Arya**, your AI sustainability coach.

Track your daily carbon emissions, get personalized recommendations, and visualize the impact of sustainable choices — all tailored to the Indian lifestyle.

---

## ✨ Features

### 🎤 Voice Onboarding with Arya
- 9-step guided onboarding flow with Arya AI coach
- Animated waveform and pulse visuals
- Transport mode & diet selection with icon grids
- Profile review and sustainability goals picker
- Auto-calculated carbon baseline on completion

### 📊 Smart Dashboard
- Real-time carbon footprint (tonnes CO₂e/year)
- Animated donut chart — category breakdown (Transport, Food, Energy, Shopping, Waste)
- Impact cards: CO₂ Saved, Money Saved (₹), Trees Equivalent
- Emission trend line chart
- AI-powered insight cards from Arya

### 📝 Activity Log
- Quick-add icons: Car, Bike, Bus, Metro, Train, Walk
- Category filter tabs (Transport / Food / Home Energy / Shopping / Waste)
- Detailed activity history with CO₂ per activity
- Modal for logging custom activities

### 🤖 Arya Coach
- Weekly plan hero card with SVG progress ring
- 4 coaching cards: Biggest Impact, Cheapest Improvement, Easy Win, Weekly Challenge
- Data-driven recommendations based on logged activities

### 📈 Insights
- Period tabs (Week / Month / Year)
- Bar chart emission trends
- Category breakdown with animated progress bars
- AI insight from Arya with actionable recommendations

### 🌍 Carbon Twin™
- Split-view: Current You vs Future You
- Factory vs green-city visual metaphor
- Reduction potential in tonnes, money (₹), and trees
- "See My Path" call-to-action

### 📋 Monthly Report
- Summary metrics: Total Emissions, Reduction %, Money Saved, Trees
- Category breakdown bars
- Emission trend chart
- Arya's narrative report summary

### 🎯 Goals
- Pre-set goals with progress bars (Reduce Emissions, Save Money, Public Transport, Eat Plants)
- Percentage tracking with target dates

### 👤 Profile & Achievements
- Sustainability Score with level badge (Eco Explorer, Green Guardian, etc.)
- XP progress bar
- Achievement badges grid (First Log, Tree Saver, Green Commuter, etc.)

### ⚙️ Settings
- Account details, language selection
- Notification toggles (Push, Email, Weekly Report)
- Dark mode toggle

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | [Vite](https://vitejs.dev/) |
| Language | Vanilla JavaScript (ES Modules) |
| Styling | Vanilla CSS with Custom Properties |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) + [Outfit](https://fonts.google.com/specimen/Outfit) |
| Icons | Inline SVG (Lucide-style) |
| State | localStorage-backed reactive store |
| Backend | None (fully client-side) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/AryanMedigeri08/sustaina.git
cd sustaina

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will open at **http://localhost:3000** (or next available port).

### First Visit
On your first visit, you'll be guided through the **Voice Onboarding** flow with Arya. To re-trigger onboarding at any time, visit:

```
http://localhost:3000/?reset
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
sustaina/
├── index.html                    # Root HTML
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── src/
│   ├── index.css                 # Design system (tokens, components, animations)
│   ├── main.js                   # App entry point & router init
│   ├── router.js                 # Hash-based SPA router
│   ├── components/
│   │   ├── charts.js             # Chart.js wrappers (donut, line, bar)
│   │   ├── icons.js              # Inline SVG icon library
│   │   ├── sidebar.js            # Left navigation sidebar
│   │   └── topbar.js             # Top header bar
│   ├── data/
│   │   ├── emissions.js          # Indian emission factors & calculation engine
│   │   └── mockData.js           # Demo data (activities, trends, goals)
│   ├── pages/
│   │   ├── dashboard.js          # Home dashboard
│   │   ├── activityLog.js        # Activity logging
│   │   ├── aryaCoach.js          # AI coaching recommendations
│   │   ├── insights.js           # Analytics & insights
│   │   ├── carbonTwin.js         # Carbon Twin™ comparison
│   │   ├── reports.js            # Monthly report
│   │   ├── goals.js              # Sustainability goals
│   │   ├── profile.js            # User profile & achievements
│   │   ├── settings.js           # App settings
│   │   ├── community.js          # Community (coming soon)
│   │   └── onboarding.js         # 9-step voice onboarding flow
│   └── state/
│       └── store.js              # localStorage-backed state management
```

---

## 🌿 Carbon Calculation Engine

Built with **2024 CEA/MoSPI data** for India-specific emission factors:

- **Electricity**: State-wise grid factors (Maharashtra 0.79, Karnataka 0.74, Delhi 0.80 kg CO₂/kWh)
- **Transport**: Per-km factors (Car 0.192, Bike 0.089, Metro 0.041, Bus 0.031, Train 0.014 kg CO₂)
- **Food**: Per-meal factors (Vegan 0.50, Vegetarian 0.75, Chicken 2.45, Mutton 5.50 kg CO₂)
- **LPG**: 37.5 kg CO₂ per cylinder
- **Money savings**: Calculated against Indian fuel prices, electricity tariffs, and LPG costs

---

## 🎨 Design System

- **Color palette**: Forest green (#2D5016) → Sage (#6BB344) with warm neutrals
- **Typography**: Outfit (headings) + Inter (body)
- **Elevation**: Layered shadow system with glassmorphism cards
- **Animations**: Waveform, pulse ring, progress ring, counter, page transitions
- **Responsive**: Mobile-first with breakpoints at 768px and 1024px

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 👤 Author

**Aryan Sharma** — Built with 💚 for a sustainable India.

---

> *"You don't have to be perfect. You just have to start."* — Arya 🌱
