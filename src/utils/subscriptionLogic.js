/**
 * Presentation-only UI display helpers for Frontend.
 * NO calculation math or date math — all computations are performed on the server.
 */

export const CATEGORIES = ['Streaming', 'SaaS', 'Utilities', 'Fitness', 'Other'];

export function getCategoryStyle(category = 'Other') {
  switch (category) {
    case 'Streaming':
      return 'bg-red-950/70 text-red-300 border-red-800/60';
    case 'SaaS':
      return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
    case 'Utilities':
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    case 'Fitness':
      return 'bg-orange-950/70 text-orange-300 border-orange-800/60';
    case 'Other':
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  }
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

export function getCurrencySymbol(currencyCode = 'USD') {
  const curr = CURRENCIES.find(c => c.code === currencyCode);
  return curr ? curr.symbol : '$';
}

/**
 * Pure presentation currency formatter for pre-converted numbers from API.
 */
export function formatDisplayCurrency(amount, currencyCode = 'USD') {
  const num = Number(amount) || 0;
  const isJpy = currencyCode === 'JPY';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: isJpy ? 0 : 2,
    maximumFractionDigits: isJpy ? 0 : 2
  }).format(num);
}
