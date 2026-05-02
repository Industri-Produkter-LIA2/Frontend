import { getUser, logout, isAdmin } from './auth.js';

import{fetchCart} from '../api.js';

export function initNav() {
  const navList = document.getElementById('nav-list');
  const navEl = document.getElementById('page-nav');
  const toggle = document.getElementById('nav-toggle');
  const loginBtn = document.getElementById('login-btn');

  if (!navList || !navEl || !toggle || !loginBtn) {
    console.warn('Nav elements not found');
    return;
  }

  const user = getUser();

  const MENU_ITEMS = [
  { title: 'Home', href: '/' },
  { title: 'Products', href: '/products' },
  ];

  if (!user) {
    MENU_ITEMS.push({ title: 'Register', href: '/register' });
  }else {
    // USER IS LOGGED IN - Add Profile link
    // Adjust 'user.customerId' or 'user.id' to match exactly what your auth.js returns.
    // We fall back to localStorage just in case you stored it there directly.
    const customerId = user.id;
    if (customerId) {
        MENU_ITEMS.push({ title: 'Profile', href: `/profile/${customerId}` });
    }
  }

  if (user && isAdmin()) {
    MENU_ITEMS.push({ title: 'Admin Panel', href: '/admin' });
  }

  navList.innerHTML = '';

  MENU_ITEMS.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.title;
    a.setAttribute('role', 'menuitem');
    li.appendChild(a);
    navList.appendChild(li);
  });

  UpdateAuthUI(loginBtn);

  function closeNav() {
    navEl.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    navEl.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', (e) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    (isOpen ? closeNav() : openNav());
    e.stopPropagation();
  });

  document.addEventListener('click', (e) => {
    if (!navEl.contains(e.target) && e.target !== toggle) closeNav();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

function UpdateAuthUI(loginBtn) {
    const LOGIN_URL = '/login';
    const user = getUser();
    const headerActions = document.querySelector('.header-actions');

    // Clean up existing elements to prevent duplicates
    const existingAvatar = document.getElementById('header-avatar');
    if (existingAvatar) existingAvatar.remove();
    
    const existingCart = document.getElementById('header-cart-btn');
    if (existingCart) existingCart.remove();

    if (user) {
        const loggedInId = user.id || user.Id || user.customerId || user.accountId;

        // 1. CREATE CART BUTTON
        const cartBtn = document.createElement('button');
        cartBtn.id = 'header-cart-btn';
        cartBtn.style.padding = "0.5rem 1rem";
        cartBtn.style.marginRight = "10px";
        cartBtn.style.cursor = "pointer";
        cartBtn.style.backgroundColor = "#fff";
        cartBtn.style.border = "1px solid #ccc";
        cartBtn.style.borderRadius = "4px";
        cartBtn.onclick = () => { window.location.href = '/cart'; };
        
        if (headerActions) headerActions.insertBefore(cartBtn, loginBtn);

        // 2. CREATE AVATAR
        const avatar = document.createElement('a');
        avatar.id = 'header-avatar';
        avatar.href = `/profile/${loggedInId}`;
        avatar.className = 'profile-avatar';
        avatar.textContent = (user.username || user.email || 'U').charAt(0).toUpperCase();
        
        if (headerActions) headerActions.insertBefore(avatar, loginBtn);

        // 3. LOGIC TO FETCH AND UPDATE CART NUMBER
        const updateCartDisplay = async () => {
            const cart = await fetchCart(user.customerId); // Pass the User ID!
            console.log('from nav cart' , cart);
            localStorage.setItem('cartId', cart.id);
            if (cart && cart.items) {
                const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || item.Quantity), 0);
                cartBtn.textContent = `🛒 Cart (${totalItems})`;
            } else {
                cartBtn.textContent = `🛒 Cart (0)`;
            }
        };

        // Run immediately and listen for updates
        updateCartDisplay();
        window.addEventListener('cartUpdated', updateCartDisplay);

        // 4. SETUP LOGOUT
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = () => {
            logout();
            window.location.href = LOGIN_URL;
        };

    } else {
        // USER IS NOT LOGGED IN
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => {
            window.location.href = LOGIN_URL;
        };
    }
}