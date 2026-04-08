// ==================== CONFIGURATION ====================
const API_BASE = "https://localhost:7040/";

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

function showMessage(message, type = "info") {
    let messageDiv = document.querySelector('.message-toast');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message-toast';
        document.body.appendChild(messageDiv);

        Object.assign(messageDiv.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            zIndex: '1000',
            fontWeight: 'bold',
            transition: 'opacity 0.3s ease'
        });
    }

    const colors = { error: '#f44336', success: '#4CAF50', info: '#2196F3' };
    messageDiv.style.backgroundColor = colors[type] || colors.info;
    messageDiv.textContent = message;
    messageDiv.style.opacity = '1';

    setTimeout(() => messageDiv.style.opacity = '0', 3000);
}

// ==================== PRODUCT FUNCTIONS ====================
export async function fetchProducts() {
    const candidates = ['/api/products', 'http://localhost:5088/api/products'];
    for (const url of candidates) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch {
            // Continue to next candidate
        }
    }
    return null;
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

    products.forEach(product => {
        const productId = product.id ?? product.Id;
        if (!productId) {
            console.warn('Product missing ID:', product);
            return;
        }

        const card = createProductCard(product, productId);
        container.appendChild(card);
    });
}

function createProductCard(product, productId) {
    const card = document.createElement('article');
    card.className = 'product';

    const title = document.createElement('h2');
    title.textContent = product.name ?? product.Name ?? 'Unnamed product';
    card.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
        <div><strong>Article:</strong> ${escapeHtml(product.articleNumber ?? product.ArticleNumber ?? '')}</div>
        <div><strong>Category:</strong> ${escapeHtml(product.category ?? product.Category ?? '')}</div>
        <div><strong>Price:</strong> ${formatPrice(product.price ?? product.Price ?? 0)}</div>
    `;
    card.appendChild(meta);

    const descText = product.description ?? product.Description;
    if (descText) {
        const desc = document.createElement('p');
        desc.className = 'description';
        desc.textContent = descText;
        card.appendChild(desc);
    }

    const buttonContainer = createAddToCartButton(productId);
    card.appendChild(buttonContainer);

    return card;
}

function createAddToCartButton(productId) {
    const container = document.createElement('div');
    container.className = 'add-to-cart-container';
    container.style.marginTop = '1rem';

    const button = document.createElement('button');
    button.textContent = 'Add to Cart 🛒';
    button.className = 'add-to-cart-btn';

    Object.assign(button.style, {
        padding: '0.5rem 1rem',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background-color 0.3s'
    });

    button.onmouseenter = () => button.style.backgroundColor = '#45a049';
    button.onmouseleave = () => button.style.backgroundColor = '#4CAF50';
    button.onclick = async (event) => {
        event.stopPropagation();
        await handleAddToCart(productId, button);
    };

    container.appendChild(button);
    return container;
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