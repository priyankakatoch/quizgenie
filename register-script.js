document.addEventListener('DOMContentLoaded', () => {
    // Toggle password visibility for both password fields
    const togglePasswords = document.querySelectorAll('.toggle-password');
    
    togglePasswords.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            // Toggle type attribute
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle eye icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
    
    // Form submission handler
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = this.username.value.trim();
            const email = this.email.value.trim();
            const password = this.password.value;
            const confirmPassword = this.confirmPassword.value;
            
            // Basic validation
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
            
            // Check if username already exists
            const users = JSON.parse(localStorage.getItem('quizUsers') || '[]');
            if (users.some(user => user.username === username)) {
                alert('Username already exists!');
                return;
            }
            
            // Store user data
            const newUser = {
                username,
                email,
                password: btoa(password), // Basic encoding (not secure for production)
                registeredDate: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('quizUsers', JSON.stringify(users));
            
            // Show success message
            alert('Registration successful! Please login to continue.');
            
            // Redirect to login page
            window.location.href = 'login.html';
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