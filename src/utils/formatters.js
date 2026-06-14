/**
 * Utility functions for formatting values throughout the Sustaina app.
 */

/**
 * Formats a number as Indian Rupees (INR).
 * @param {number} value 
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats a date string into a readable format.
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formats carbon emissions with units.
 * @param {number} value kg CO2e
 * @returns {string}
 */
export function formatCarbon(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} tonnes CO₂e`;
  }
  return `${value.toFixed(1)} kg CO₂e`;
}

/**
 * Extracts initials from a name.
 * @param {string} name 
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return 'A';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}
