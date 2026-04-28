import { createProduct } from '../api/products.js';
import { getCategories } from '../constants/categories.js';
import { isAdmin } from '../ui/auth.js';
import { loadAndRenderProducts } from '../api.js';

const form = document.getElementById('add-product-form');
const btn = document.getElementById('add-product-btn');

btn.onclick = () => {
	form.hidden = !form.hidden;

	if (!form.hidden) {
		populateCategoryDropdown();
	}
};

form.onsubmit = async (e) => {
	e.preventDefault();
	const data = {
		name: document.getElementById('name').value,
		articleNumber: document.getElementById('articleNumber').value,
		price: Number(document.getElementById('price').value),
		description: document.getElementById('description').value,
		imageUrl: document.getElementById('imageUrl').value,
		category: document.getElementById('category').value,
	};

	if (!data.name || !data.articleNumber || !data.price || data.price <= 0) {
		alert('Name, Article Number and a valid Price are required');
		return;
	}

	try {
		await createProduct(data);
		alert('Product created');

		loadAndRenderProducts();

		form.reset();
		form.hidden = true;
	} catch (err) {
		alert(err.message);
	}
};

async function populateCategoryDropdown() {
	const categorySelect = document.getElementById('category');
	if (!categorySelect) return;

	const categories = await getCategories();

	categorySelect.innerHTML = '';

	categories.forEach((c) => {
		const option = document.createElement('option');
		option.value = c;
		option.textContent = c;
		categorySelect.appendChild(option);
	});
}

if (!isAdmin()) {
	document.getElementById('add-product-btn')?.remove();
}
