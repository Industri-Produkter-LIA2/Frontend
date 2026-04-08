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
    } catch (err) {
      console.warn('Failed to fetch products from:', url, err);
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
  const searchInput = document.getElementById('product-search');
  if (!container) {
    console.warn('Products container not found');
    return;
  }
  container.innerHTML = '<p>Loading...</p>';
  const products = await fetchProducts();
  if (!products) {
    container.innerHTML = '<p class="error">Unable to load products. Is the API running?</p>';
    return;
  }
  renderProducts(container, products);

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.trim().toLowerCase();
      const filteredProducts = products.filter(p => {
        const name = String(p.name ?? p.Name ?? '').toLowerCase();
        return name.includes(term);
      });
      renderProducts(container, filteredProducts);
    });
  }
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

    const placeholderImg = '/public/placeholder.png';

    const imageUrl = p.imageUrl ?? p.ImageUrl;
    const img = document.createElement('img');
    img.onerror = () => {
      img.onerror = null; // Prevents looping in case the placeholder also fails to load.
      img.src = placeholderImg;
    };
    img.src = imageUrl || placeholderImg; // Sets the image found in /public/ as the placeholder if no image is found for the product. Also realizing now that we probably need to split /public/ into /public/images/ and /public/pages/ in the future.
    img.alt = p.name ?? p.Name ?? 'Product image';
    img.className = 'product-image';
    card.appendChild(img);

    container.appendChild(card);
  });
}