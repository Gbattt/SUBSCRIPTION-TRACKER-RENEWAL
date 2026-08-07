/**
 * Business logic utilities for Subscription Tracker & Renewal Dashboard.
 * All date calculations rely strictly on native JavaScript Date objects.
 */

/**
 * Normalizes a subscription cost to its monthly equivalent.
 * 
 * @param {number} cost - The subscription cost amount
 * @param {string} billingCycle - Either "monthly" or "yearly"
 * @returns {number} The cost converted to a monthly basis
 */
export function normalizeToMonthly(cost, billingCycle) {
  const numericCost = Number(cost) || 0;
  if (billingCycle === 'yearly') {
    return numericCost / 12;
  }
  return numericCost;
}

/**
 * Computes the integer difference in whole days between nextRenewalDate and today.
 * Truncates both dates to midnight (00:00:00.000) to ensure exact calendar day calculation.
 * 
 * @param {string|Date} nextRenewalDate - The renewal date (ISO string YYYY-MM-DD or Date object)
 * @param {Date} [currentDate=new Date()] - Optional reference date (defaults to now)
 * @returns {number} Integer number of days remaining until renewal (negative if overdue)
 */
export function getDaysRemaining(nextRenewalDate, currentDate = new Date()) {
  if (!nextRenewalDate) return 0;

  // Parse target renewal date
  let renewal;
  if (typeof nextRenewalDate === 'string') {
    // Append T00:00:00 to force local time parsing for YYYY-MM-DD strings
    const parts = nextRenewalDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      renewal = new Date(year, month, day);
    } else {
      renewal = new Date(nextRenewalDate);
    }
  } else {
    renewal = new Date(nextRenewalDate);
  }

  // Create clean midnight instances for accurate day difference
  const targetMidnight = new Date(renewal.getFullYear(), renewal.getMonth(), renewal.getDate());
  const todayMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffInMs = targetMidnight.getTime() - todayMidnight.getTime();

  return Math.round(diffInMs / msPerDay);
}

/**
 * Checks whether a subscription renewal date is within 7 days from today (inclusive and not overdue).
 * 
 * @param {number} daysRemaining - Number of days until renewal
 * @returns {boolean} True if renewing within 0 to 7 days inclusive
 */
export function isRenewingSoon(daysRemaining) {
  return daysRemaining >= 0 && daysRemaining <= 7;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
];

// Exchange rates relative to 1 USD base currency
export const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 90.0,  // 1 USD = ₹90
  EUR: 0.92,  // 1 USD = €0.92
  GBP: 0.78,  // 1 USD = £0.78
  CAD: 1.38,  // 1 USD = CA$1.38
  AUD: 1.52,  // 1 USD = A$1.52
  JPY: 155.0, // 1 USD = ¥155
};

export function getCurrencySymbol(currencyCode = 'USD') {
  const curr = CURRENCIES.find(c => c.code === currencyCode);
  return curr ? curr.symbol : '$';
}

/**
 * Converts a base USD amount to the target currency based on exchange rates.
 */
export function convertFromUSD(amountInUSD, targetCurrency = 'USD') {
  const num = Number(amountInUSD) || 0;
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return num * rate;
}

/**
 * Converts an amount from a given currency back to base USD.
 */
export function convertToUSD(amountInTarget, fromCurrency = 'USD') {
  const num = Number(amountInTarget) || 0;
  const rate = EXCHANGE_RATES[fromCurrency] || 1.0;
  return num / rate;
}

/**
 * Formats a base USD numerical value into the target currency with exchange rate conversion applied.
 * 
 * @param {number} amountInUSD - The base cost stored in USD
 * @param {string} [currencyCode='USD'] - Target currency
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amountInUSD, currencyCode = 'USD') {
  const converted = convertFromUSD(amountInUSD, currencyCode);
  const isJpy = currencyCode === 'JPY';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: isJpy ? 0 : 2,
    maximumFractionDigits: isJpy ? 0 : 2
  }).format(converted);
}

/**
 * Calculates total active monthly burn rate and upcoming renewals count.
 * 
 * @param {Array} subscriptions - List of subscription objects
 * @returns {{ totalMonthlyBurn: number, upcomingCount: number }}
 */
export function computeDashboardMetrics(subscriptions = []) {
  let totalMonthlyBurn = 0;
  let upcomingCount = 0;

  subscriptions.forEach(sub => {
    // Only active subscriptions count towards monthly burn rate
    if (sub.status === 'active') {
      totalMonthlyBurn += normalizeToMonthly(sub.cost, sub.billingCycle);
    }

    // Count renewals happening within 7 days
    const daysLeft = getDaysRemaining(sub.nextRenewalDate);
    if (isRenewingSoon(daysLeft)) {
      upcomingCount += 1;
    }
  });

  return {
    totalMonthlyBurn,
    upcomingCount
  };
}
