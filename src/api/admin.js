const API_BASE = '/api/auth';

export async function fetchPendingUsers() {
    const res = await fetch(`${API_BASE}/pending`);
    if (!res.ok) throw new Error('Failed to fetch pending users'); 
    return res.json();
}

export async function approveUser(id) {
    const res = await fetch(`${API_BASE}/approve/${id}`, { method: 'PATCH' });

    if (!res.ok) throw new Error('Failed to approve user');
}

export async function rejectUser(id) {
    const res = await fetch(`${API_BASE}/reject/${id}`, { method: 'PATCH' });

    if (!res.ok) throw new Error('Failed to reject user');
}