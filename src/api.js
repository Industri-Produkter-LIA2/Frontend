// Placeholder for API functions.
// We can implement functions here to call the backend API once it's set up.
// (e.g getProducts, getProduct, createProduct, etc.)

export async function fetchProducts() {
  const candidates = ['/api/products', 'http://localhost:5088/api/products'];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
    }
  }
  return null;
}

export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString(undefined, { style: 'currency', currency: 'SEK' });
}

export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function loadAndRenderProducts(containerId = 'products') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const products = await fetchProducts();
  if (!products) {
    container.innerHTML = '<p class="error">Unable to load products. Is the API running?</p>';
    return;
  }
  renderProducts(container, products);
}

function renderProducts(container, products) {
  if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }

  container.innerHTML = '';

  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product';

    const title = document.createElement('h2');
    title.textContent = p.name ?? p.Name ?? 'Unnamed product';
    card.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
      <div><strong>Article:</strong> ${escapeHtml(p.articleNumber ?? p.ArticleNumber ?? '')}</div>
      <div><strong>Category:</strong> ${escapeHtml(p.category ?? p.Category ?? '')}</div>
      <div><strong>Price:</strong> ${formatPrice(p.price ?? p.Price ?? 0)}</div>
    `;
    card.appendChild(meta);

    const descText = p.description ?? p.Description;
    if (descText) {
      const desc = document.createElement('p');
      desc.className = 'description';
      desc.textContent = descText;
      card.appendChild(desc);
    }

    container.appendChild(card);
  });
}