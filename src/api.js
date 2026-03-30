// ==================== CONFIGURATION ====================
const API_BASE = "https://localhost:7040/";

// ==================== UTILITY FUNCTIONS ====================
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

// ==================== CART API FUNCTIONS ====================
export async function createCart(customerId = null) {
    let url = `${API_BASE}/cart`;
    if (customerId) url += `?customerId=${customerId}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        let errorMessage = "Failed to create cart";
        try {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
        } catch (e) {
            errorMessage = `Failed to create cart: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) throw new Error("Server returned empty response when creating cart");

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Invalid JSON response:", text);
        throw new Error("Invalid response format from server");
    }
}

export async function getCart(cartId) {
    if (!cartId) throw new Error("Cart ID is required");

    try {
        const response = await fetch(`${API_BASE}/cart/${cartId}`);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Failed to get cart: ${response.statusText}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error("Error getting cart:", error);
        throw error;
    }
}

export async function addToCartApi(cartId, productId, quantity = 1) {
    if (!cartId) throw new Error("Cart ID is required");
    if (!productId) throw new Error("Product ID is required");
    if (quantity <= 0) throw new Error("Quantity must be greater than 0");

    const response = await fetch(`${API_BASE}/cart/${cartId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId: parseInt(productId),
            quantity: parseInt(quantity)
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add item");
    }

    return await response.json();
}

export async function removeCartItem(cartId, itemId) {
    if (!cartId || !itemId) throw new Error("Cart ID and Item ID are required");

    const response = await fetch(`${API_BASE}/cart/${cartId}/items/${itemId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove item");
    }

    return true;
}

async function updateCartItemQuantityApi(cartId, itemId, quantity) {
    const response = await fetch(`${API_BASE}/cart/${cartId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
    });

    if (!response.ok) throw new Error("Failed to update quantity");
    return await response.json();
}

// ==================== CART BUSINESS LOGIC ====================
export async function getOrCreateCart() {
    const cartId = localStorage.getItem('cartId');

    if (cartId) {
        try {
            const cart = await getCart(cartId);
            if (cart?.id) return cart;
        } catch (error) {
            console.log("Cart not found, creating new one");
            localStorage.removeItem('cartId');
        }
    }

    const newCart = await createCart();
    if (!newCart?.id) throw new Error("Invalid cart response from server");

    localStorage.setItem('cartId', newCart.id);
    return newCart;
}

async function handleAddToCart(productId, button) {
    const originalText = button.textContent;

    try {
        button.disabled = true;
        button.textContent = 'Adding...';
        button.style.opacity = '0.7';

        const cart = await getOrCreateCart();
        if (!cart?.id) throw new Error("Could not get or create cart");

        const updatedCart = await addToCartApi(cart.id, productId, 1);

        button.textContent = 'Added! ✅';
        button.style.backgroundColor = '#2196F3';

        await updateCartCountBadge(cart.id);

        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '#4CAF50';
            button.disabled = false;
            button.style.opacity = '1';
        }, 2000);

    } catch (error) {
        console.error("Error adding to cart:", error);

        button.textContent = 'Failed! ❌';
        button.style.backgroundColor = '#f44336';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '#4CAF50';
            button.disabled = false;
            button.style.opacity = '1';
        }, 2000);

        showMessage(error.message || "Failed to add to cart", "error");
    }
}

// ==================== CART UI FUNCTIONS ====================
function createCartModal() {
    const modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-header">
                <h2>Shopping Cart</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div id="cartItemsContainer" class="cart-items">
                <div class="empty-cart">Loading...</div>
            </div>
            <div id="cartFooter" style="display: none;">
                <div class="cart-total">
                    Total: <span id="cartTotal">0 SEK</span>
                </div>
                <button id="checkoutBtn" class="checkout-btn">Proceed to Checkout</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

async function renderCartItems(cartId) {
    const container = document.getElementById('cartItemsContainer');
    const footer = document.getElementById('cartFooter');

    if (!container) return;

    try {
        const cart = await getCart(cartId);

        if (!cart?.items?.length) {
            container.innerHTML = '<div class="empty-cart">Your cart is empty 🛒</div>';
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'block';

        let total = 0;
        container.innerHTML = '';

        cart.items.forEach(item => {
            const productName = item.product?.name || item.product?.Name || 'Unknown Product';
            const price = item.product?.price || item.product?.Price || 0;
            const itemTotal = price * item.quantity;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(productName)}</div>
                    <div class="cart-item-price">${formatPrice(price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-action="decrease" data-item-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-item-id="${item.id}">+</button>
                    <button class="remove-item" data-item-id="${item.id}">Remove</button>
                </div>
            `;
            container.appendChild(itemElement);
        });

        const totalElement = document.getElementById('cartTotal');
        if (totalElement) totalElement.textContent = formatPrice(total);

        attachCartItemEventListeners(cartId);

    } catch (error) {
        console.error("Error rendering cart:", error);
        container.innerHTML = '<div class="empty-cart">Error loading cart</div>';
        if (footer) footer.style.display = 'none';
    }
}

function attachCartItemEventListeners(cartId) {
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const itemId = parseInt(btn.dataset.itemId);
            const action = btn.dataset.action;
            await updateCartItemQuantity(cartId, itemId, action);
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const itemId = parseInt(btn.dataset.itemId);
            await removeFromCart(cartId, itemId);
        });
    });
}

async function updateCartItemQuantity(cartId, itemId, action) {
    try {
        const cart = await getCart(cartId);
        const item = cart.items.find(i => i.id === itemId);

        if (item) {
            let newQuantity = item.quantity;
            if (action === 'increase') newQuantity++;
            else if (action === 'decrease') newQuantity--;

            if (newQuantity <= 0) {
                await removeCartItem(cartId, itemId);
            } else {
                await updateCartItemQuantityApi(cartId, itemId, newQuantity);
            }
        }

        await renderCartItems(cartId);
        await updateCartCountBadge(cartId);

    } catch (error) {
        console.error("Error updating quantity:", error);
        showMessage("Failed to update quantity", "error");
    }
}

async function removeFromCart(cartId, itemId) {
    try {
        await removeCartItem(cartId, itemId);
        await renderCartItems(cartId);
        await updateCartCountBadge(cartId);
        showMessage("Item removed from cart", "success");
    } catch (error) {
        console.error("Error removing item:", error);
        showMessage("Failed to remove item", "error");
    }
}

async function updateCartCountBadge(cartId) {
    try {
        const cart = await getCart(cartId);
        const itemCount = cart?.items?.length || 0;
        const cartCountElement = document.getElementById('cartCount');

        if (cartCountElement) {
            cartCountElement.textContent = itemCount;
            cartCountElement.style.display = itemCount > 0 ? 'inline-block' : 'none';
        }

        localStorage.setItem('cartItemCount', itemCount);
        return itemCount;
    } catch (error) {
        console.error("Error updating cart count:", error);
        return 0;
    }
}

function initCartUI() {
    const modal = createCartModal();

    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', async () => {
            const cartId = localStorage.getItem('cartId');
            if (!cartId) {
                showMessage("Your cart is empty", "info");
                return;
            }
            modal.style.display = 'block';
            await renderCartItems(cartId);
        });
    }

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = '/checkout.html';
        });
    }

    const cartId = localStorage.getItem('cartId');
    if (cartId) updateCartCountBadge(cartId);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initCartUI();
});