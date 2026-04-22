export function renderUsers(container, users, { onApprove, onReject }) {
    container.innerHTML = '';

    if (users.length === 0) {
        container.textContent = 'No pending accounts';
        return;
    }

    const table = document.createElement('table');

    table.innerHTML = `
        <thead>
            <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Company Name</th>
                <th>Organization Number</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    users.forEach(user => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.companyName ?? 'N/A'}</td>
            <td>${user.orgNumber ?? 'N/A'}</td>
            <td>
                <button class="approve-btn">Approve</button>
                <button class="reject-btn">Reject</button>
            </td>
        `;
    
        const approveBtn = row.querySelector('.approve-btn');
        const rejectBtn = row.querySelector('.reject-btn');

        approveBtn.onclick = async () => {
            approveBtn.disabled = true;
            rejectBtn.disabled = true;
            approveBtn.textContent = 'Approving...';

            try {
                await onApprove(user.id);
            } catch (err) {
                alert('Error approving user: ' + err.message);
                approveBtn.disabled = false;
                rejectBtn.disabled = false;
                approveBtn.textContent = 'Approve';
            }
        };

        rejectBtn.onclick = async () => {
            if (!confirm(`Are you sure you want to reject ${user.username}'s account?`)) return;

            rejectBtn.disabled = true;
            approveBtn.disabled = true;
            rejectBtn.textContent = 'Rejecting...';

            try {
                await onReject(user.id);
            } catch (err) {
                alert('Error rejecting user: ' + err.message);
                rejectBtn.disabled = false;
                approveBtn.disabled = false;
                rejectBtn.textContent = 'Reject';
            }
        };

        tbody.appendChild(row);

    });

    container.appendChild(table);
}