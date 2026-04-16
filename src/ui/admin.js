export function renderUsers(container, users, onApprove) {
    container.innerHTML = '';

    if (users.length === 0) {
        container.textContent = 'No pending accounts';
        return;
    }

    users.forEach(user => {
        const div = document.createElement('div');

        div.innerHTML = `
            <p>
                <strong>${user.username}</strong> (${user.email})<br>
                Company Name: ${user.companyName ?? 'N/A'}<br>
                Organization Number: ${user.orgNumber ?? 'N/A'}
            </p>
            <button>Approve</button>
            <hr>
        `;
    
        const button = div.querySelector('button');
        button.onclick = async () => {
            button.disabled = true;
            button.textContent = 'Approving...';

            try {
                await onApprove(user.id);
            } catch (err) {
                alert('Error approving user: ' + err.message);
                button.disabled = false;
                button.textContent = 'Approve';
            }
        };

        container.appendChild(div);
    });
}