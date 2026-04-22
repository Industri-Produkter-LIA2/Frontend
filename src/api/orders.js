export async function fetchOrdersByCustomerId(customerId) {
  const candidates = [
    `/api/order/customer/${customerId}`,
    `http://localhost:5088/api/order/customer/${customerId}`
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      return data;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Unable to load orders');
}
