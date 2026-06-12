# 🌱 Sustaina — Your AI Sustainability Companion (V3)

**India's most intelligent personal carbon footprint tracker**, powered by **Arya**, your AI sustainability coach.

Track your daily carbon emissions, get personalized recommendations, simulate future improvements, and build long-term sustainable habits with secure cloud syncing and AI intelligence.

---

## ✨ Features (V3)

### 👥 Conversational Timeline Progress Narrative
- **Arya Timeline (`src/pages/timeline.js`)**: A vertical chronologically connected milestones narrative.
- **Automatic Milestone Logging**: Automatically logs events when onboarding is completed, carbon twin scenarios are saved, or purchase advisor decisions are evaluated.

### 👪 Household Mode & Dynamic Aggregation
- **Topbar Switch (`src/components/topbar.js`)**: Toggle between Personal View and Household View.
- **Dynamic Scaling (`src/pages/dashboard.js`)**: When in Household View, emissions, savings, trees equivalents, trend graphs, and sector breakdowns scale dynamically based on household size and shared efficiency calculations.

### 🛡️ Supabase Auth & Cloud Database Sync
- **Secure Authentication (`src/pages/auth.js`)**: Create accounts, log in, reset passwords, or continue as Guest.
- **Auto Data Migration (`src/state/store.js`)**: When a guest signs up or logs in for the first time, all local `localStorage` guest data (activities, goals, simulations, timeline) is automatically migrated to the Supabase cloud database.

### 📋 Monthly AI Reports
- **AI Report Generator (`src/pages/reports.js`)**: Generates reports via FastAPI using Gemini Flash JSON schemas.
- **Export Formats**: Support print-to-PDF page-break overrides and HTML5 Canvas summary cards exported to PNG.

### 📈 Analytics Dashboard
- **Analytics View (`src/pages/analytics.js`)**: Displays interactive Chart.js line and bar graphs highlighting weekly/monthly footprint trends, success rates, and category changes.

### 🌍 Carbon Twin™ History
- **Simulations Table (`src/pages/simulationHistory.js`)**: Saves all committed Future Twin lifestyle scenarios.
- **Comparison Tool**: Select any two scenarios for side-by-side payback and CO₂ comparisons.

### 🛍️ Smart Purchase Advisor payback Persistence
- **Advisor History (`src/pages/smartPurchaseAdvisor.js`)**: Analyzes financial/carbon payback (e.g. electric scooter, solar panels) via Gemini and persists results to user history.

### 🔔 Notification Center
- **Bell Dropdown (`src/pages/notifications.js`)**: Quick notification alerts and read/unread updates in the Topbar.
- **Notifications Page**: Displays historical notifications and settings toggles.

### 🤖 Arya Coach & Advanced Memory
- **Coaching (`src/pages/aryaCoach.js`)**: Recommends four action cards (Biggest Impact, Cheapest, Easy Win, Challenge).
- **Preference Extraction (`backend/main.py`)**: Uses FastAPI `/api/update-memory` endpoint to extract behavioral traits (e.g. budget-sensitive, solar-interested) and adjusts recommendations accordingly.
- **Offline Fallback**: Automatically falls back to local client-side rule-based parsing and generation if the FastAPI server has no configured API key.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Build** | [Vite](https://vitejs.dev/) |
| **Frontend** | Vanilla JavaScript (ES Modules), HTML5 Canvas |
| **Styling** | Vanilla CSS (with responsive grid and custom properties) |
| **Charts** | [Chart.js](https://www.chartjs.org/) |
| **Database & Auth** | [Supabase PostgreSQL](https://supabase.com/) |
| **Backend API** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3) |
| **API Server** | Uvicorn |
| **AI Engine** | Gemini 1.5 Flash (via FastAPI Proxy Backend) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3.10+](https://www.python.org/)
- npm

### Installation & Execution

#### Step 1: Install Dependencies
```bash
# Install Node dependencies
npm install

# Install Python backend dependencies
pip install -r backend/requirements.txt
```

#### Step 2: Configure Environment Variables
Copy or create `.env` in your environment or set it in your shell:
```bash
# For Gemini REST API access
export GEMINI_API_KEY="your-gemini-api-key"

# For Supabase integration (optional: can also configure in settings UI)
export VITE_SUPABASE_URL="your-supabase-project-url"
export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

#### Step 3: Start the FastAPI Backend Proxy
```bash
python backend/main.py
```
The backend server will run on **http://127.0.0.1:8000**. Verify its health status by visiting `http://127.0.0.1:8000/api/health`.

#### Step 4: Start the Frontend App
In a new terminal window:
```bash
npm run dev
```
The Vite development server will open the app at **http://localhost:3000** (or `http://localhost:3001`).

---

## 📁 Project Structure

```
sustaina/
├── index.html                    # Root HTML
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── backend/
│   ├── main.py                   # FastAPI proxy server (Gemini endpoints)
│   └── requirements.txt          # Python dependencies
├── src/
│   ├── index.css                 # Premium custom design system
│   ├── main.js                   # App entry point & router init
│   ├── router.js                 # Hash-based SPA router
│   ├── components/
│   │   ├── charts.js             # Chart.js helper wrappers
│   │   ├── icons.js              # Inline SVG icon library
│   │   ├── sidebar.js            # Left navigation sidebar
│   │   └── topbar.js             # Top header bar (auth dropdown, bell, household view)
│   ├── services/
│   │   ├── gemini.js             # Speech Web APIs & FastAPI call proxy
│   │   └── supabase.js           # Supabase DB operations and clients
│   ├── data/
│   │   ├── emissions.js          # CEA/MoSPI emission factors engine
│   │   └── mockData.js           # Chart and baseline mock data
│   ├── state/
│   │   └── store.js              # LocalStorage & Supabase sync reactive store
│   ├── pages/
│   │   ├── dashboard.js          # dynamic Home dashboard (scales household views)
│   │   ├── auth.js               # Login / Signup / Recovery
│   │   ├── timeline.js           # Milestones progress timeline
│   │   ├── simulationHistory.js  # Carbon Twin simulation list & comparison selector
│   │   ├── notifications.js      # Notifications dropdown & list page
│   │   ├── analytics.js          # Weekly/monthly footprint trends charts
│   │   ├── activityLog.js        # Activity log filter tabs
│   │   ├── aryaCoach.js          # AI coach plan
│   │   ├── insights.js           # Analytics bar graphs & recommendations
│   │   ├── carbonTwin.js         # Carbon Twin comparison sliders
│   │   ├── reports.js            # quarterly/monthly reports generator (Canvas + Print)
│   │   ├── goals.js              # Sustainability goals
│   │   ├── profile.js            # Score level details & XP badges
│   │   ├── settings.js           # settings & Supabase URL/Key inputs
│   │   ├── community.js          # Community
│   │   └── onboarding.js         # Conversational voice onboarding
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

## 📄 License

This project is for educational and demonstration purposes.

---

## 👤 Author

**Aryan Sharma** — Built with 💚 for a sustainable India.

---

> *"You don't have to be perfect. You just have to start."* — Arya 🌱
