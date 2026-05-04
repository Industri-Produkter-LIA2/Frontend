import { API_BASE_URL } from '../constants/apiConfig.js';

const API_BASE = API_BASE_URL;

export async function fetchOrdersByCustomerId(customerId) {
  const url = `${API_BASE}/order/customer/${customerId}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}