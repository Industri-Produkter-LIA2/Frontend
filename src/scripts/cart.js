import { fetchCart, updateCartItemQuantity, removeCartItem, clearEntireCart,formatPrice, escapeHtml } from '../api.js';
import {getUser} from '../ui/auth.js';

export async function initCart() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    if (!container) return;

    var user = getUser();

    // 1. Fetch cart from C# (This now relies purely on api.js using the cartId)
    const cart = await fetchCart(user.customerId);

    console.log('cart view :' , cart);

    // 2. Check if cart is empty or null
    if (!cart || !cart.items || cart.items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty.</p>';
        summary.innerHTML = '';
        return;
    }

    // 3. Render the items
    renderCartItems(cart, container, summary);
}

function renderCartItems(cart, container, summary) {
    container.innerHTML = '';
    let grandTotal = 0;

    cart.items.forEach(item => {
        const itemId = item.id || item.Id;                   // The unique CartItem ID
        const id = item.productId || item.ProductId;
        const name = item.productName || item.ProductName || 'Unknown Product';
        const price = item.price || item.Price || 0;
        const qty = item.quantity || item.Quantity || 1;
        
        const lineTotal = price * qty;
        grandTotal += lineTotal;

        const itemDiv = document.createElement('div');
        itemDiv.style = "display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee;";

        // ADDED: The Trash Can button
        itemDiv.innerHTML = `
            <div style="flex: 2;">
                <h4 style="margin: 0;">${escapeHtml(name)}</h4>
                <p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">${formatPrice(price)} each</p>
            </div>
            
            <div style="flex: 1; display: flex; align-items: center; gap: 10px; justify-content: center;">
                <button class="btn-minus" data-id="${id}" style="width: 30px; height: 30px; cursor: pointer; border: 1px solid #ccc; background: #fff; border-radius: 4px;">-</button>
                <span id="qty-${id}" style="font-weight: bold; width: 25px; text-align: center;">${qty}</span>
                <button class="btn-plus" data-id="${id}" style="width: 30px; height: 30px; cursor: pointer; border: 1px solid #ccc; background: #fff; border-radius: 4px;">+</button>
            </div>
            
            <div style="flex: 1; font-weight: bold; text-align: right; font-size: 1.1rem; display: flex; justify-content: flex-end; align-items: center; gap: 15px;">
                ${formatPrice(lineTotal)}
                <button class="btn-remove" data-id="${itemId}" style="background: none; border: none; color: #f44336; cursor: pointer; font-size: 1.2rem;" title="Remove Item">🗑️</button>
            </div>
        `;

        container.appendChild(itemDiv);
    });

    // ADDED: Clear Cart button next to the total
    summary.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px;">
            <button id="btn-clear-cart" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Clear Cart</button>
            <span>Total: ${formatPrice(grandTotal)}</span>
        </div>
    `;

    // --- ATTACH EVENT LISTENERS ---

    // Plus Buttons
    document.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = cart.items.find(i => (i.productId || i.ProductId) === id);
            await handleQuantityChange(id, (item.quantity || item.Quantity) + 1);
        });
    });

    // Minus Buttons (If it hits 0, delete it!)
    document.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = cart.items.find(i => (i.productId || i.ProductId) === id);
            const newQty = (item.quantity || item.Quantity) - 1;
            
            if (newQty <= 0) {
                await handleRemoveItem(item.id); // Delete if 0
            } else {
                await handleQuantityChange(id, newQty);
            }
        });
    });

    // Trash Can Buttons
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            await handleRemoveItem(id);
        });
    });

    // Clear Entire Cart Button
    const clearBtn = document.getElementById('btn-clear-cart');
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
// Helper to call the API and refresh the screen
async function handleQuantityChange(productId, newQuantity) {
    const success = await updateCartItemQuantity(productId, newQuantity);
    if (success) {
        // If the database updated successfully, instantly refresh the cart UI
        initCart(); 
    } else {
        alert("Failed to update cart. Please try again.");
    }
}

// Keep your existing handleQuantityChange here...

// NEW HELPER: Handles deleting an item and refreshing UI
async function handleRemoveItem(productId) {
    const success = await removeCartItem(productId);
    if (success) {
        initCart(); // Refresh the screen
        window.dispatchEvent(new Event('cartUpdated')); // Update the header number
    } else {
        alert("Failed to remove item. Please try again.");
    }
}