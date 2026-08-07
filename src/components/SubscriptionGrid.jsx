import React, { useState, useMemo } from 'react';
import SubscriptionRow from './SubscriptionRow';
import { Layers, Filter, Sparkles, Inbox, Search, ArrowUpDown, ArrowUp, ArrowDown, X, RefreshCw } from 'lucide-react';

export default function SubscriptionGrid({
  subscriptions,
  onToggleStatus,
  onStartEdit,
  onDelete,
  currency = 'USD'
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'paused' | 'renewing'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null); // 'cost' | 'nextRenewalDate' | 'daysRemaining'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSortToggle = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearAllFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setSortField(null);
    setSortDirection('asc');
  };

  // Filter, Search, and Sort Pipeline using server pre-calculated fields
  const filteredAndSortedSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Status & Renewing Soon filter pill (using server-computed isRenewingSoon)
        if (filter === 'active' && sub.status !== 'active') return false;
        if (filter === 'paused' && sub.status !== 'paused') return false;
        if (filter === 'renewing' && !sub.isRenewingSoon) return false;

        // Live Search Query substring matching
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = sub.name.toLowerCase().includes(query);
          const matchCategory = (sub.category || '').toLowerCase().includes(query);
          if (!matchName && !matchCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (!sortField) return 0;

        let valA, valB;
        if (sortField === 'cost') {
          valA = a.displayCost !== undefined ? a.displayCost : a.cost;
          valB = b.displayCost !== undefined ? b.displayCost : b.cost;
        } else if (sortField === 'nextRenewalDate') {
          valA = new Date(a.nextRenewalDate).getTime();
          valB = new Date(b.nextRenewalDate).getTime();
        } else if (sortField === 'daysRemaining') {
          valA = a.daysRemaining !== undefined ? a.daysRemaining : 0;
          valB = b.daysRemaining !== undefined ? b.daysRemaining : 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [subscriptions, filter, searchQuery, sortField, sortDirection]);

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-zinc-500 opacity-50 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-red-500 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-red-500 font-bold" />
    );
  };

  return (
    <div className="bg-zinc-900/90 rounded-xl shadow-xl border border-zinc-800 overflow-hidden mb-8 transition-all hover:border-zinc-700 backdrop-blur-md">
      {/* Search Bar & Filter Controls Header */}
      <div className="p-5 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Directory ({subscriptions.length})
            </h3>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search service or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
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

      {/* Empty State Conditions */}
      {filteredAndSortedSubscriptions.length === 0 ? (
        <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-500">
            <Inbox className="w-6 h-6" />
          </div>
          {subscriptions.length === 0 ? (
            <>
              <p className="text-base font-bold text-white mb-1">No subscriptions yet</p>
              <p className="text-xs text-zinc-400 max-w-xs">Add your first subscription using the form above to get started.</p>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-white mb-1">No subscriptions match your filters</p>
              <p className="text-xs text-zinc-400 mb-4 max-w-xs">Try searching for a different keyword or resetting your filter criteria.</p>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear Filters & Search
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW WITH SORTABLE HEADERS */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  <th className="px-6 py-3.5">Service Name</th>

                  {/* Sortable Cost Header */}
                  <th className="px-6 py-3.5">
                    <button
                      onClick={() => handleSortToggle('cost')}
                      className="group inline-flex items-center gap-1.5 font-bold hover:text-white transition-colors cursor-pointer focus:outline-none"
                    >
                      Cost {renderSortIndicator('cost')}
                    </button>
                  </th>

                  <th className="px-6 py-3.5">Billing Cycle</th>

                  {/* Sortable Renewal Date Header */}
                  <th className="px-6 py-3.5">
                    <button
                      onClick={() => handleSortToggle('nextRenewalDate')}
                      className="group inline-flex items-center gap-1.5 font-bold hover:text-white transition-colors cursor-pointer focus:outline-none"
                    >
                      Next Renewal Date {renderSortIndicator('nextRenewalDate')}
                    </button>
                  </th>

                  {/* Sortable Days Remaining Header */}
                  <th className="px-6 py-3.5">
                    <button
                      onClick={() => handleSortToggle('daysRemaining')}
                      className="group inline-flex items-center gap-1.5 font-bold hover:text-white transition-colors cursor-pointer focus:outline-none"
                    >
                      Days Remaining {renderSortIndicator('daysRemaining')}
                    </button>
                  </th>

                  <th className="px-6 py-3.5">Status Toggle</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredAndSortedSubscriptions.map((sub) => (
                  <SubscriptionRow
                    key={sub.id}
                    subscription={sub}
                    onToggleStatus={onToggleStatus}
                    onStartEdit={onStartEdit}
                    onDelete={onDelete}
                    currency={currency}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARD CONTAINER */}
          <div className="md:hidden p-4 space-y-4">
            {filteredAndSortedSubscriptions.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
                onToggleStatus={onToggleStatus}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
                currency={currency}
              />
            ))}
          </div>
        </>
      )}

      {/* Footer Info */}
      <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          Tip: Click table column headers to sort by cost, date, or days remaining.
        </span>
        <span className="hidden sm:inline font-mono text-zinc-500">
          Showing {filteredAndSortedSubscriptions.length} of {subscriptions.length}
        </span>
      </div>
    </div>
  );
}
