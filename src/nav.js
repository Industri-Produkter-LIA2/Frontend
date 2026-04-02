export function initNav() {
  const MENU_ITEMS = [
    { title: 'Home', href: '/' },
    { title: 'Products', href: '/products' },
  ];

  const LOGIN_URL = '/login';

  const navList = document.getElementById('nav-list');
  const navEl = document.getElementById('page-nav');
  const toggle = document.getElementById('nav-toggle');
  const loginBtn = document.getElementById('login-btn');

  if (!navList || !navEl || !toggle || !loginBtn) {
    console.warn('Nav elements not found');
    return;
  }

  MENU_ITEMS.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.title;
    a.setAttribute('role', 'menuitem');
    li.appendChild(a);
    navList.appendChild(li);
  });

  loginBtn.addEventListener('click', () => {
    window.location.href = LOGIN_URL;
  });

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