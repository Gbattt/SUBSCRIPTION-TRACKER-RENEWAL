import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, DollarSign, Tag, Clock, AlertCircle, CheckCircle, XCircle, Folder } from 'lucide-react';
import { getCurrencySymbol, CATEGORIES } from '../utils/subscriptionLogic';

export default function SubscriptionForm({
  onAddOrUpdateSubscription,
  editingSubscription = null,
  onCancelEdit,
  currency = 'USD'
}) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [category, setCategory] = useState('Other');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = getCurrencySymbol(currency);
  const isEditing = Boolean(editingSubscription);

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name || '');
      // Use displayCost pre-converted by server API response
      const displayCost = editingSubscription.displayCost !== undefined
        ? editingSubscription.displayCost
        : editingSubscription.cost;
      setCost(displayCost ? displayCost.toString() : '');
      setBillingCycle(editingSubscription.billingCycle || 'monthly');
      setNextRenewalDate(editingSubscription.nextRenewalDate || '');
      setCategory(editingSubscription.category || 'Other');
      setError('');
    } else {
      resetForm();
    }
  }, [editingSubscription]);

  const resetForm = () => {
    setName('');
    setCost('');
    setBillingCycle('monthly');
    setNextRenewalDate('');
    setCategory('Other');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a service name.');
      return;
    }
    if (!cost || isNaN(cost) || Number(cost) <= 0) {
      setError('Please enter a valid cost amount greater than 0.');
      return;
    }
    if (!nextRenewalDate) {
      setError('Please select a valid next renewal date.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const subscriptionPayload = {
        id: isEditing ? editingSubscription.id : undefined,
        name: name.trim(),
        cost: parseFloat(cost), // Numeric cost entered by user in active currency
        billingCycle: billingCycle,
        nextRenewalDate: nextRenewalDate,
        category: category || 'Other',
        currency: currency,
        status: isEditing ? editingSubscription.status : 'active'
      };

      await onAddOrUpdateSubscription(subscriptionPayload, isEditing);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900/90 rounded-xl shadow-xl border border-zinc-800 p-6 mb-8 transition-all hover:border-zinc-700 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <CheckCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <PlusCircle className="w-5 h-5 text-red-500" />
          )}
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            {isEditing ? `Edit Subscription: ${editingSubscription.name}` : 'Add New Subscription'}
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/80 border border-red-800/80 rounded-lg flex items-center gap-2.5 text-sm text-red-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        {/* Service Name */}
        <div className="lg:col-span-1">
          <label htmlFor="serviceName" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-red-500" />
            Service Name
          </label>
          <input
            id="serviceName"
            type="text"
            placeholder="e.g. Netflix"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:bg-zinc-800 transition-all"
          />
        </div>

        {/* Cost Input */}
        <div className="lg:col-span-1">
          <label htmlFor="costAmount" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-red-500" />
            Cost ({currency})
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-zinc-400 text-xs font-bold">{currencySymbol}</span>
            </div>
            <input
              id="costAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={cost}
              onChange={(e) => {
                setCost(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:bg-zinc-800 transition-all"
            />
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="lg:col-span-1">
          <label htmlFor="billingCycle" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            Billing Cycle
          </label>
          <select
            id="billingCycle"
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:bg-zinc-800 transition-all cursor-pointer"
          >
            <option value="monthly" className="bg-zinc-900 text-white">Monthly</option>
            <option value="yearly" className="bg-zinc-900 text-white">Yearly</option>
          </select>
        </div>

        {/* Category Tag Dropdown */}
        <div className="lg:col-span-1">
          <label htmlFor="category" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Folder className="w-3.5 h-3.5 text-red-500" />
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:bg-zinc-800 transition-all cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Native Date Picker */}
        <div className="lg:col-span-1">
          <label htmlFor="renewalDate" className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            Next Renewal Date
          </label>
          <input
            id="renewalDate"
            type="date"
            value={nextRenewalDate}
            onChange={(e) => {
              setNextRenewalDate(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:bg-zinc-800 transition-all cursor-pointer color-scheme-dark"
          />
        </div>

        {/* Submit / Update Button */}
        <div className="lg:col-span-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white font-bold text-sm rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer uppercase tracking-wider ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              isEditing
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-950/60'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-950/60'
            }`}
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : isEditing ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Update Subscription
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Add Subscription
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
