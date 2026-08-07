import React from 'react';
import { AlertCircle, Trash2, Calendar, Clock } from 'lucide-react';
import { getDaysRemaining, isRenewingSoon, formatCurrency } from '../utils/subscriptionLogic';

export default function SubscriptionRow({ subscription, onToggleStatus, onDelete, currency = 'USD' }) {
  const { id, name, cost, billingCycle, nextRenewalDate, status } = subscription;
  const isPaused = status === 'paused';

  const daysRemaining = getDaysRemaining(nextRenewalDate);
  const showRenewingSoon = isRenewingSoon(daysRemaining);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  };

  return (
    <>
      {/* DESKTOP TABLE ROW */}
      <tr
        className={`hidden md:table-row transition-all duration-200 border-b border-zinc-800/80 ${
          isPaused ? 'opacity-40 bg-zinc-950/60' : 'hover:bg-zinc-800/60 bg-zinc-900/40'
        }`}
      >
        {/* Service Name */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
              isPaused ? 'bg-zinc-800 text-zinc-500' : 'bg-red-950 border border-red-800/60 text-red-500'
            }`}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className={`font-bold text-sm ${isPaused ? 'text-zinc-500' : 'text-white'}`}>
                {name}
              </span>
              {isPaused && (
                <span className="block text-[11px] font-normal text-zinc-500">
                  Savings Simulation Active
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Cost */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-baseline gap-1">
            <span className={`font-black text-sm ${
              isPaused ? 'line-through text-zinc-500' : 'text-white'
            }`}>
              {formatCurrency(cost, currency)}
            </span>
            <span className="text-xs text-zinc-500 capitalize">
              /{billingCycle === 'yearly' ? 'yr' : 'mo'}
            </span>
          </div>
        </td>

        {/* Billing Cycle */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
            billingCycle === 'yearly'
              ? 'bg-blue-950/60 text-blue-400 border border-blue-800/50'
              : 'bg-purple-950/60 text-purple-400 border border-purple-800/50'
          }`}>
            {billingCycle}
          </span>
        </td>

        {/* Next Renewal Date */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isPaused ? 'text-zinc-500' : 'text-zinc-300'}`}>
              {formatDateDisplay(nextRenewalDate)}
            </span>

            {/* Amber "Renewing Soon" Badge */}
            {showRenewingSoon && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40 animate-pulse">
                <Clock className="w-3 h-3 text-amber-400" />
                Renewing Soon
              </span>
            )}
          </div>
        </td>

        {/* Days Remaining */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded ${
            daysRemaining < 0
              ? 'bg-red-950/80 text-red-400 border border-red-800/60'
              : showRenewingSoon
              ? 'text-amber-300 font-bold'
              : 'text-zinc-400'
          }`}>
            {daysRemaining < 0
              ? `${Math.abs(daysRemaining)} days ago (Overdue)`
              : daysRemaining === 0
              ? 'Today!'
              : `${daysRemaining} days remaining`}
          </span>
        </td>

        {/* Status Toggle Switch */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={!isPaused}
              onClick={() => onToggleStatus(id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                !isPaused ? 'bg-red-600 shadow-md shadow-red-950/60' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  !isPaused ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold capitalize ${
              !isPaused ? 'text-red-500' : 'text-zinc-500'
            }`}>
              {status}
            </span>
          </div>
        </td>

        {/* Delete Action */}
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <button
            onClick={() => onDelete(id)}
            title="Delete subscription"
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/60 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>

      {/* MOBILE STACKED CARD VIEW */}
      <div className={`md:hidden p-5 rounded-xl border transition-all ${
        isPaused
          ? 'bg-zinc-950/60 border-zinc-800/60 opacity-50'
          : 'bg-zinc-900/90 border-zinc-800 shadow-md'
      }`}>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm ${
              isPaused ? 'bg-zinc-800 text-zinc-500' : 'bg-red-950 text-red-500 border border-red-800/60'
            }`}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className={`font-bold text-base ${isPaused ? 'text-zinc-500' : 'text-white'}`}>
                {name}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize mt-0.5 ${
                billingCycle === 'yearly'
                  ? 'bg-blue-950/60 text-blue-400'
                  : 'bg-purple-950/60 text-purple-400'
              }`}>
                {billingCycle}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-lg font-black ${isPaused ? 'line-through text-zinc-500' : 'text-white'}`}>
              {formatCurrency(cost, currency)}
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              per {billingCycle === 'yearly' ? 'year' : 'month'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
          <div>
            <span className="text-zinc-500 block mb-0.5">Next Renewal Date</span>
            <div className="flex items-center gap-1 font-semibold text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              {formatDateDisplay(nextRenewalDate)}
            </div>
          </div>

          <div>
            <span className="text-zinc-500 block mb-0.5">Days Remaining</span>
            <div className={`font-bold ${showRenewingSoon ? 'text-amber-300' : 'text-zinc-300'}`}>
              {daysRemaining < 0
                ? `${Math.abs(daysRemaining)}d ago (Overdue)`
                : daysRemaining === 0
                ? 'Today!'
                : `${daysRemaining} days`}
            </div>
          </div>
        </div>

        {showRenewingSoon && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 w-full justify-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Renewing Soon (within 7 days)
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={!isPaused}
              onClick={() => onToggleStatus(id)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                !isPaused ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  !isPaused ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold capitalize ${
              !isPaused ? 'text-red-500' : 'text-zinc-500'
            }`}>
              {status}
            </span>
          </div>

          <button
            onClick={() => onDelete(id)}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-950/60 border border-red-800/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
