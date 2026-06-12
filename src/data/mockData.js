// ═══════════════════════════════════════════
// SUSTAINA — Mock Data for Demo
// Realistic 30-day data for "Aryan Sharma" in Pune
// ═══════════════════════════════════════════

export const DEFAULT_PROFILE = {
  name: 'Aryan Sharma',
  ageGroup: '26-35',
  city: 'Pune',
  state: 'Maharashtra',
  householdSize: 4,
  homeType: 'Apartment',
  diet: 'vegetarian',
  primaryTransport: 'bike',
  dailyTransportKm: 18,
  electricityUnits: 280,
  lpgCylinders: 1,
  usesPNG: false,
  workType: 'Office',
  electricitySource: 'MSEDCL (State Grid)',
  sustainabilityGoals: ['reduce_footprint', 'save_money', 'public_transport'],
  language: 'en',
  memberSince: '2024-01-15',
  onboardingCompleted: false,
  level: 3,
  levelName: 'Eco Explorer',
  xp: 1280,
  xpNext: 2000,
};

export const MOCK_ACTIVITIES = [
  { id: 'a1', category: 'transport', name: 'Bike Ride', detail: '12 km • Personal', co2: 2.84, cost: 0, icon: '🏍️', time: 'Today, 8:30 AM', date: '2026-06-12' },
  { id: 'a2', category: 'transport', name: 'Metro', detail: '13 km • Metro', co2: 1.59, cost: 25, icon: '🚇', time: 'Today, 9:00 AM', date: '2026-06-12' },
  { id: 'a3', category: 'food', name: 'Chicken Meal', detail: 'Lunch • 1 Serve', co2: 1.88, cost: 180, icon: '🍗', time: 'Yesterday, 1:15 PM', date: '2026-06-11' },
  { id: 'a4', category: 'energy', name: 'Electricity Usage', detail: '9.3 kWh • 1 day', co2: 3.84, cost: 70, icon: '⚡', time: 'Today, 10:00 AM', date: '2026-06-12' },
  { id: 'a5', category: 'transport', name: 'Car Ride', detail: '20 km • Office', co2: 6.13, cost: 175, icon: '🚗', time: '2 May, 7:41 PM', date: '2026-06-10' },
  { id: 'a6', category: 'food', name: 'Veg Thali', detail: 'Dinner • Home', co2: 0.75, cost: 60, icon: '🥗', time: 'Today, 8:00 PM', date: '2026-06-12' },
  { id: 'a7', category: 'transport', name: 'Bus Ride', detail: '8 km • City Bus', co2: 0.25, cost: 10, icon: '🚌', time: 'Yesterday, 6:30 PM', date: '2026-06-11' },
  { id: 'a8', category: 'shopping', name: 'T-shirt Purchase', detail: 'Fast Fashion', co2: 8.50, cost: 799, icon: '👕', time: '10 Jun, 3:00 PM', date: '2026-06-10' },
  { id: 'a9', category: 'energy', name: 'LPG Cylinder', detail: '14.2 kg refill', co2: 37.50, cost: 903, icon: '🔥', time: '8 Jun, 10:00 AM', date: '2026-06-08' },
  { id: 'a10', category: 'waste', name: 'Composting', detail: '2 kg organic waste', co2: 0.02, cost: 0, icon: '♻️', time: 'Today, 7:00 AM', date: '2026-06-12' },
];

// 30-day emission trend data
export const EMISSION_TREND = {
  daily: [
    { date: '1 May', value: 7.2 },
    { date: '5 May', value: 8.1 },
    { date: '8 May', value: 6.5 },
    { date: '12 May', value: 9.3 },
    { date: '15 May', value: 7.8 },
    { date: '18 May', value: 6.2 },
    { date: '22 May', value: 8.4 },
    { date: '25 May', value: 5.9 },
    { date: '29 May', value: 7.1 },
    { date: '1 Jun', value: 6.8 },
    { date: '5 Jun', value: 7.5 },
    { date: '8 Jun', value: 8.9 },
    { date: '12 Jun', value: 6.4 },
  ],
  weekly: [
    { date: 'Week 1', value: 52 },
    { date: 'Week 2', value: 48 },
    { date: 'Week 3', value: 55 },
    { date: 'Week 4', value: 44 },
  ],
  monthly: [
    { date: 'Jan', value: 245 },
    { date: 'Feb', value: 230 },
    { date: 'Mar', value: 220 },
    { date: 'Apr', value: 235 },
    { date: 'May', value: 210 },
    { date: 'Jun', value: 198 },
  ]
};

// Category breakdown
export const CATEGORY_BREAKDOWN = {
  transport: { value: 40, co2: 1095, label: 'Transport', color: '#2d5016' },
  food: { value: 25, co2: 685, label: 'Food', color: '#4a8528' },
  energy: { value: 18, co2: 493, label: 'Home Energy', color: '#6bb344' },
  shopping: { value: 12, co2: 329, label: 'Shopping', color: '#d4a843' },
  waste: { value: 5, co2: 137, label: 'Waste', color: '#9e9e93' },
};

// Weekly coaching data
export const COACHING_DATA = {
  weekRange: '9 Jun – 15 Jun',
  progressPct: 68,
  recommendations: [
    'Switch to metro for Hinjewadi commute on Tue & Thu',
    'Set AC to 26°C instead of 22°C tonight',
    'Try veg lunch on Wednesday',
    'Log your bike ride to track savings'
  ],
  cards: [
    {
      type: 'biggest_impact',
      title: 'Biggest Impact',
      desc: 'Switch 2 cab rides to metro this week.',
      impact: '− save 4.2 kg CO₂',
      secondary: '+ save ₹114 & 2.1 kg CO₂',
      icon: '🔥',
      bgColor: '#fff5e5'
    },
    {
      type: 'cheapest_improvement',
      title: 'Cheapest Improvement',
      desc: 'Unplug devices when not in use.',
      impact: '+ save ₹114 & 2.1 kg CO₂',
      secondary: '',
      icon: '⚡',
      bgColor: '#e5f5e5'
    },
    {
      type: 'easy_win',
      title: 'Easy Win',
      desc: 'Try soy milk 3 times this week.',
      impact: '− save 2.6 kg CO₂',
      secondary: '',
      icon: '🥗',
      bgColor: '#f0f8ea'
    },
    {
      type: 'weekly_challenge',
      title: 'Weekly Challenge',
      desc: 'No-Cab Wednesday.',
      impact: 'Take public transport every Wednesday.',
      secondary: '',
      icon: '🏆',
      bgColor: '#fef3d0'
    }
  ]
};

// Carbon Twin data
export const CARBON_TWIN = {
  current: {
    co2PerYear: 4.20,
    label: 'tonnes CO₂e / year'
  },
  future: {
    co2PerYear: 2.80,
    label: 'tonnes CO₂e / year',
    pctChanges: '70% recommended changes'
  },
  reduction: 1.40,
  moneySaved: 18000,
  treesSaved: 62,
  improvementPct: 38
};

// Goals data
export const GOALS_DATA = [
  {
    id: 'g1', title: 'Reduce Emissions', desc: 'Reduce annual emissions by 20%',
    icon: '🌍', progress: 63, target: '31 Dec 2026', color: 'green',
    bgColor: '#f0f8ea'
  },
  {
    id: 'g2', title: 'Save Money', desc: 'Save ₹10,000 through sustainable living.',
    icon: '💰', progress: 45, target: '31 Dec 2026', color: 'gold',
    bgColor: '#fef3d0'
  },
  {
    id: 'g3', title: 'Use Public Transport', desc: 'Use public transport 3 times a week.',
    icon: '🚇', progress: 70, target: '30 Jun 2026', color: 'green',
    bgColor: '#e5f5f0'
  },
  {
    id: 'g4', title: 'Eat More Plants', desc: 'Have 4 vegetarian meals per week.',
    icon: '🥦', progress: 80, target: '30 Jun 2026', color: 'green',
    bgColor: '#f0f8ea'
  },
];

// Achievements
export const ACHIEVEMENTS = [
  { id: 'first_log', name: 'First Log', icon: '📝', earned: true },
  { id: 'tree_saver', name: 'Tree Saver', icon: '🌳', earned: true },
  { id: 'challenge', name: 'Challenger', icon: '🏆', earned: true },
  { id: 'green_commuter', name: 'Green Commuter', icon: '🚇', earned: true },
  { id: 'energy_saver', name: 'Energy Saver', icon: '⚡', earned: false },
  { id: 'waste_warrior', name: 'Waste Warrior', icon: '♻️', earned: false },
  { id: 'plant_powered', name: 'Plant Powered', icon: '🥗', earned: false },
  { id: 'century', name: 'Century', icon: '💯', earned: false },
];

// Dashboard summary
export const DASHBOARD_SUMMARY = {
  annualFootprint: 2.74,
  footprintUnit: 'tonnes CO₂e / year',
  comparison: '12% lower than last month',
  co2Saved: { value: 12.5, unit: 'kg', trend: '↑ 9% vs last month' },
  moneySaved: { value: 320, unit: '₹', trend: '↑ 15% vs last month' },
  treesEquivalent: { value: 62, unit: 'trees', trend: '↑ 7% vs last month' },
  topImpactArea: 'Transport',
  topImpactPct: 42,
};

// Monthly report
export const REPORT_DATA = {
  month: 'May 2026',
  totalEmissions: 18.6,
  totalEmissionsUnit: 'kg CO₂e',
  reduction: 16,
  reductionUnit: '%',
  moneySaved: 320,
  treesEquivalent: 62,
  summary: 'You reduced your emissions by 16% compared to last month. Great job! Your biggest impact came from reduced transport and smart energy usage.'
};

// Insight for AI
export const AI_INSIGHT = {
  text: 'Your transport emissions are 42% higher than average users in Pune. Try using public transport or carpooling more often.',
  type: 'opportunity'
};
