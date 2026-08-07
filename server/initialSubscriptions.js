/**
 * Server seed data for initial in-memory subscriptions array.
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
    cost: 22.99, // Base USD
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(3),
    status: 'active',
    category: 'Streaming'
  },
  {
    id: 'sub-copilot',
    name: 'GitHub Copilot Pro',
    cost: 100.00, // Base USD
    billingCycle: 'yearly',
    nextRenewalDate: getOffsetDateISO(5),
    status: 'active',
    category: 'SaaS'
  },
  {
    id: 'sub-spotify',
    name: 'Spotify Family',
    cost: 16.99, // Base USD
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(18),
    status: 'active',
    category: 'Streaming'
  },
  {
    id: 'sub-aws',
    name: 'AWS Infrastructure',
    cost: 45.00, // Base USD
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(11),
    status: 'paused',
    category: 'Utilities'
  },
  {
    id: 'sub-gym',
    name: 'Equinox Gym Pass',
    cost: 85.00, // Base USD
    billingCycle: 'monthly',
    nextRenewalDate: getOffsetDateISO(-2), // Overdue
    status: 'active',
    category: 'Fitness'
  },
  {
    id: 'sub-adobe',
    name: 'Adobe Creative Cloud',
    cost: 659.88, // Base USD
    billingCycle: 'yearly',
    nextRenewalDate: getOffsetDateISO(2),
    status: 'active',
    category: 'SaaS'
  }
];
