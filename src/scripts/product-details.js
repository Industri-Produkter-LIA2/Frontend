import { deleteProduct, updateProduct } from '../api/products.js';
import { isAdmin } from '../ui/auth.js';
import { getCategories } from '../constants/categories.js';

const form = document.getElementById('update-product-form');
const updateBtn = document.getElementById('update-product');
const submitBtn = document.getElementById('submit-update');

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    return Number.isNaN(id) ? null : id;
}

async function populateCategoryDropdown() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;
    
    const categories = await getCategories();
    
    categorySelect.innerHTML = '';
    
    categories.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        categorySelect.appendChild(option);
    });
}

async function loadProductDetails() {
    const id = getProductIdFromUrl();
    if (!id) return;
    
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) {
        document.getElementById('product-details-container').textContent = 'Failed to load product';
        return;
    }
    
    const product = await res.json();
    
    document.getElementById('name').value = product.name;
    document.getElementById('articleNumber').value = product.articleNumber;
    document.getElementById('price').value = product.price;
    document.getElementById('description').value = product.description;
    document.getElementById('imageUrl').value = product.imageUrl;
    document.getElementById('category').value = product.category;
    
    document.getElementById('product-details-container').innerHTML = `
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <p><strong>${product.price} kr</strong></p>
  `;
}

updateBtn.onclick = async () => {
    if (!form) return;
    
    form.hidden = !form.hidden;
    
    const id = getProductIdFromUrl();
    
    if (!id) {
        alert('Invalid product ID');
        return;
    }
    
    updateBtn.textContent = form.hidden ? 'Update Product' : 'Cancel';
    
    if (!form.hidden) {
        await populateCategoryDropdown();
        await loadProductDetails();
    }
};

submitBtn.onclick = async (e) => {
    e.preventDefault();
    if (!form) return;

    const id = getProductIdFromUrl();
    
    if (!id) {
        alert('Invalid product ID');
        return;
    }
    
    const data = {
        name: document.getElementById('name').value.trim(),
        articleNumber: document.getElementById('articleNumber').value.trim(),
        price: Number(document.getElementById('price').value),
        description: document.getElementById('description').value.trim(),
        imageUrl: document.getElementById('imageUrl').value.trim(),
        category: document.getElementById('category').value,
    };
    
    if (!data.name || !data.articleNumber || !data.price) {
        alert('Required fields missing');
        return;
    }
    
    await updateProduct(id, data);
    
    alert('Updated');
    
    form.hidden = true;
    updateBtn.textContent = 'Update Product';
    
    await loadProductDetails();
};

document.getElementById('delete-product').onclick = async () => {
    if (!confirm('Delete this product?')) return;
    
    const id = getProductIdFromUrl();
    
    if (!id) {
        alert('Invalid product ID');
        return;
    }
    
    await deleteProduct(id);
    
    window.location.href = '/products';
};

if (!isAdmin()) {
    updateBtn?.remove();
    document.getElementById('delete-product')?.remove();
}

loadProductDetails();