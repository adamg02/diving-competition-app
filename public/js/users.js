// User Management JavaScript
let users = [];
let currentUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is admin
    try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        const data = await response.json();
        currentUser = data.user;
        
        if (currentUser.role !== 'admin') {
            alert('Access denied. This page is for administrators only.');
            window.location.href = '/';
            return;
        }
        
        await loadUsers();
    } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = '/login.html';
    }

    // Set up event listeners
    document.getElementById('role-form').addEventListener('submit', handleRoleChange);
    document.getElementById('cancel-role-btn').addEventListener('click', closeRoleModal);
});

// Load all users
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        const data = await response.json();
        users = data.users;
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users. Please try again.');
    }
}

// Display users in table
function displayUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No users found</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Highlight current user
        if (user.id === currentUser.id) {
            row.classList.add('current-user');
        }

        // User info with avatar
        const userCell = document.createElement('td');
        userCell.innerHTML = `
            <div class="user-cell">
                ${user.profile_photo ? `<img src="${user.profile_photo}" alt="${user.display_name}" class="user-avatar-small">` : '<div class="user-avatar-placeholder"></div>'}
                <span>${user.display_name || 'Unknown User'}</span>
            </div>
        `;
        row.appendChild(userCell);

        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = user.email || 'N/A';
        row.appendChild(emailCell);

        // Provider
        const providerCell = document.createElement('td');
        providerCell.innerHTML = `<span class="provider-badge provider-${user.provider}">${formatProvider(user.provider)}</span>`;
        row.appendChild(providerCell);

        // Role
        const roleCell = document.createElement('td');
        roleCell.innerHTML = `<span class="role-badge role-${user.role}">${user.role}</span>`;
        row.appendChild(roleCell);

        // Joined date
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(user.created_at);
        row.appendChild(dateCell);

        // Actions
        const actionsCell = document.createElement('td');
        const changeRoleBtn = document.createElement('button');
        changeRoleBtn.textContent = 'Change Role';
        changeRoleBtn.className = 'btn btn-small';
        
        // Disable button for current user
        if (user.id === currentUser.id) {
            changeRoleBtn.disabled = true;
            changeRoleBtn.title = 'You cannot change your own role';
        } else {
            changeRoleBtn.addEventListener('click', () => openRoleModal(user));
        }
        
        actionsCell.appendChild(changeRoleBtn);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
}

// Open role change modal
function openRoleModal(user) {
    document.getElementById('role-user-id').value = user.id;
    document.getElementById('role-modal-user').textContent = `Change role for ${user.display_name || user.email}`;
    document.getElementById('new-role').value = user.role;
    document.getElementById('role-modal').style.display = 'flex';
}

// Close role change modal
function closeRoleModal() {
    document.getElementById('role-modal').style.display = 'none';
    document.getElementById('role-form').reset();
}

// Handle role change
async function handleRoleChange(e) {
    e.preventDefault();
    
    const userId = document.getElementById('role-user-id').value;
    const newRole = document.getElementById('new-role').value;

    try {
        const response = await fetch(`/api/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update role');
        }

        alert('User role updated successfully!');
        closeRoleModal();
        await loadUsers();
    } catch (error) {
        console.error('Error updating role:', error);
        alert('Error: ' + error.message);
    }
}

// Format provider name
function formatProvider(provider) {
    const providers = {
        'google': 'Google',
        'microsoft': 'Microsoft',
        'facebook': 'Facebook'
    };
    return providers[provider] || provider;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
