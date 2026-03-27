document.addEventListener('DOMContentLoaded', () => {
  console.log('Frontend loaded');
});

import { loadAndRenderProducts } from './src/api.js';

document.addEventListener('DOMContentLoaded', () => {
  loadAndRenderProducts();
});