/**
 * API client wrapper for communicating with the Express backend on port 4000.
 */

const BASE_URL = 'http://127.0.0.1:4000/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data && data.error ? data.error : `HTTP error ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function fetchSubscriptions(currency = 'USD') {
  const res = await fetch(`${BASE_URL}/subscriptions?currency=${currency}`);
  return handleResponse(res);
}

export async function createSubscription(payload) {
  const res = await fetch(`${BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function updateSubscription(id, payload) {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function toggleSubscription(id, currency = 'USD') {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}/toggle?currency=${currency}`, {
    method: 'PATCH'
  });
  return handleResponse(res);
}

export async function deleteSubscription(id, currency = 'USD') {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}?currency=${currency}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function resetSubscriptions(currency = 'USD') {
  const res = await fetch(`${BASE_URL}/subscriptions/reset?currency=${currency}`, {
    method: 'POST'
  });
  return handleResponse(res);
}

export async function fetchExchangeRates() {
  const res = await fetch(`${BASE_URL}/exchange-rates`);
  return handleResponse(res);
}
