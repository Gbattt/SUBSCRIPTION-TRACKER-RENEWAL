/**
 * Server-side business logic, calculation math, and validation utilities.
 * Pure server computation module.
 */

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
];

export const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 90.0,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.38,
  AUD: 1.52,
  JPY: 155.0,
};

export function normalizeToMonthly(cost, billingCycle) {
  const numericCost = Number(cost) || 0;
  if (billingCycle === 'yearly') {
    return numericCost / 12;
  }
  return numericCost;
}

export function getDaysRemaining(nextRenewalDate, currentDate = new Date()) {
  if (!nextRenewalDate) return 0;

  let renewal;
  if (typeof nextRenewalDate === 'string') {
    const parts = nextRenewalDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      renewal = new Date(year, month, day);
    } else {
      renewal = new Date(nextRenewalDate);
    }
  } else {
    renewal = new Date(nextRenewalDate);
  }

  const targetMidnight = new Date(renewal.getFullYear(), renewal.getMonth(), renewal.getDate());
  const todayMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffInMs = targetMidnight.getTime() - todayMidnight.getTime();

  return Math.round(diffInMs / msPerDay);
}

export function isRenewingSoon(daysRemaining) {
  return daysRemaining >= 0 && daysRemaining <= 7;
}

export function isOverdue(daysRemaining) {
  return daysRemaining < 0;
}

export function convertFromUSD(amountInUSD, targetCurrency = 'USD') {
  const num = Number(amountInUSD) || 0;
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return num * rate;
}

export function convertToUSD(amountInTarget, fromCurrency = 'USD') {
  const num = Number(amountInTarget) || 0;
  const rate = EXCHANGE_RATES[fromCurrency] || 1.0;
  return num / rate;
}

/**
 * Transforms raw stored subscription object (with base USD cost)
 * into a presentational object with server-calculated properties for the client.
 */
export function formatSubscriptionForClient(sub, currency = 'USD') {
  const daysRemaining = getDaysRemaining(sub.nextRenewalDate);
  const displayCost = convertFromUSD(sub.cost, currency);

  return {
    ...sub,
    displayCost,
    daysRemaining,
    isRenewingSoon: isRenewingSoon(daysRemaining),
    isOverdue: isOverdue(daysRemaining)
  };
}

/**
 * Calculates dashboard metrics on server in base USD and converts to target currency.
 */
export function computeDashboardMetrics(subscriptions = [], currency = 'USD') {
  let totalMonthlyBurnUSD = 0;
  let pausedMonthlySavingsUSD = 0;
  let upcomingCount = 0;
  let overdueCount = 0;

  subscriptions.forEach(sub => {
    const monthlyCost = normalizeToMonthly(sub.cost, sub.billingCycle);

    if (sub.status === 'active') {
      totalMonthlyBurnUSD += monthlyCost;
    } else if (sub.status === 'paused') {
      pausedMonthlySavingsUSD += monthlyCost;
    }

    const daysLeft = getDaysRemaining(sub.nextRenewalDate);
    if (isOverdue(daysLeft)) {
      overdueCount += 1;
    } else if (isRenewingSoon(daysLeft)) {
      upcomingCount += 1;
    }
  });

  return {
    totalMonthlyBurn: convertFromUSD(totalMonthlyBurnUSD, currency),
    pausedMonthlySavings: convertFromUSD(pausedMonthlySavingsUSD, currency),
    upcomingCount,
    overdueCount
  };
}

/**
 * Validates incoming subscription payload for POST / PUT routes.
 */
export function validateSubscriptionInput({ name, cost, billingCycle, nextRenewalDate, category }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, error: 'Service name is required.' };
  }
  if (cost === undefined || cost === null || isNaN(cost) || Number(cost) <= 0) {
    return { valid: false, error: 'Cost must be a valid number greater than 0.' };
  }
  if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
    return { valid: false, error: 'Billing cycle must be either "monthly" or "yearly".' };
  }
  if (!nextRenewalDate || typeof nextRenewalDate !== 'string') {
    return { valid: false, error: 'Next renewal date is required (YYYY-MM-DD).' };
  }

  // Validate date format
  const dateParts = nextRenewalDate.split('-');
  if (dateParts.length !== 3 || isNaN(new Date(nextRenewalDate).getTime())) {
    return { valid: false, error: 'Invalid renewal date format.' };
  }

  return { valid: true };
}
