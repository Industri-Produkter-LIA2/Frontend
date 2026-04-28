const API_BASE = '/api/products';

export async function createProduct(data) {
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error('Failed to create product');
        return res.json();
}

export async function updateProduct(id, data) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to update product');
}

export async function deleteProduct(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete product');
}