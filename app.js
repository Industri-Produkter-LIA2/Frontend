import { initNav } from './src/nav.js';
import { loadAndRenderProducts ,loadAndRenderProductDetails} from './src/api.js';

export function initApp() {
  initNav();
  console.log('Frontend Loaded');
  
  if (document.getElementById('products')) {
    loadAndRenderProducts();
  }
  // Logic for Product Details page
  if (document.getElementById('product-details-container')) {
    loadAndRenderProductDetails();
  }
}