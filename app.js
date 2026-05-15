import { initNav } from './src/ui/nav.js';
import { loadAndRenderProducts ,loadAndRenderProductDetails} from './src/api.js';

export function initApp() {
  initNav();
  console.log('Frontend Loaded');
  
  if (document.getElementById('products')) {
    loadAndRenderProducts();
    
    import('./src/scripts/products.js');
  }
  // Logic for Product Details page
  if (document.getElementById('product-details-container')) {
    loadAndRenderProductDetails();
    
    import ('./src/scripts/product-details.js');
  }
  
  // Page specific script loading based on current url path.
  if (window.location.pathname === '/login') import ('./src/scripts/login.js');
  if (window.location.pathname === '/register') import ('./src/scripts/register.js');
  if (window.location.pathname === '/admin') import ('./src/scripts/admin.js');
 // Use startsWith so it catches both '/profile' and '/profile/1'
  if (window.location.pathname.startsWith('/profile')) {
      import('/src/scripts/profile.js').then(module => module.initProfile());
  }
  if (window.location.pathname === '/orders') import ('./src/scripts/orders.js');
}
