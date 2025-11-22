// Authentication JavaScript

const API_URL = 'http://localhost:5000/api';

// Form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const messageDiv = document.getElementById('message');

// Form switching
document.getElementById('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    forgotPasswordForm.classList.add('hidden');
    resetPasswordForm.classList.add('hidden');
    clearMessage();
});

document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    forgotPasswordForm.classList.add('hidden');
    resetPasswordForm.classList.add('hidden');
    clearMessage();
});

document.getElementById('showForgotPassword')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    forgotPasswordForm.classList.remove('hidden');
    resetPasswordForm.classList.add('hidden');
    clearMessage();
});

document.getElementById('showLoginFromForgot')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    forgotPasswordForm.classList.add('hidden');
    resetPasswordForm.classList.add('hidden');
    clearMessage();
});

document.getElementById('showLoginFromReset')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    forgotPasswordForm.classList.add('hidden');
    resetPasswordForm.classList.add('hidden');
    clearMessage();
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const full_name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            setTimeout(() => {
                document.getElementById('showLogin').click();
            }, 1500);
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Forgot Password
let resetEmail = '';
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    resetEmail = document.getElementById('forgotEmail').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resetEmail })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(`OTP sent! (Test OTP: ${data.otp})`, 'success');
            setTimeout(() => {
                forgotPasswordForm.classList.add('hidden');
                resetPasswordForm.classList.remove('hidden');
            }, 2000);
        } else {
            showMessage(data.error || 'Failed to send OTP', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Reset Password
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const otp = document.getElementById('resetOtp').value;
    const new_password = document.getElementById('resetNewPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resetEmail, otp, new_password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Password reset successful! Please login.', 'success');
            setTimeout(() => {
                document.getElementById('showLoginFromReset').click();
            }, 1500);
        } else {
            showMessage(data.error || 'Password reset failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
});

// Helper functions
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
}

function clearMessage() {
    messageDiv.classList.add('hidden');
}
