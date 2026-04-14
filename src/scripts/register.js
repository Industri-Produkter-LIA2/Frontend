import { register } from '../api/auth';

document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const payload = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password,
        companyName: document.getElementById('company').value,
        orgNumber: document.getElementById('org').value
    };

    try {
        await register(payload);

        alert('Registration successful! Please await approval.');
        window.location.href = '/login';
    } catch (err) {
        alert(`Registration failed: ${err.message}`);
    }
};