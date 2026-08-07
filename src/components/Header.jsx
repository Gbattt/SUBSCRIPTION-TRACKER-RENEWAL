import React from 'react';
import { Tv, Globe } from 'lucide-react';
import { CURRENCIES } from '../utils/subscriptionLogic';

export default function Header({
  totalActiveCount,
  totalPausedCount,
  currency,
  onCurrencyChange,
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/90">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-900/40 flex items-center justify-center">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-600 text-white">
                  DASHBOARD
                </span>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl uppercase">
                  Subscription Tracker & Renewal
                </h1>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Simulate monthly recurring expenses, monitor upcoming renewals, and optimize savings in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {/* Currency Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-lg shadow-sm">
            <Globe className="w-4 h-4 text-red-500" />
            <label htmlFor="currency-select" className="text-xs font-medium text-zinc-400">
              Currency:
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active / Paused Status Pills */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 bg-zinc-900/90 px-3.5 py-2 rounded-lg shadow-sm border border-zinc-800">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-white font-semibold">{totalActiveCount} Active</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500">{totalPausedCount} Paused</span>
          </div>
        </div>
      </div>
    </header>
  );
}
