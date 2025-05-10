document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const closeMenuBtn = document.querySelector('.close-menu');
    const mobileMenu = document.querySelector('nav ul');

    // Function to handle mobile menu
    function setupMobileMenu() {
        if (window.innerWidth <= 480) {
            closeMenuBtn.style.display = 'block';
        } else {
            closeMenuBtn.style.display = 'none';
        }
    }

    // Toggle menu on small screens
    closeMenuBtn.addEventListener('click', () => {
        if (mobileMenu.style.right === '0px') {
            mobileMenu.style.right = '-100%';
        } else {
            mobileMenu.style.right = '0px';
        }
    });

    // Handle window resize
    window.addEventListener('resize', setupMobileMenu);
    setupMobileMenu();

    // Start Quiz button functionality
    const startQuizBtn = document.querySelector('.start-quiz');
    startQuizBtn.addEventListener('click', startQuiz);

    function startQuiz() {
        // Redirect to the quiz page
        window.location.href = 'quiz.html';
    }
}); 