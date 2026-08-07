import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SubscriptionForm from './components/SubscriptionForm';
import MetricsCards from './components/MetricsCards';
import SubscriptionGrid from './components/SubscriptionGrid';
import UndoToast from './components/UndoToast';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  toggleSubscription,
  deleteSubscription,
  resetSubscriptions
} from './api/client';

export default function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalMonthlyBurn: 0,
    pausedMonthlySavings: 0,
    upcomingCount: 0,
    overdueCount: 0
  });

  const [currency, setCurrency] = useState('USD');
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Client Undo Toast cache
  const [undoToast, setUndoToast] = useState({ show: false, item: null });
  const toastTimerRef = useRef(null);

  // Load subscriptions & server metrics on mount & when currency changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setApiError(null);

      try {
        const data = await fetchSubscriptions(currency);
        if (isMounted) {
          setSubscriptions(data.subscriptions || []);
          setMetrics(data.metrics || {});
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.message || 'Failed to connect to backend server on port 4000.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currency]);

  // Handle Add (POST) or Update (PUT) via Express API
  const handleAddOrUpdateSubscription = async (payload, isEditing) => {
    try {
      if (isEditing) {
        const data = await updateSubscription(payload.id, payload);
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === data.subscription.id ? data.subscription : sub))
        );
        if (data.metrics) setMetrics(data.metrics);
      } else {
        const data = await createSubscription(payload);
        setSubscriptions((prev) => [data.subscription, ...prev]);
        if (data.metrics) setMetrics(data.metrics);
      }
      setEditingSubscription(null);
    } catch (err) {
      throw err;
    }
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

  // Toggle active/paused status via Express API (PATCH)
  const handleToggleStatus = async (id) => {
    try {
      const data = await toggleSubscription(id, currency);
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === data.subscription.id ? data.subscription : sub))
      );
      if (data.metrics) setMetrics(data.metrics);
    } catch (err) {
      setApiError(`Toggle failed: ${err.message}`);
    }
  };

  // Delete subscription via Express API (DELETE) & trigger Undo toast
  const handleDeleteSubscription = async (id) => {
    try {
      const data = await deleteSubscription(id, currency);
      const deletedItem = data.subscription;

      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
      if (data.metrics) setMetrics(data.metrics);

      if (editingSubscription && editingSubscription.id === id) {
        setEditingSubscription(null);
      }

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      setUndoToast({ show: true, item: deletedItem });

      toastTimerRef.current = setTimeout(() => {
        setUndoToast({ show: false, item: null });
      }, 5000);
    } catch (err) {
      setApiError(`Delete failed: ${err.message}`);
    }
  };

  // Undo Delete by re-POSTing deleted item payload
  const handleUndoDelete = async () => {
    if (!undoToast.item) return;

    const itemToRestore = undoToast.item;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    try {
      const payload = {
        name: itemToRestore.name,
        cost: itemToRestore.displayCost !== undefined ? itemToRestore.displayCost : itemToRestore.cost,
        billingCycle: itemToRestore.billingCycle,
        nextRenewalDate: itemToRestore.nextRenewalDate,
        category: itemToRestore.category,
        currency: currency,
        status: itemToRestore.status,
        id: itemToRestore.id
      };

      const data = await createSubscription(payload);
      setSubscriptions((prev) => [data.subscription, ...prev]);
      if (data.metrics) setMetrics(data.metrics);
    } catch (err) {
      setApiError(`Undo failed: ${err.message}`);
    } finally {
      setUndoToast({ show: false, item: null });
    }
  };

  // Reset in-memory backend store to seed items
  const handleResetSeedData = async () => {
    try {
      setIsLoading(true);
      const data = await resetSubscriptions(currency);
      setSubscriptions(data.subscriptions || []);
      setMetrics(data.metrics || {});
      setEditingSubscription(null);
      setUndoToast({ show: false, item: null });
    } catch (err) {
      setApiError(`Reset failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedSubsCount = subscriptions.filter((s) => s.status === 'paused').length;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <Header
          totalActiveCount={activeSubsCount}
          totalPausedCount={pausedSubsCount}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        {/* Global API Connection Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-950/90 border border-red-800 rounded-xl flex items-center justify-between text-sm text-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{apiError} (Ensure backend server is running on http://127.0.0.1:4000)</span>
            </div>
            <button
              onClick={() => setCurrency((c) => c)}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 1. ONBOARDING & EDIT FORM */}
        <SubscriptionForm
          onAddOrUpdateSubscription={handleAddOrUpdateSubscription}
          editingSubscription={editingSubscription}
          onCancelEdit={handleCancelEdit}
          currency={currency}
        />

        {/* Loading Skeleton / Spinner State */}
        {isLoading ? (
          <div className="p-12 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col items-center justify-center mb-8">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-white">Fetching data from Express Server...</p>
            <p className="text-xs text-zinc-400 mt-1">Calculating burn rates and day differences on backend</p>
          </div>
        ) : (
          <>
            {/* 2. METRICS ROW (consumes pre-calculated server metrics) */}
            <MetricsCards
              totalMonthlyBurn={metrics.totalMonthlyBurn || 0}
              upcomingCount={metrics.upcomingCount || 0}
              overdueCount={metrics.overdueCount || 0}
              pausedCount={pausedSubsCount}
              pausedMonthlySavings={metrics.pausedMonthlySavings || 0}
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
          </>
        )}

        {/* FOOTER & DEMO CONTROLS */}
        <footer className="mt-12 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Subscription Tracker & Renewal Dashboard. Express API + React.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSeedData}
              className="text-red-500 hover:text-red-400 font-bold underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reset Backend Seed Data
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
