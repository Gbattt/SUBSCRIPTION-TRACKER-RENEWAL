/**
 * Dynamic seed data for demonstration.
 * Generates renewal dates relative to the current date so "Renewing Soon" 
 * badges and dates are always visually active regardless of when the demo is viewed.
 */

function getOffsetDateISO(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const initialSubscriptions = [
  {
    id: 'sub-netflix',
    name: 'Netflix Premium',
    cost: 22.99,
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(3), // Renewing in 3 days (Renewing Soon)
    status: 'active',
    category: 'Streaming'
  },
  {
    id: 'sub-copilot',
    name: 'GitHub Copilot Pro',
    cost: 100.00,
    billingCycle: 'yearly',
    nextRenewalDate: getOffsetDateISO(5), // Renewing in 5 days (Renewing Soon)
    status: 'active',
    category: 'SaaS'
  },
  {
    id: 'sub-spotify',
    name: 'Spotify Family',
    cost: 16.99,
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(18), // Renewing in 18 days
    status: 'active',
    category: 'Streaming'
  },
  {
    id: 'sub-aws',
    name: 'AWS Infrastructure',
    cost: 45.00,
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(11), // Paused subscription for savings demo
    status: 'paused',
    category: 'Utilities'
  },
  {
    id: 'sub-gym',
    name: 'Equinox Gym Pass',
    cost: 85.00,
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(-2), // Overdue by 2 days
    status: 'active',
    category: 'Fitness'
  },
  {
    id: 'sub-adobe',
    name: 'Adobe Creative Cloud',
    cost: 659.88,
    billingCycle: 'yearly',
    nextRenewalDate: getOffsetDateISO(2), // Renewing in 2 days (Renewing Soon)
    status: 'active',
    category: 'SaaS'
  }
];
