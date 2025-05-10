document.addEventListener('DOMContentLoaded', () => {
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            // Toggle type attribute
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Form submission handler
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = this.username.value.trim();
            const password = this.password.value;
            
            // Get stored users
            const users = JSON.parse(localStorage.getItem('quizUsers') || '[]');
            
            // Find user
            const user = users.find(u => u.username === username);
            
            if (!user) {
                alert('User not found! Please register first.');
                return;
            }
            
            // Verify password (basic encoding check - not secure for production)
            if (btoa(password) !== user.password) {
                alert('Invalid password!');
                return;
            }
            
            // Store login status
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                email: user.email,
                loginTime: new Date().toISOString()
            }));
            
            // Redirect to quiz page
            window.location.href = 'quiz.html';
        });
    }
    
    // Sound icon click handler
    const soundIcon = document.querySelector('.sound-icon i');
    
    if (soundIcon) {
        soundIcon.addEventListener('click', function() {
            this.classList.toggle('fa-volume-up');
            this.classList.toggle('fa-volume-mute');
        });
    }
}); 