// Clean Theme Utilities

document.addEventListener('DOMContentLoaded', () => {
    // Add active state to navigation based on current path
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === '/dashboard.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Role-based sidebar display
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.role_name === 'ADMIN') {
                const empNav = document.getElementById('nav-employees');
                if (empNav) empNav.style.display = 'block';
            }
        } catch(e) {}
    }
    
    // Add toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Toast notification system
    window.showToast = (message, type = 'info') => {
        const container = document.querySelector('.toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    };
    
    // Basic modal handlers (can be used globally)
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    };
    
    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    };
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});
