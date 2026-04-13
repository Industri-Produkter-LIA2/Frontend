// ==================== CONFIGURATION ====================
const API_BASE = "https://localhost:7040";

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
    // Force the absolute URL instead of the relative candidate loop
    const url = `${API_BASE}/api/products`;
    
    try {
        const res = await fetch(url);
        console.log("Fetching from:", url, "Status:", res.status);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
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
  renderProducts(container, products.items);

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

    // Add image
    const placeholderImg = '/public/placeholder.png';
    const imageUrl = product.imageUrl ?? product.ImageUrl;
    // Create a link wrapper for details
    const detailLink = `product-details/${productId}`;
    const img = document.createElement('img');
    img.onerror = () => {
        img.onerror = null; // Prevents looping in case the placeholder also fails to load
        img.src = placeholderImg;
    };
    img.src = imageUrl || placeholderImg;
    img.alt = product.name ?? product.Name ?? 'Product image';
    img.className = 'product-image';
    img.onclick = () => window.location.href = detailLink;
    img.style.cursor = 'pointer';
    card.appendChild(img)

    // Add title
    const title = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = detailLink;
    titleLink.textContent = product.name ?? product.Name ?? 'Unnamed product';
    titleLink.style.textDecoration = 'none';
    titleLink.style.color = 'green';       
    
    title.appendChild(titleLink);
    card.appendChild(title);

    // Add meta information
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
        <div><strong>Article:</strong> ${escapeHtml(product.articleNumber ?? product.ArticleNumber ?? '')}</div>
        <div><strong>Category:</strong> ${escapeHtml(product.category ?? product.Category ?? '')}</div>
        <div><strong>Price:</strong> ${formatPrice(product.price ?? product.Price ?? 0)}</div>
    `;
    card.appendChild(meta);

    // Add description
    const descText = product.description ?? product.Description;
    if (descText) {
        const desc = document.createElement('p');
        desc.className = 'description';
        desc.textContent = descText;
        card.appendChild(desc);
    }

    // Add "Add to Cart" button
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

//=================Product Details ==========================
// Add these to src/api.js

export async function fetchProductById(id) {
    const url = `${API_BASE}/api/products/${id}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Product not found (HTTP ${res.status})`);
        return await res.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}
const DEFAULT_IMAGE = '/public/placeholder.png';
export async function loadAndRenderProductDetails() {
    const container = document.getElementById('product-details-container');
    if (!container) return;

    const pathParts = window.location.pathname.split('/').filter(part => part !== '');
    const productId = pathParts[pathParts.length - 1];

    // Get ID from URL (e.g., product-details.html?id=5)
    const params = new URLSearchParams(window.location.search);

     if (!productId || productId === 'product-details') {
        container.innerHTML = '<p class="error">No product ID provided.</p>';
        return;
    }

    const product = await fetchProductById(productId);

    if (!product) {
        container.innerHTML = '<p class="error">Product could not be loaded.</p>';
        return;
    }

const initialSrc = (product.imageUrl && product.imageUrl.trim() !== '') 
                       ? product.imageUrl 
                       : DEFAULT_IMAGE;

    // Render the details
container.innerHTML = `
    <div class="details-layout">
        <div class="details-image">
            <img id="main-product-img" 
                 src="${initialSrc}" 
                 alt="${escapeHtml(product.name)}" width="20%">
        </div>
        <div class="details-info">
            <h1>${escapeHtml(product.name)}</h1>
            <p class="article-num">Art nr: ${escapeHtml(product.articleNumber)}</p>
            <p class="category">Category: ${escapeHtml(product.category)}</p>
            <p class="price">${formatPrice(product.price)}</p>
            
            <div class="description">
                <h3>Beskrivning</h3>
                <p>${escapeHtml(product.description || 'Ingen beskrivning tillgänglig.')}</p>
            </div>

            <div class="actions-row" style="display: flex; gap: 1rem; margin-top: 2rem;">
                <div id="details-action-container"></div>
                <a href="../products" class="back-btn">Tillbaka till produkter</a>
            </div>
        </div>
    </div>
`;

// Handle broken links: If the URL exists but the image fails to load
    const imgElement = document.getElementById('main-product-img');
    imgElement.onerror = () => {
        imgElement.src = DEFAULT_IMAGE;
        imgElement.onerror = null; // Prevent infinite loops
    };

    const actionContainer = document.getElementById('details-action-container');
    actionContainer.appendChild(createAddToCartButton(product.id));}

// ==================== CART FUNCTIONS ====================
async function handleAddToCart(productId, button) {
    try {
        button.disabled = true;
        button.textContent = 'Adding...';
        
        let cartId = localStorage.getItem('cartId');
        
        // Create cart if doesn't exist
        if (!cartId) {
            const cartResponse = await fetch(`${API_BASE}api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!cartResponse.ok) throw new Error('Failed to create cart');
            
            const cart = await cartResponse.json();
            cartId = cart.id;
            localStorage.setItem('cartId', cartId);
        }
        
        // Add item to cart
        const response = await fetch(`${API_BASE}api/cart/${cartId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add item to cart');
        }
        
        showMessage('Product added to cart!', 'success');
        button.textContent = 'Added! ✓';
        button.style.backgroundColor = '#45a049';
        
        setTimeout(() => {
            button.textContent = 'Add to Cart 🛒';
            button.style.backgroundColor = '#4CAF50';
            button.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showMessage(error.message || 'Failed to add product to cart', 'error');
        button.textContent = 'Add to Cart 🛒';
        button.disabled = false;
    }
}