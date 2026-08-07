import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SubscriptionForm from './components/SubscriptionForm';
import MetricsCards from './components/MetricsCards';
import SubscriptionGrid from './components/SubscriptionGrid';
import UndoToast from './components/UndoToast';
import { initialSubscriptions } from './data/initialSubscriptions';
import { computeDashboardMetrics, normalizeToMonthly } from './utils/subscriptionLogic';

const STORAGE_KEY = 'subscriptions_v1';

export default function App() {
  // Read initial subscriptions from localStorage or fallback to seed data
  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse subscriptions from localStorage:', e);
    }
    return initialSubscriptions;
  });

  // Selected currency state (USD, EUR, GBP, INR, CAD, AUD, JPY)
  const [currency, setCurrency] = useState('USD');

  // Currently editing subscription (null or subscription object)
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState({ show: false, item: null });
  const toastTimerRef = useRef(null);

  // Sync subscriptions state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('Failed to save subscriptions to localStorage:', e);
    }
  }, [subscriptions]);

  // Handle both Create new and Update existing in-place
  const handleAddOrUpdateSubscription = (subscriptionData) => {
    setSubscriptions((prev) => {
      const exists = prev.some((sub) => sub.id === subscriptionData.id);
      if (exists) {
        return prev.map((sub) => (sub.id === subscriptionData.id ? subscriptionData : sub));
      } else {
        return [subscriptionData, ...prev];
      }
    });

    setEditingSubscription(null);
  };

  // Start edit mode for a row
  const handleStartEdit = (sub) => {
    setEditingSubscription(sub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingSubscription(null);
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

  // Delete subscription with Undo Toast trigger
  const handleDeleteSubscription = (id) => {
    const itemToDelete = subscriptions.find((sub) => sub.id === id);
    if (!itemToDelete) return;

    // Clear existing toast timer if active
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    // Remove from state
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));

    // Exit edit mode if deleting the item currently being edited
    if (editingSubscription && editingSubscription.id === id) {
      setEditingSubscription(null);
    }

    // Show 5-second undo toast
    setUndoToast({ show: true, item: itemToDelete });

    toastTimerRef.current = setTimeout(() => {
      setUndoToast({ show: false, item: null });
    }, 5000);
  };

  // Undo delete handler
  const handleUndoDelete = () => {
    if (!undoToast.item) return;

    const restoredItem = undoToast.item;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setSubscriptions((prev) => [restoredItem, ...prev]);
    setUndoToast({ show: false, item: null });
  };

  // Reset to original seed data
  const handleResetSeedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setSubscriptions(initialSubscriptions);
    setEditingSubscription(null);
    setUndoToast({ show: false, item: null });
  };

  // Reactive metrics computation on every state update
  const { totalMonthlyBurn, upcomingCount, overdueCount } = computeDashboardMetrics(subscriptions);

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

        {/* 1. ONBOARDING & EDIT FORM */}
        <SubscriptionForm
          onAddOrUpdateSubscription={handleAddOrUpdateSubscription}
          editingSubscription={editingSubscription}
          onCancelEdit={handleCancelEdit}
          currency={currency}
        />

        {/* 2. METRICS ROW */}
        <MetricsCards
          totalMonthlyBurn={totalMonthlyBurn}
          upcomingCount={upcomingCount}
          overdueCount={overdueCount}
          pausedCount={pausedSubs.length}
          pausedMonthlySavings={pausedMonthlySavings}
          currency={currency}
        />

        {/* 3. SUBSCRIPTION DIRECTORY GRID */}
        <SubscriptionGrid
          subscriptions={subscriptions}
          onToggleStatus={handleToggleStatus}
          onStartEdit={handleStartEdit}
          onDelete={handleDeleteSubscription}
          currency={currency}
        />

        {/* FOOTER & DEMO CONTROLS */}
        <footer className="mt-12 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Subscription Tracker & Renewal Dashboard. Built with React & Tailwind CSS.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSeedData}
              className="text-red-500 hover:text-red-400 font-bold underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reset Seed Demo Data
            </button>
          </div>
        </footer>
      </div>

      {/* 5-Second Undo Toast */}
      <UndoToast
        toastState={undoToast}
        onUndo={handleUndoDelete}
        onClose={() => setUndoToast({ show: false, item: null })}
      />
    </div>
  );
}
