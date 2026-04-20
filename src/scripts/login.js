import { login } from '../api/auth.js';
import { saveUser } from '../ui/auth.js';

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const user = await login(email, password);
        saveUser(user);
        alert('Login successful!');

        window.location.href = '/';
    } catch (err) {
        alert(`Login failed: ${err.message}`);
    }
};