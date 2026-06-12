// ═══════════════════════════════════════════
// SUSTAINA — Carbon Emission Factors & Calculation Engine
// Based on 2024 CEA/MoSPI Data (India-specific)
// ═══════════════════════════════════════════

// Electricity grid emission factors by state (kg CO₂/kWh)
export const GRID_FACTORS = {
  maharashtra: 0.79,
  karnataka: 0.74,
  delhi: 0.80,
  tamil_nadu: 0.76,
  gujarat: 0.89,
  rajasthan: 0.85,
  uttar_pradesh: 0.84,
  west_bengal: 0.82,
  telangana: 0.78,
  andhra_pradesh: 0.77,
  kerala: 0.55,
  punjab: 0.81,
  haryana: 0.83,
  madhya_pradesh: 0.86,
  default: 0.82
};

// City to state mapping
export const CITY_STATE_MAP = {
  mumbai: 'maharashtra', pune: 'maharashtra', nagpur: 'maharashtra',
  bangalore: 'karnataka', bengaluru: 'karnataka', mysore: 'karnataka',
  delhi: 'delhi', 'new delhi': 'delhi', noida: 'uttar_pradesh', gurgaon: 'haryana', gurugram: 'haryana',
  chennai: 'tamil_nadu', coimbatore: 'tamil_nadu', madurai: 'tamil_nadu',
  ahmedabad: 'gujarat', surat: 'gujarat', vadodara: 'gujarat',
  hyderabad: 'telangana', secunderabad: 'telangana',
  kolkata: 'west_bengal',
  jaipur: 'rajasthan', jodhpur: 'rajasthan', udaipur: 'rajasthan',
  lucknow: 'uttar_pradesh', varanasi: 'uttar_pradesh', kanpur: 'uttar_pradesh',
  kochi: 'kerala', thiruvananthapuram: 'kerala',
  chandigarh: 'punjab', amritsar: 'punjab',
  bhopal: 'madhya_pradesh', indore: 'madhya_pradesh',
  visakhapatnam: 'andhra_pradesh', vijayawada: 'andhra_pradesh'
};

// Transport emission factors (kg CO₂ per km)
export const TRANSPORT_FACTORS = {
  car_petrol: 0.192,
  car_diesel: 0.171,
  car_shared: 0.096,
  bike: 0.089,
  auto: 0.059,
  bus: 0.031,
  metro: 0.041,
  train: 0.014,
  walk: 0.000,
  cycle: 0.000,
  air_domestic: 0.133,
  air_international: 0.195
};

// Food emission factors (kg CO₂ per meal/serving)
export const FOOD_FACTORS = {
  vegan: 0.50,
  vegetarian: 0.75,
  chicken: 2.45,
  mutton: 5.50,
  fish: 1.34
};

// LPG/PNG factors
export const FUEL_FACTORS = {
  lpg_cylinder: 37.5,    // per 14.2 kg cylinder
  lpg_per_kg: 2.98,
  png_per_scm: 2.04
};

// Shopping factors (kg CO₂ per purchase)
export const SHOPPING_FACTORS = {
  smartphone: 70.0,
  laptop: 330.0,
  fast_fashion: 8.5,
  quality_clothing: 4.2,
  appliance: 150.0
};

// Waste factors (kg CO₂ per kg)
export const WASTE_FACTORS = {
  landfill: 0.47,
  recycled: 0.021,
  composted: 0.012
};

// Money cost factors
export const COST_FACTORS = {
  petrol_per_km: 8.75,      // ₹105/12 km
  bike_fuel_per_km: 2.63,   // ₹105/40 km
  metro_per_km: 1.80,
  auto_per_km: 15.0,
  bus_per_km: 0.75,
  electricity_per_unit: 7.5, // avg Indian tariff
  lpg_cylinder_price: 903
};

// ─── Calculation Functions ─── //

export function getGridFactor(city) {
  const normalized = city?.toLowerCase().trim() || '';
  const state = CITY_STATE_MAP[normalized] || 'default';
  return GRID_FACTORS[state] || GRID_FACTORS.default;
}

export function calcTransportEmission(mode, km) {
  const factor = TRANSPORT_FACTORS[mode] || 0;
  return parseFloat((factor * km).toFixed(2));
}

export function calcFoodEmission(mealType, count = 1) {
  const factor = FOOD_FACTORS[mealType] || FOOD_FACTORS.vegetarian;
  return parseFloat((factor * count).toFixed(2));
}

export function calcElectricityEmission(units, city) {
  const factor = getGridFactor(city);
  return parseFloat((units * factor).toFixed(2));
}

export function calcLPGEmission(cylinders) {
  return parseFloat((cylinders * FUEL_FACTORS.lpg_cylinder).toFixed(2));
}

export function calcDailyEmissions(profile) {
  const { primaryTransport, dailyTransportKm, diet, electricityUnits, lpgCylinders, city } = profile;

  const dailyTransport = calcTransportEmission(primaryTransport, dailyTransportKm || 0);
  
  // Assume 3 meals/day
  const mealFactor = diet === 'vegan' ? FOOD_FACTORS.vegan 
    : diet === 'vegetarian' ? FOOD_FACTORS.vegetarian
    : diet === 'occasional_nonveg' ? (FOOD_FACTORS.vegetarian * 5 + FOOD_FACTORS.chicken * 2) / 7
    : (FOOD_FACTORS.chicken * 5 + FOOD_FACTORS.vegetarian * 2) / 7;
  const dailyFood = parseFloat((mealFactor * 3).toFixed(2));
  
  const dailyElectricity = parseFloat(((electricityUnits || 200) * getGridFactor(city) / 30).toFixed(2));
  const dailyLPG = parseFloat(((lpgCylinders || 1) * FUEL_FACTORS.lpg_cylinder / 30).toFixed(2));
  
  return {
    transport: dailyTransport,
    food: dailyFood,
    electricity: dailyElectricity,
    lpg: dailyLPG,
    total: parseFloat((dailyTransport + dailyFood + dailyElectricity + dailyLPG).toFixed(2))
  };
}

export function calcAnnualEmissions(profile) {
  const daily = calcDailyEmissions(profile);
  return {
    transport: parseFloat((daily.transport * 365).toFixed(1)),
    food: parseFloat((daily.food * 365).toFixed(1)),
    energy: parseFloat(((daily.electricity + daily.lpg) * 365).toFixed(1)),
    shopping: 120, // estimated annual
    waste: 80,     // estimated annual
    total: parseFloat((daily.total * 365 + 200).toFixed(1)) // +200 for shopping+waste
  };
}

export function calcTreesEquivalent(kgCO2) {
  return Math.round(kgCO2 / 21);
}

export function calcMoneySaved(kgCO2Saved) {
  // Rough estimation based on transport and energy savings
  return Math.round(kgCO2Saved * 5.2); // avg ₹5.2 per kg CO₂ saved
}

// Sustainability Score (PSS) calculation
export function calcSustainabilityScore(profile) {
  let transport = 0;
  const mode = profile.primaryTransport;
  if (mode === 'walk' || mode === 'cycle') transport = 25;
  else if (mode === 'metro' || mode === 'bus' || mode === 'train') transport = 22;
  else if (mode === 'auto') transport = 17;
  else if (mode === 'bike') transport = (profile.dailyTransportKm || 15) < 20 ? 14 : 10;
  else if (mode === 'car_petrol' || mode === 'car_diesel') transport = (profile.dailyTransportKm || 20) < 20 ? 8 : 3;
  else transport = 12;

  let food = 0;
  if (profile.diet === 'vegan') food = 20;
  else if (profile.diet === 'vegetarian') food = 17;
  else if (profile.diet === 'occasional_nonveg') food = 13;
  else food = 9;

  let energy = 0;
  const units = profile.electricityUnits || 200;
  if (units < 100) energy = 25;
  else if (units < 200) energy = 20;
  else if (units < 300) energy = 15;
  else if (units < 500) energy = 10;
  else energy = 5;

  const shopping = 10; // default moderate
  const waste = 7;     // default some sorting

  return {
    transport, food, energy, shopping, waste,
    total: transport + food + energy + shopping + waste
  };
}

export function getScoreBand(score) {
  if (score >= 80) return { name: 'Eco Champion', emoji: '🌟', level: 5 };
  if (score >= 60) return { name: 'Green Guardian', emoji: '💚', level: 4 };
  if (score >= 40) return { name: 'Conscious Explorer', emoji: '🌱', level: 3 };
  if (score >= 20) return { name: 'On The Path', emoji: '🔄', level: 2 };
  return { name: 'Just Starting', emoji: '🌍', level: 1 };
}
