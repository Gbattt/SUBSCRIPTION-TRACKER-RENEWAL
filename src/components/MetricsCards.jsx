import React from 'react';
import { DollarSign, Clock, AlertTriangle, TrendingUp, Sparkles, AlertOctagon } from 'lucide-react';
import { formatCurrency } from '../utils/subscriptionLogic';

export default function MetricsCards({
  totalMonthlyBurn,
  upcomingCount,
  overdueCount = 0,
  pausedCount,
  pausedMonthlySavings,
  currency = 'USD'
}) {
  const projectedYearly = totalMonthlyBurn * 12;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Card A: Total Monthly Burn Rate */}
      <div className="bg-zinc-900/90 rounded-xl shadow-xl border border-zinc-800 p-6 relative overflow-hidden transition-all hover:border-zinc-700 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Card A
          </span>
          <div className="p-2.5 bg-red-950/70 border border-red-800/50 text-red-500 rounded-lg shadow-sm">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
          Total Monthly Burn Rate
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatCurrency(totalMonthlyBurn, currency)}
          </span>
          <span className="text-xs font-medium text-zinc-400">/ month</span>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-red-500" />
            Projected Annual: <strong className="text-white font-bold">{formatCurrency(projectedYearly, currency)}</strong>
          </span>

          {pausedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-semibold border border-emerald-800/60 shadow-xs">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Saving {formatCurrency(pausedMonthlySavings, currency)}/mo
            </span>
          )}
        </div>
      </div>

      {/* Card B: Upcoming Renewals & Overdue Alert */}
      <div className="bg-zinc-900/90 rounded-xl shadow-xl border border-zinc-800 p-6 relative overflow-hidden transition-all hover:border-zinc-700 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Card B
          </span>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-950 text-red-400 border border-red-800/80 animate-pulse shadow-sm">
                <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
                {overdueCount} Overdue
              </span>
            )}
            <div className={`p-2.5 rounded-lg border shadow-sm ${upcomingCount > 0 ? 'bg-amber-950/70 border-amber-800/60 text-amber-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
          Upcoming Renewals (Within 7 Days)
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl sm:text-4xl font-black tracking-tight ${upcomingCount > 0 ? 'text-amber-400' : 'text-white'}`}>
            {upcomingCount}
          </span>
          <span className="text-xs font-medium text-zinc-400">
            {upcomingCount === 1 ? 'subscription' : 'subscriptions'}
          </span>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          {upcomingCount > 0 ? (
            <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/70 px-3 py-1 rounded-md border border-amber-800/60 font-semibold shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Action recommended: Review charges before auto-renewing
            </span>
          ) : overdueCount > 0 ? (
            <span className="text-red-400 font-semibold flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
              {overdueCount} renewal date(s) have passed and require attention
            </span>
          ) : (
            <span className="text-zinc-500">
              No immediate renewals scheduled in the next week
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
