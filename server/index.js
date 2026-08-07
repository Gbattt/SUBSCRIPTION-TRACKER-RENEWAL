import express from 'express';
import cors from 'cors';
import { initialSubscriptions } from './initialSubscriptions.js';
import {
  formatSubscriptionForClient,
  computeDashboardMetrics,
  validateSubscriptionInput,
  convertToUSD,
  EXCHANGE_RATES,
  CURRENCIES
} from './subscriptionLogic.js';

const app = express();
const PORT = 4000;

// CORS setup for Vite default dev ports
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// In-memory data store
let subscriptions = [...initialSubscriptions];

// GET /api/subscriptions?currency=USD
app.get('/api/subscriptions', (req, res) => {
  const currency = req.query.currency || 'USD';
  const clientSubscriptions = subscriptions.map(sub => formatSubscriptionForClient(sub, currency));
  const metrics = computeDashboardMetrics(subscriptions, currency);

  res.json({
    subscriptions: clientSubscriptions,
    metrics
  });
});

// POST /api/subscriptions
app.post('/api/subscriptions', (req, res) => {
  const { name, cost, billingCycle, nextRenewalDate, category = 'Other', currency = 'USD', id } = req.body;

  const validation = validateSubscriptionInput({ name, cost, billingCycle, nextRenewalDate, category });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Convert cost in active currency to base USD for storage
  const baseCostUSD = convertToUSD(cost, currency);

  const newSub = {
    id: id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    cost: baseCostUSD,
    billingCycle,
    nextRenewalDate,
    category: category || 'Other',
    status: req.body.status || 'active'
  };

  subscriptions.unshift(newSub);

  const clientSub = formatSubscriptionForClient(newSub, currency);
  const metrics = computeDashboardMetrics(subscriptions, currency);

  res.status(201).json({
    subscription: clientSub,
    metrics
  });
});

// PUT /api/subscriptions/:id
app.put('/api/subscriptions/:id', (req, res) => {
  const { id } = req.params;
  const { name, cost, billingCycle, nextRenewalDate, category = 'Other', currency = 'USD', status } = req.body;

  const index = subscriptions.findIndex(sub => sub.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Subscription not found.' });
  }

  const validation = validateSubscriptionInput({ name, cost, billingCycle, nextRenewalDate, category });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const baseCostUSD = convertToUSD(cost, currency);

  const updatedSub = {
    ...subscriptions[index],
    name: name.trim(),
    cost: baseCostUSD,
    billingCycle,
    nextRenewalDate,
    category: category || 'Other',
    status: status || subscriptions[index].status
  };

  subscriptions[index] = updatedSub;

  const clientSub = formatSubscriptionForClient(updatedSub, currency);
  const metrics = computeDashboardMetrics(subscriptions, currency);

  res.json({
    subscription: clientSub,
    metrics
  });
});

// PATCH /api/subscriptions/:id/toggle
app.patch('/api/subscriptions/:id/toggle', (req, res) => {
  const { id } = req.params;
  const currency = req.query.currency || 'USD';

  const index = subscriptions.findIndex(sub => sub.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Subscription not found.' });
  }

  subscriptions[index] = {
    ...subscriptions[index],
    status: subscriptions[index].status === 'active' ? 'paused' : 'active'
  };

  const clientSub = formatSubscriptionForClient(subscriptions[index], currency);
  const metrics = computeDashboardMetrics(subscriptions, currency);

  res.json({
    subscription: clientSub,
    metrics
  });
});

// DELETE /api/subscriptions/:id
app.delete('/api/subscriptions/:id', (req, res) => {
  const { id } = req.params;
  const currency = req.query.currency || 'USD';

  const index = subscriptions.findIndex(sub => sub.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Subscription not found.' });
  }

  const [deletedSub] = subscriptions.splice(index, 1);
  const clientSub = formatSubscriptionForClient(deletedSub, currency);
  const metrics = computeDashboardMetrics(subscriptions, currency);

  res.json({
    subscription: clientSub,
    metrics
  });
});

// POST /api/subscriptions/reset (Reset in-memory store to initial seed)
app.post('/api/subscriptions/reset', (req, res) => {
  const currency = req.query.currency || 'USD';
  subscriptions = [...initialSubscriptions];

  const clientSubscriptions = subscriptions.map(sub => formatSubscriptionForClient(sub, currency));
  const metrics = computeDashboardMetrics(subscriptions, currency);

  res.json({
    subscriptions: clientSubscriptions,
    metrics
  });
});

// GET /api/exchange-rates
app.get('/api/exchange-rates', (req, res) => {
  res.json({
    exchangeRates: EXCHANGE_RATES,
    currencies: CURRENCIES
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express backend server listening on http://127.0.0.1:${PORT}`);
});
