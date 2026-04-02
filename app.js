import { loadAndRenderProducts } from './src/api.js';

export function initApp() {
  console.log('Frontend Loaded');
  
  if (document.getElementById('products')) {
    loadAndRenderProducts();
  }
}