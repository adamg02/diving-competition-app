// Shared authentication UI logic
(async function() {
    try {
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
            const data = await response.json();
            displayUserInfo(data.user);
            // Dispatch custom event with user data for other scripts
            window.dispatchEvent(new CustomEvent('userLoaded', { detail: data.user }));
        } else {
            // Not authenticated, redirect to login
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = '/login.html';
            }
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
})();

function displayUserInfo(user) {
    // Find the nav element
    const nav = document.querySelector('nav');
    
    if (nav) {
        // Add User Management link for admins (before user info)
        if (user.role === 'admin') {
            // Check if users link doesn't already exist
            if (!nav.querySelector('a[href="/users.html"]')) {
                const usersLink = document.createElement('a');
                usersLink.href = '/users.html';
                usersLink.textContent = 'User Management';
                
                // Check if current page is users.html
                if (window.location.pathname === '/users.html') {
                    usersLink.className = 'active';
                }
                
                nav.appendChild(usersLink);
            }
        }
        
        // Create user info element
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <div class="user-display">
                ${user.profile_photo ? `<img src="${user.profile_photo}" alt="${user.display_name}" class="user-avatar">` : ''}
                <span class="user-name">${user.display_name || user.email}</span>
                <span class="user-role">${user.role}</span>
            </div>
            <a href="/auth/logout" class="logout-btn">Logout</a>
        `;
        
        nav.appendChild(userInfo);
    }
}
