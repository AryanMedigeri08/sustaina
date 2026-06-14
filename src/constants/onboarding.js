/**
 * Onboarding related constants and configurations.
 */

export const ONBOARDING_STEPS = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'conversation', label: 'Voice Onboarding' },
  { key: 'review', label: 'Review & Complete' },
  { key: 'goals', label: 'Your Goals' },
  { key: 'complete', label: "You're all set!" },
];

export const GOAL_OPTIONS = [
  { icon: 'globe', text: 'Reduce my carbon footprint', value: 'reduce_footprint' },
  { icon: 'money', text: 'Save money on monthly bills', value: 'save_money' },
  { icon: 'transport', text: 'Use public transport more', value: 'public_transport' },
  { icon: 'food', text: 'Eat more sustainably', value: 'eat_sustainable' },
  { icon: 'waste', text: 'Reduce waste', value: 'reduce_waste' },
  { icon: 'leaf', text: 'Live a more minimal lifestyle', value: 'minimal_lifestyle' },
  { icon: 'energy', text: 'Switch to clean energy', value: 'clean_energy' },
  { icon: 'tree', text: 'Plant more trees', value: 'plant_trees' },
];

export const INITIAL_ONBOARDING_DATA = {
  language: 'english',
  name: '',
  city: '',
  householdSize: null,
  homeType: '',
  primaryTransport: '',
  diet: '',
  workType: '',
  electricitySource: '',
  electricityUnits: null,
  lpgCylinders: null,
  dailyTransportKm: null,
  goals: [],
};

export const ARYA_STATUS_MESSAGES = [
  "Arya is thinking...",
  "Formulating custom response...",
  "Synthesizing voice audio...",
  "Tuning high-quality speech...",
  "Generating Arya's reply...",
  "Preparing audio response..."
];
