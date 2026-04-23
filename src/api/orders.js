import { API_BASE } from '../api.js';

export async function fetchOrdersByCustomerId(customerId) {
  const url = `${API_BASE}/api/order/customer/${customerId}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}
