import { fetchOrdersByCustomerId } from '../api/orders.js';
import { getUser } from '../ui/auth.js';

function getCustomerId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('customerId');
  if (fromQuery) {
    return Number(fromQuery);
  }

  const user = getUser();
  if (!user) {
    return null;
  }

  const candidate = user.customerId ?? user.CustomerId ?? null;
  if (candidate == null) {
    return null;
  }

  return Number(candidate);
}

function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString(undefined, { style: 'currency', currency: 'SEK' });
}

function renderOrders(orders) {
  const list = document.getElementById('orders-list');
  if (!list) return;

  if (!Array.isArray(orders) || orders.length === 0) {
    list.innerHTML = '<p>No orders found for this customer.</p>';
    return;
  }

  list.innerHTML = '';

  orders.forEach((order) => {
    const article = document.createElement('article');
    article.className = 'order-card';

    const oid = order.id ?? order.Id;
    const created = order.createdAtUtc
      ? new Date(order.createdAtUtc).toLocaleString()
      : 'Unknown date';

    const itemsMarkup = (order.items || [])
      .map((item) => `
        <li>
          ${item.productName || 'Unknown product'} x ${item.quantity}
          - ${formatPrice(item.lineTotal)}
        </li>
      `)
      .join('');

    article.innerHTML = `
      <h2>${order.orderNumber || `Order #${oid}`}</h2>
      <p><strong>Status:</strong> ${order.status || 'Unknown'}</p>
      <p><strong>Created:</strong> ${created}</p>
      <p><strong>Total:</strong> ${formatPrice(order.totalAmount)}</p>
      <h3>Items</h3>
      <ul>${itemsMarkup || '<li>No items</li>'}</ul>
    `;

    list.appendChild(article);
  });
}

export async function initOrdersPage() {
  const statusEl = document.getElementById('orders-status');
  if (!statusEl) return;

  const customerId = getCustomerId();
  if (!customerId || Number.isNaN(customerId)) {
    statusEl.textContent = 'No customer selected. Open this page with ?customerId=123.';
    return;
  }

  statusEl.textContent = 'Loading orders...';

  try {
    const orders = await fetchOrdersByCustomerId(customerId);
    statusEl.textContent = '';
    renderOrders(orders);
  } catch (err) {
    statusEl.textContent = `Could not load orders: ${err.message}`;
  }
}

initOrdersPage();
