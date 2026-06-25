# Sustaina: AI-Powered Personal Carbon Footprint Tracker and Coach

Sustaina is an intelligent, India-centric personal carbon footprint tracking application designed to help users build sustainable habits. Powered by Arya, an integrated AI sustainability coach, the application offers personalized insights, habit logging, future footprint simulations, and monthly reports with secure cloud synchronization.

---

## Features

### Conversational Voice Onboarding
- **Multi-Language Dialogue (English, Hindi, Hinglish)**: Users select their language at welcome. Arya conducts dialogue and speaks in the chosen language.
- **Context-Aware Dialogue**: Guides users through a structured questionnaire sequence (City, Travel, Energy, Household & Diet) using a backend next-question generator.
- **Multimodal Text-to-Speech (TTS)**: Synthesizes spoken audio from Arya via Gemini's voice models with local browser SpeechSynthesis fallback (which auto-detects Devanagari ranges for Hindi voices).
- **Voice-Text Synchronization**: Displays status messages ("Arya is thinking...", "Synthesizing voice...") while generating response audio, delaying the question text bubble rendering until speech playback actively begins.
- **Automated Parameter Extraction**: Extracts profile parameters directly from multilingual transcripts using structured JSON generation.

### Household Mode and Dynamic Scaling
- **Aggregated Analytics**: Supports switching between Personal and Household modes.
- **Dynamic Calculation**: Scales yearly emissions, monetary savings, tree equivalents, and sector breakdowns dynamically based on household size and shared efficiency calculations.
- **Global Theme Upgrades**: Supports global dark and light mode theme toggles across all pages, reading preferences from local storage and updating styles via CSS design system tokens.

### Supabase Cloud Synchronization and Guest Mode
- **Secure Authentication**: Includes an authentication system supporting login, registration, password recovery, and Guest Mode.
- **Automatic Migration**: Migrates all local data (`localStorage`) seamlessly to Supabase PostgreSQL tables upon a user's first login.

### Analytics and Future Simulations
- **Carbon Twin Simulations**: Allows users to simulate lifestyle changes (e.g., swapping vehicle commutes for public transit or switching to solar energy) and compare committed scenarios side-by-side.
- **Interactive Graphs**: Visualizes weekly and monthly footprint trends using Chart.js charts.
- **Smart Purchase Advisor**: Evaluates the ecological and financial payback period of major sustainability investments (e.g., electric two-wheelers, solar panels).

### Monthly Reports and Notifications
- **AI Report Generator**: Compiles detailed monthly, weekly, or quarterly summaries highlighting accomplishments, emission statistics, and next month's focus plan.
- **Flexible Export**: Features print-optimized layout styling for PDF downloads and an HTML5 Canvas-based summary card exporter for PNG shares.
- **Notification Center**: Houses alert notification preferences and feeds, accessible via a topbar bell dropdown.

---

## Technical Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Build & Tooling** | Vite | Frontend development server and bundle optimizer |
| **Frontend** | Vanilla JavaScript (ES6) | Responsive Single Page Application (SPA) architecture |
| **Styling** | Vanilla CSS | Custom utility classes, responsive grids, and design tokens |
| **Data Visualization** | Chart.js | Interactive charts and performance trend tracking |
| **Database & Auth** | Supabase | PostgreSQL cloud storage, Auth management, and Row Level Security (RLS) |
| **Backend API** | FastAPI (Python) | Proxy API for secure Gemini calls, parsing, and TTS synthesis |
| **AI Integration** | Gemini API | Models `gemini-2.5-flash` (Text) and `gemini-2.5-flash-preview-tts` (Audio) |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository and install frontend dependencies**:
   ```bash
   npm install
   ```

2. **Install Python backend dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

### Configuration

Set up the following environment variables in a `.env` file at the root of the project, or within your shell environment:

```env
# Gemini API Key (Required for backend services)
GEMINI_API_KEY="your-gemini-api-key"

# Supabase Credentials (Optional: can also be configured directly via the Settings UI)
VITE_SUPABASE_URL="your-supabase-project-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### Execution

1. **Start the FastAPI Backend**:
   ```bash
   python backend/main.py
   ```
   The backend proxy will start on `http://127.0.0.1:8000`. You can verify its health by visiting `http://127.0.0.1:8000/api/health`.

2. **Start the Frontend Application**:
   In a separate terminal window, run:
   ```bash
   npm run dev
   ```
   The Vite development server will open the application at `http://localhost:3000` (or the next available port, e.g., `http://localhost:3001`).

---

## Project Structure

```text
sustaina/
├── index.html                    # Single Page Application root HTML
├── package.json                  # Frontend dependencies and execution scripts
├── vite.config.js                # Vite configuration
├── backend/
│   ├── main.py                   # FastAPI application (Gemini and TTS handlers)
│   └── requirements.txt          # Python packages
├── src/
│   ├── index.css                 # Custom design system stylesheet
│   ├── main.js                   # Application entry point and routing manager
│   ├── router.js                 # Hash-based client-side router
│   ├── components/
│   │   ├── charts.js             # Chart.js renderers
│   │   ├── icons.js              # Vector SVG inline library
│   │   ├── sidebar.js            # Core left sidebar navigation
│   │   └── topbar.js             # Top header bar (auth, bell, and household view)
│   ├── services/
│   │   ├── gemini.js             # Client API callers and speech fallback
│   │   └── supabase.js           # Supabase database client and queries
│   ├── data/
│   │   ├── emissions.js          # Carbon calculation engines
│   │   └── mockData.js           # Analytics chart baselines
│   ├── state/
│   │   └── store.js              # Global state manager and data syncer
│   ├── pages/
│   │   ├── dashboard.js          # Dynamic metrics home page
│   │   ├── auth.js               # User accounts panel
│   │   ├── timeline.js           # Chronological milestones view
│   │   ├── simulationHistory.js  # Carbon Twin comparison view
│   │   ├── notifications.js      # Notifications archive list
│   │   ├── analytics.js          # Long-term emission charts
│   │   ├── activityLog.js        # Logging categories
│   │   ├── aryaCoach.js          # Recommendation actions panel
│   │   ├── insights.js           # Carbon insights and totals
│   │   ├── carbonTwin.js         # Interactive twin sliders
│   │   ├── reports.js            # Monthly reports compiler
│   │   ├── goals.js              # Habit milestones targets
│   │   ├── profile.js            # Level statistics and achievements
│   │   ├── settings.js           # Key configurations panel
│   │   ├── community.js          # Shared leaderboard
│   │   └── onboarding.js         # Conversational voice wizard
```

---

## Carbon Calculation Engine

Calculations are built utilizing 2024 CEA (Central Electricity Authority) and MoSPI (Ministry of Statistics and Programme Implementation) statistics for Indian context accuracy:
- **Electricity**: State-wise grid emission factors (e.g., Maharashtra: 0.79, Karnataka: 0.74, Delhi: 0.80 kg CO₂/kWh).
- **Transport**: Mode-specific emission factors per kilometer (Car: 0.192, Bike: 0.089, Metro: 0.041, Bus: 0.031, Train: 0.014 kg CO₂).
- **Diet**: Meal-specific emission factors (Vegan: 0.50, Vegetarian: 0.75, Chicken: 2.45, Mutton: 5.50 kg CO₂).
- **LPG**: 37.5 kg CO₂ per domestic cylinder.
- **Monetary Savings**: Evaluated using real-time baseline Indian fuel costs, average state electricity tariffs, and LPG pricing.


## Author

**Aryan Medigeri** — Built with commitment to a sustainable India.

> "You don't have to be perfect. You just have to start." — Arya
