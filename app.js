import { initNav } from './src/nav.js';
import { loadAndRenderProducts } from './src/api.js';

export function initApp() {
  initNav();
  console.log('Frontend Loaded');
  
  if (document.getElementById('products')) {
    loadAndRenderProducts();
  }
}