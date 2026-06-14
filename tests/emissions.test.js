import { describe, it, expect } from 'vitest';
import {
  getGridFactor,
  calcTransportEmission,
  calcFoodEmission,
  calcElectricityEmission,
  calcLPGEmission,
  calcDailyEmissions,
  calcAnnualEmissions,
  calcTreesEquivalent,
  calcMoneySaved,
  calcSustainabilityScore,
  getScoreBand
} from '../src/data/emissions.js';

describe('Carbon Calculations Engine', () => {
  describe('getGridFactor', () => {
    it('returns correct factors for specific Indian cities', () => {
      expect(getGridFactor('pune')).toBe(0.79);
      expect(getGridFactor('mumbai')).toBe(0.79);
      expect(getGridFactor('bangalore')).toBe(0.74);
      expect(getGridFactor('delhi')).toBe(0.80);
      expect(getGridFactor('kochi')).toBe(0.55);
    });

    it('returns default grid factor for unknown cities', () => {
      expect(getGridFactor('unknown_city')).toBe(0.82);
      expect(getGridFactor(null)).toBe(0.82);
    });
  });

  describe('calcTransportEmission', () => {
    it('calculates emission correctly based on transport mode and distance', () => {
      expect(calcTransportEmission('car_petrol', 10)).toBe(1.92);
      expect(calcTransportEmission('bike', 100)).toBe(8.90);
      expect(calcTransportEmission('metro', 50)).toBe(2.05);
      expect(calcTransportEmission('walk', 10)).toBe(0.00);
      expect(calcTransportEmission('unknown', 10)).toBe(0.00);
    });
  });

  describe('calcFoodEmission', () => {
    it('calculates emission correctly based on diet and meal count', () => {
      expect(calcFoodEmission('vegan', 3)).toBe(1.5);
      expect(calcFoodEmission('vegetarian', 3)).toBe(2.25);
      expect(calcFoodEmission('chicken', 1)).toBe(2.45);
      expect(calcFoodEmission('mutton', 2)).toBe(11.0);
      expect(calcFoodEmission('unknown', 2)).toBe(1.50); // defaults to vegetarian
    });
  });

  describe('calcElectricityEmission', () => {
    it('calculates emission correctly based on units and city factor', () => {
      expect(calcElectricityEmission(100, 'mumbai')).toBe(79.0);
      expect(calcElectricityEmission(200, 'bangalore')).toBe(148.0);
      expect(calcElectricityEmission(100, 'unknown')).toBe(82.0);
    });
  });

  describe('calcLPGEmission', () => {
    it('calculates emission correctly for cylinders', () => {
      expect(calcLPGEmission(1)).toBe(37.5);
      expect(calcLPGEmission(2)).toBe(75.0);
    });
  });

  describe('calcDailyEmissions', () => {
    it('calculates correct daily breakdown and total emissions', () => {
      const profile = {
        primaryTransport: 'bike',
        dailyTransportKm: 20,
        diet: 'vegetarian',
        electricityUnits: 300,
        lpgCylinders: 1,
        city: 'pune'
      };

      const result = calcDailyEmissions(profile);
      expect(result.transport).toBe(1.78); // 20 * 0.089
      expect(result.food).toBe(2.25); // vegetarian * 3
      expect(result.electricity).toBe(7.9); // 300 * 0.79 / 30
      expect(result.lpg).toBe(1.25); // 1 * 37.5 / 30
      expect(result.total).toBe(13.18); // 1.78 + 2.25 + 7.9 + 1.25
    });
  });

  describe('calcAnnualEmissions', () => {
    it('calculates correct annual emissions based on daily emissions + shopping/waste', () => {
      const profile = {
        primaryTransport: 'walk',
        dailyTransportKm: 0,
        diet: 'vegan',
        electricityUnits: 150,
        lpgCylinders: 0,
        city: 'kochi'
      };

      const daily = calcDailyEmissions(profile);
      const result = calcAnnualEmissions(profile);
      
      expect(result.transport).toBe(parseFloat((daily.transport * 365).toFixed(1)));
      expect(result.food).toBe(parseFloat((daily.food * 365).toFixed(1)));
      expect(result.energy).toBe(parseFloat(((daily.electricity + daily.lpg) * 365).toFixed(1)));
      expect(result.shopping).toBe(120);
      expect(result.waste).toBe(80);
      expect(result.total).toBe(parseFloat((daily.total * 365 + 200).toFixed(1)));
    });
  });

  describe('calcTreesEquivalent', () => {
    it('returns trees equivalent matching carbon amount', () => {
      expect(calcTreesEquivalent(210)).toBe(10);
      expect(calcTreesEquivalent(0)).toBe(0);
    });
  });

  describe('calcMoneySaved', () => {
    it('calculates average monetary savings', () => {
      expect(calcMoneySaved(10)).toBe(52);
    });
  });

  describe('calcSustainabilityScore', () => {
    it('calculates correct score metrics', () => {
      const profile = {
        primaryTransport: 'bike',
        dailyTransportKm: 10,
        diet: 'vegetarian',
        electricityUnits: 100,
        lpgCylinders: 1,
        city: 'bangalore'
      };
      
      const activities = [
        { date: '2026-06-01' },
        { date: '2026-06-02' },
        { date: '2026-06-03' }
      ];

      const goals = [
        { progress: 100 },
        { progress: 50 }
      ];

      const score = calcSustainabilityScore(profile, activities, goals);
      expect(score.carbonReduction).toBeGreaterThanOrEqual(0);
      expect(score.carbonReduction).toBeLessThanOrEqual(30);
      expect(score.consistency).toBe(11); // round(3/7 * 25) = 11
      expect(score.goalCompletion).toBe(13); // round(1/2 * 25) = 13
      expect(score.activityLogging).toBe(6); // 3 * 2 = 6
      expect(score.total).toBe(score.carbonReduction + score.consistency + score.goalCompletion + score.activityLogging);
    });
  });

  describe('getScoreBand', () => {
    it('returns correct score band details', () => {
      expect(getScoreBand(85).name).toBe('Eco Champion');
      expect(getScoreBand(65).name).toBe('Green Guardian');
      expect(getScoreBand(45).name).toBe('Conscious Explorer');
      expect(getScoreBand(25).name).toBe('On The Path');
      expect(getScoreBand(10).name).toBe('Just Starting');
    });
  });
});
