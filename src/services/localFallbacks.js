/**
 * Local rule-based fallback generators for when the AI backend is unavailable.
 */

export function parseProfileLocally(text) {
  const normalized = text.toLowerCase();
  const updates = {};

  // Name
  const nameMatch = text.match(/(my name is|i am|call me|this is) ([A-Z][a-zA-Z\s]{1,15})/i);
  if (nameMatch && nameMatch[2]) {
    updates.name = nameMatch[2].trim();
  }

  // City normalization
  const cities = ['pune', 'mumbai', 'bangalore', 'delhi', 'chennai', 'hyderabad', 'kochi', 'kolkata', 'jaipur', 'lucknow', 'ahmedabad'];
  for (const city of cities) {
    if (normalized.includes(city)) {
      updates.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Transport mode
  if (normalized.includes('car')) {
    updates.primaryTransport = normalized.includes('diesel') ? 'car_diesel' : 'car_petrol';
  } else if (normalized.includes('bike') || normalized.includes('two wheeler') || normalized.includes('motorcycle')) {
    updates.primaryTransport = 'bike';
  } else if (normalized.includes('metro') || normalized.includes('subway')) {
    updates.primaryTransport = 'metro';
  } else if (normalized.includes('bus')) {
    updates.primaryTransport = 'bus';
  } else if (normalized.includes('walk') || normalized.includes('foot')) {
    updates.primaryTransport = 'walk';
  } else if (normalized.includes('cycle') || normalized.includes('bicycle')) {
    updates.primaryTransport = 'cycle';
  }

  // Distance km
  const kmMatch = normalized.match(/(\d+)\s*(km|kilometer|kilometres)/);
  if (kmMatch && kmMatch[1]) {
    updates.dailyTransportKm = parseInt(kmMatch[1]);
  }

  // Diet
  if (normalized.includes('vegan')) {
    updates.diet = 'vegan';
  } else if (normalized.includes('vegetarian') || normalized.includes('veg')) {
    updates.diet = 'vegetarian';
  } else if (normalized.includes('non veg') || normalized.includes('chicken') || normalized.includes('meat')) {
    updates.diet = normalized.includes('sometimes') || normalized.includes('occasional') ? 'occasional_nonveg' : 'non_vegetarian';
  }

  // Household size
  const hhMatch = normalized.match(/(\d+)\s*(people|family|member|person)/);
  if (hhMatch && hhMatch[1]) {
    updates.householdSize = parseInt(hhMatch[1]);
  }

  // Electricity Units
  const electricityMatch = normalized.match(/(\d+)\s*(unit|kwh)/);
  if (electricityMatch && electricityMatch[1]) {
    updates.electricityUnits = parseInt(electricityMatch[1]);
  }

  return updates;
}

export function generateRecommendationsLocally(profile, activities, memory) {
  const dailyKm = profile.dailyTransportKm || 20;
  const diet = profile.diet || 'vegetarian';
  const units = profile.electricityUnits || 280;

  let transportCO2 = dailyKm * 365 * 0.192;
  let foodCO2 = diet === 'vegan' ? 0.50 * 3 * 365 : 0.75 * 3 * 365;
  let energyCO2 = units * 0.8 * 12;

  let topImpact = 'Transport';
  if (foodCO2 > transportCO2 && foodCO2 > energyCO2) topImpact = 'Food';
  else if (energyCO2 > transportCO2) topImpact = 'Home Energy';

  const isIgnored = (text) => (memory.ignoredSuggestions || []).some(t => text.toLowerCase().includes(t.toLowerCase()));

  let list = [
    'Switch to public transport or metro for commutes this week',
    'Set air conditioning to 26°C instead of 22°C',
    'Add one more plant-based meal to your diet',
    'Ensure all electronics are unplugged from wall switches'
  ];

  if (topImpact === 'Transport') list[0] = 'Commute by metro or bus on Tuesdays and Thursdays';
  else if (topImpact === 'Food') list[2] = 'Try an all-vegan day on Monday to lower food impact';
  else list[1] = 'Limit AC running hours to 4 hours per day';

  list = list.filter(item => !isIgnored(item));

  return {
    weekRange: 'Conversational Weekly Plan',
    progressPct: 60,
    recommendations: list,
    cards: [
      {
        type: 'biggest_impact',
        title: 'Biggest Impact',
        desc: topImpact === 'Transport' ? 'Switch 2 car rides to Metro.' : 'Swap non-veg meal to veggie.',
        impact: '− save 4.8 kg CO₂',
        secondary: '+ save ₹140',
        icon: '🔥',
        bgColor: '#fff5e5'
      },
      {
        type: 'cheapest_improvement',
        title: 'Cheapest Improvement',
        desc: 'Switch AC to 26°C at night.',
        impact: '+ save ₹95 & 1.8 kg CO₂',
        secondary: '',
        icon: '⚡',
        bgColor: '#e5f5e5'
      },
      {
        type: 'easy_win',
        title: 'Easy Win',
        desc: 'Log 3 cycle rides in active logs.',
        impact: '− save 2.1 kg CO₂',
        secondary: '',
        icon: '🥗',
        bgColor: '#f0f8ea'
      },
      {
        type: 'weekly_challenge',
        title: 'Weekly Challenge',
        desc: 'No-Cab Wednesday!',
        impact: 'Use public transport for one day.',
        secondary: '',
        icon: '🏆',
        bgColor: '#fef3d0'
      }
    ]
  };
}

export function generatePurchaseAdviceLocally(name, category, cost, runningCost, energyUsage, lifetime) {
  const baselineRunningCost = category === 'transport' ? 6000 : 2500;
  const annualSavings = Math.round(((baselineRunningCost - runningCost) * 12));
  const payback = annualSavings > 0 ? (cost / annualSavings) : lifetime;

  if (payback <= lifetime * 0.4) {
    return { recommendation: 'Yes', explanation: `Installing ${name} is highly recommended. It pays back within ${payback.toFixed(1)} years.` };
  } else if (payback <= lifetime * 0.8) {
    return { recommendation: 'Consider', explanation: `${name} has a moderate payback period of ${payback.toFixed(1)} years.` };
  } else {
    return { recommendation: 'No', explanation: `${name} is not financially optimal.` };
  }
}

export function generateReportLocally(type, period, activities) {
  const totalCO2 = activities.reduce((sum, a) => sum + parseFloat(a.co2 || 0), 0);
  return {
    summary: `Your carbon footprint summary for ${period} reflects highly active sustainable logging.`,
    achievements: `You successfully completed your sustainability goals.`,
    savings: `You avoided ${totalCO2.toFixed(1)} kg of CO₂ emissions.`,
    emissionBreakdown: `Transport accounted for roughly 48% of total emissions.`,
    topImpactSource: `Transport remains your primary emission source.`,
    carbonTwinProgress: `You are tracking 14% closer to your target.`,
    recommendations: ['Transition commute to public transport.', 'Adopt vegetarian meals.'],
    nextMonthPlan: `Focus on lowering transport emissions.`
  };
}
