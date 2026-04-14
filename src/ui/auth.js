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

import { Roles } from '../constants/roles.js';

export function isAdmin() {
    const user = getUser();
    return user?.role === Roles.Admin;
}