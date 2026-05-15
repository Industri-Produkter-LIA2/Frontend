import { fetchCart, updateCartItemQuantity, removeCartItem, clearEntireCart, formatPrice, escapeHtml } from '../api.js';
import { getUser } from '../ui/auth.js';

export async function initCart() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    if (!container) return;

    const user = getUser();
    if (!user) return; // Guard clause in case the user is not authenticated

    const cart = await fetchCart(user.customerId);

    // Check if cart is empty, null, or undefined
    if (!cart?.items?.length) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty.</p>';
        summary.innerHTML = '';
        return;
    }

    renderCartItems(cart, container, summary);
}

function renderCartItems(cart, container, summary) {
    let grandTotal = 0;

    // 1. Build the HTML string for all items
    const itemsHtml = cart.items.map(item => {
        // Normalize properties to handle varying API casing
        const cartItemId = item.id || item.Id; 
        const productId = item.productId || item.ProductId;
        const name = item.productName || item.ProductName || 'Unknown Product';
        const price = item.price || item.Price || 0;
        const qty = item.quantity || item.Quantity || 1;
        
        const lineTotal = price * qty;
        grandTotal += lineTotal;

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee;">
                <div style="flex: 2;">
                    <h4 style="margin: 0;">${escapeHtml(name)}</h4>
                    <p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">${formatPrice(price)} each</p>
                </div>
                
                <div style="flex: 1; display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <button class="btn-minus" data-product-id="${productId}" data-cart-item-id="${cartItemId}" style="width: 30px; height: 30px; cursor: pointer; border: 1px solid #ccc; background: #fff; border-radius: 4px;">-</button>
                    <span id="qty-${productId}" style="font-weight: bold; width: 25px; text-align: center;">${qty}</span>
                    <button class="btn-plus" data-product-id="${productId}" style="width: 30px; height: 30px; cursor: pointer; border: 1px solid #ccc; background: #fff; border-radius: 4px;">+</button>
                </div>
                
                <div style="flex: 1; font-weight: bold; text-align: right; font-size: 1.1rem; display: flex; justify-content: flex-end; align-items: center; gap: 15px;">
                    ${formatPrice(lineTotal)}
                    <button class="btn-remove" data-cart-item-id="${cartItemId}" style="background: none; border: none; color: #f44336; cursor: pointer; font-size: 1.2rem;" title="Remove Item">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    // 2. Inject HTML into the DOM
    container.innerHTML = itemsHtml;
    summary.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px;">
            <button id="btn-clear-cart" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Clear Cart</button>
            <span>Total: ${formatPrice(grandTotal)}</span>
        </div>
    `;

    // 3. Attach Listeners to the newly created elements
    attachEventListeners(cart, container, summary);
}

function attachEventListeners(cart, container, summary) {
    // Plus Buttons
    container.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            const item = cart.items.find(i => (i.productId || i.ProductId) === productId);
            const currentQty = item.quantity || item.Quantity;
            
            await handleQuantityChange(productId, currentQty + 1);
        });
    });

    // Minus Buttons (Deletes if quantity hits 0)
    container.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            const cartItemId = parseInt(e.target.getAttribute('data-cart-item-id'));
            const item = cart.items.find(i => (i.productId || i.ProductId) === productId);
            const newQty = (item.quantity || item.Quantity) - 1;
            
            if (newQty <= 0) {
                await handleRemoveItem(cartItemId);
            } else {
                await handleQuantityChange(productId, newQty);
            }
        });
    });

    // Trash Can Buttons
    container.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cartItemId = parseInt(e.target.getAttribute('data-cart-item-id'));
            await handleRemoveItem(cartItemId);
        });
    });

    // Clear Entire Cart Button
    const clearBtn = summary.querySelector('#btn-clear-cart');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (confirm("Are you sure you want to empty your cart?")) {
                const success = await clearEntireCart();
                if (success) {
                    initCart(); 
                    window.dispatchEvent(new Event('cartUpdated')); 
                }
            }
        });
    }
}

// --- API Helpers ---

async function handleQuantityChange(productId, newQuantity) {
    const success = await updateCartItemQuantity(productId, newQuantity);
    if (success) {
        initCart(); // Refresh the screen instantly
    } else {
        alert("Failed to update cart. Please try again.");
    }
}

async function handleRemoveItem(cartItemId) {
    const success = await removeCartItem(cartItemId);
    if (success) {
        initCart(); // Refresh the screen
        window.dispatchEvent(new Event('cartUpdated')); // Update the header number
    } else {
        alert("Failed to remove item. Please try again.");
    }
}