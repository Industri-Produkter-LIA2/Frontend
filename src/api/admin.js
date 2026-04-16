const API_BASE = 'https://localhost:7040/api/auth';

export async function fetchPendingUsers() {
    const res = await fetch(`${API_BASE}/pending`);
    if (!res.ok) throw new Error('Failed to fetch pending users'); 
    return res.json();
}

export async function approveUser(id) {
    const res = await fetch(`${API_BASE}/approve/${id}`, { method: 'PATCH' });

    if (!res.ok) throw new Error('Failed to approve user');
}