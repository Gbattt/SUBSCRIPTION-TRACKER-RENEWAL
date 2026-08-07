import React, { useState } from 'react';
import Header from './components/Header';
import SubscriptionForm from './components/SubscriptionForm';
import MetricsCards from './components/MetricsCards';
import SubscriptionGrid from './components/SubscriptionGrid';
import { initialSubscriptions } from './data/initialSubscriptions';
import { computeDashboardMetrics, normalizeToMonthly } from './utils/subscriptionLogic';

export default function App() {
  // Main reactive state: array of subscriptions seeded with initial demo items
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  // Selected currency state (USD, EUR, GBP, INR, CAD, AUD, JPY)
  const [currency, setCurrency] = useState('USD');

  // Add new active subscription
  const handleAddSubscription = (newSub) => {
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  // Toggle status between 'active' and 'paused'
  const handleToggleStatus = (id) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, status: sub.status === 'active' ? 'paused' : 'active' }
          : sub
      )
    );
  };

  // Delete subscription
  const handleDeleteSubscription = (id) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  // Reset to seed data
  const handleResetSeedData = () => {
    setSubscriptions(initialSubscriptions);
  };

  // Reactive metrics computation on every state update
  const { totalMonthlyBurn, upcomingCount } = computeDashboardMetrics(subscriptions);

  // Active vs Paused summary stats
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const pausedSubs = subscriptions.filter((s) => s.status === 'paused');
  
  // Calculate total monthly savings currently achieved by paused items
  const pausedMonthlySavings = pausedSubs.reduce(
    (acc, sub) => acc + normalizeToMonthly(sub.cost, sub.billingCycle),
    0
  );

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Header with Currency Switcher */}
        <Header
          totalActiveCount={activeSubs.length}
          totalPausedCount={pausedSubs.length}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        {/* 1. ONBOARDING FORM (top of page in a card) */}
        <SubscriptionForm
          onAddSubscription={handleAddSubscription}
          currency={currency}
        />

        {/* 2. METRICS ROW (two cards side by side, stacking vertically on mobile) */}
        <MetricsCards
          totalMonthlyBurn={totalMonthlyBurn}
          upcomingCount={upcomingCount}
          pausedCount={pausedSubs.length}
          pausedMonthlySavings={pausedMonthlySavings}
          currency={currency}
        />

        {/* 3. SUBSCRIPTION GRID (table on desktop, stacked cards on mobile) */}
        <SubscriptionGrid
          subscriptions={subscriptions}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteSubscription}
          currency={currency}
        />

        {/* FOOTER & DEMO CONTROLS */}
        <footer className="mt-12 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Subscription Tracker & Renewal Dashboard. Built with React & Tailwind CSS.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSeedData}
              className="text-red-500 hover:text-red-400 font-bold underline cursor-pointer"
            >
              Reset Seed Demo Data
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
