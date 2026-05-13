import { Roles } from '../constants/roles.js';

export function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem('user');
}

export function isAdmin() {
    const user = getUser();
    return user?.role === Roles.Admin;
}

export function requireAdmin() {
    const user = getUser();
    if (!user || !isAdmin()) {
        alert('Access denied. Admins only.');
        window.location.href = '/';
        return false;
    }

    return true;
}
