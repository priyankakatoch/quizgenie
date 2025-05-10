# Quiz Website

A modern, responsive quiz website with a beautiful hexagon background design.

## Features

- Responsive design that works on all devices
- Attractive hexagon background pattern
- Multiple-choice quiz functionality
- Score tracking and final results

## Project Structure

- `index.html` - Main landing page with the "Start Quiz" button
- `quiz.html` - The actual quiz interface
- `styles.css` - Main styling for the website
- `quiz-styles.css` - Specific styling for the quiz interface
- `script.js` - JavaScript for the main page
- `quiz-script.js` - JavaScript for the quiz functionality

## How to Use

1. Clone or download this repository
2. Open the `index.html` file in your web browser
3. Click the "Start Quiz" button to begin the quiz
4. Answer the questions and submit your answers
5. View your final score at the end

## Customization

You can easily customize the quiz by modifying the `quizData` array in the `quiz-script.js` file. Each question is an object with the following structure:

```javascript
{
    question: "Your question here?",
    a: "Option A",
    b: "Option B",
    c: "Option C",
    d: "Option D",
    correct: "a" // The ID of the correct answer
}
```

## Credits

This project was created as a demo for a modern quiz website. 