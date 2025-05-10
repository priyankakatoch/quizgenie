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

    // Quiz data
    const quizData = [
        {
            question: "What does HTML stand for?",
            a: "Hyper Text Markup Language",
            b: "Hyper Text Multiple Language",
            c: "Hyper Tool Multi Language",
            d: "Hyper Text Mobile Language",
            correct: "a"
        },
        {
            question: "What does CSS stand for?",
            a: "Central Style Sheets",
            b: "Cascading Style Sheets",
            c: "Cascading Simple Sheets",
            d: "Computer Style Sheets",
            correct: "b"
        },
        {
            question: "Which language runs in a web browser?",
            a: "Java",
            b: "C",
            c: "Python",
            d: "JavaScript",
            correct: "d"
        },
        {
            question: "What year was JavaScript launched?",
            a: "1996",
            b: "1995",
            c: "1994",
            d: "None of the above",
            correct: "b"
        },
        {
            question: "Which is not a JavaScript Framework?",
            a: "React",
            b: "Angular",
            c: "Vue",
            d: "Django",
            correct: "d"
        }
    ];

    const questionEl = document.getElementById('question');
    const a_text = document.getElementById('a_text');
    const b_text = document.getElementById('b_text');
    const c_text = document.getElementById('c_text');
    const d_text = document.getElementById('d_text');
    const submitBtn = document.getElementById('submit');
    const answerEls = document.querySelectorAll('.answer');
    const currentQuestionEl = document.getElementById('current-question');
    const totalQuestionsEl = document.getElementById('total-questions');

    let currentQuiz = 0;
    let score = 0;

    totalQuestionsEl.textContent = quizData.length;

    // Load quiz
    loadQuiz();

    function loadQuiz() {
        deselectAnswers();

        const currentQuizData = quizData[currentQuiz];

        questionEl.innerText = currentQuizData.question;
        a_text.innerText = currentQuizData.a;
        b_text.innerText = currentQuizData.b;
        c_text.innerText = currentQuizData.c;
        d_text.innerText = currentQuizData.d;
        
        currentQuestionEl.textContent = currentQuiz + 1;
    }

    function deselectAnswers() {
        answerEls.forEach(answerEl => answerEl.checked = false);
    }

    function getSelected() {
        let answer;

        answerEls.forEach(answerEl => {
            if(answerEl.checked) {
                answer = answerEl.id;
            }
        });

        return answer;
    }

    submitBtn.addEventListener('click', () => {
        const answer = getSelected();

        if(answer) {
            if(answer === quizData[currentQuiz].correct) {
                score++;
            }

            currentQuiz++;
            
            if(currentQuiz < quizData.length) {
                loadQuiz();
            } else {
                // Show results
                const quizContainer = document.querySelector('.quiz-container');
                quizContainer.innerHTML = `
                    <h2>You answered correctly ${score}/${quizData.length} questions.</h2>
                    <button onclick="location.reload()" style="background-color: #0088ff; color: white; border: 2px solid #0088ff; padding: 0.8rem 2.5rem; font-size: 1.1rem; border-radius: 5px; cursor: pointer; transition: all 0.3s; margin-top: 2rem; width: 100%;">Reload</button>
                `;
            }
        }
    });
}); 