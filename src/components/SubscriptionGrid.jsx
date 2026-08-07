import React, { useState } from 'react';
import SubscriptionRow from './SubscriptionRow';
import { Layers, Filter, Sparkles, Inbox } from 'lucide-react';
import { isRenewingSoon, getDaysRemaining } from '../utils/subscriptionLogic';

export default function SubscriptionGrid({ subscriptions, onToggleStatus, onDelete, currency = 'USD' }) {
  const [filter, setFilter] = useState('all');

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'active') return sub.status === 'active';
    if (filter === 'paused') return sub.status === 'paused';
    if (filter === 'renewing') {
      const daysLeft = getDaysRemaining(sub.nextRenewalDate);
      return isRenewingSoon(daysLeft);
    }
    return true;
  });

  return (
    <div className="bg-zinc-900/90 rounded-xl shadow-xl border border-zinc-800 overflow-hidden mb-8 transition-all hover:border-zinc-700 backdrop-blur-md">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Subscription Directory ({subscriptions.length})
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-zinc-400 font-semibold mr-1 flex items-center gap-1 uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5 text-red-500" /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            Active ({subscriptions.filter(s => s.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('paused')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'paused'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            Paused ({subscriptions.filter(s => s.status === 'paused').length})
          </button>
          <button
            onClick={() => setFilter('renewing')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'renewing'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-950/60'
                : 'bg-zinc-800 text-amber-300 border border-amber-500/40 hover:bg-amber-950/40'
            }`}
          >
            Renewing Soon
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredSubscriptions.length === 0 ? (
        <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-500">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white">No subscriptions found</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            {filter === 'all'
              ? 'Get started by adding your first subscription above.'
              : `There are currently no subscriptions matching the "${filter}" filter.`}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  <th className="px-6 py-3.5">Service Name</th>
                  <th className="px-6 py-3.5">Cost</th>
                  <th className="px-6 py-3.5">Billing Cycle</th>
                  <th className="px-6 py-3.5">Next Renewal Date</th>
                  <th className="px-6 py-3.5">Days Remaining</th>
                  <th className="px-6 py-3.5">Status Toggle</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredSubscriptions.map(sub => (
                  <SubscriptionRow
                    key={sub.id}
                    subscription={sub}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                    currency={currency}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARD CONTAINER */}
          <div className="md:hidden p-4 space-y-4">
            {filteredSubscriptions.map(sub => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                currency={currency}
              />
            ))}
          </div>
        </>
      )}

      {/* Savings Simulation Note Footer */}
      <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          Tip: Toggle any row to "Paused" to instantly simulate live monthly budget savings.
        </span>
        <span className="hidden sm:inline font-mono text-zinc-500">
          Total Items: {filteredSubscriptions.length}
        </span>
      </div>
    </div>
  );
}
