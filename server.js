require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');

// Utility: Parse Gemini API response for MCQs
function extractQuestionsFromGeminiResponse(geminiData) {
    // Try to extract MCQs from Gemini response (assuming text format)
    if (!geminiData || !geminiData.candidates || !geminiData.candidates[0]) return [];
    const text = geminiData.candidates[0].content.parts[0].text;
    // Try to split by question or number pattern
    const questions = text.split(/\n\d+\.\s/).filter(Boolean);
    return questions.map((q, i) => `${i+1}. ${q.trim()}`);
}


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:3002', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB connection
pool.getConnection()
    .then(connection => {
        console.log('MySQL Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err);
        process.exit(1); // Exit if DB connection fails
    });

// API Endpoint to save quiz data
app.post('/api/save-quiz', async (req, res) => {
    const { title, questionLimit, difficulty, timeLimit, source, code, questions } = req.body;

    // Basic validation
    if (!title || !questionLimit || !difficulty || !code || !questions) {
        return res.status(400).json({ success: false, message: 'Missing required quiz data.' });
    }

    const questionsJson = JSON.stringify(questions);

    const sql = `
        INSERT INTO code (title, question_limit, difficulty, time_limit, source_file, quiz_code, questions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.execute(sql, [
            title,
            questionLimit,
            difficulty,
            timeLimit || null, // Handle potentially null timeLimit
            source || null,    // Handle potentially null source file name
            code,
            questionsJson
        ]);

        console.log(`Quiz saved successfully with code: ${code}, ID: ${result.insertId}`);
        res.status(201).json({ success: true, message: 'Quiz saved successfully.', quizCode: code });

    } catch (error) {
        console.error('Error saving quiz to database:', error);
        // Check for duplicate entry error (e.g., if quiz_code is a unique key)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Quiz code already exists.' });
        }
        res.status(500).json({ success: false, message: 'Failed to save quiz to database.' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    try {
        // Basic validation
        if (!username || !password) {
            console.log('Validation failed: missing username or password');
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Query database for user
        console.log('Querying database for user:', username);
        const [users] = await pool.execute(
            'SELECT * FROM register WHERE username = ? AND password = ?',
            [username, password]
        );
        console.log('Query result count:', users.length);

        if (users.length === 0) {
            console.log('No matching user found');
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];
        console.log('User found:', { username: user.username });
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
});

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check if username already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM register WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Insert new user into database
        await pool.execute(
            'INSERT INTO register (username, email, password, confirm_password) VALUES (?, ?, ?, ?)',
            [username, email, password, password]
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                username: username,
                email: email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during registration'
        });
    }
});

// PDF Upload and MCQ Generation Endpoint
const upload = multer({ dest: 'uploads/' });

app.post('/api/generate-mcq-from-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
        }
        const apiKey = req.headers['x-api-key'] || req.body.apiKey;
        if (!apiKey) {
            fs.unlinkSync(req.file.path);
            return res.status(401).json({ success: false, message: 'API key required' });
        }
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;
        console.log('Extracted PDF text (first 500 chars):', text.slice(0, 500));
        if (!text || text.trim().length < 50) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Could not extract meaningful text from PDF.' });
        }
        // Refined prompt
        const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
        const prompt = `You are a quiz generator. Read the following study material and generate 5 unique multiple-choice questions (MCQs) with 4 options each, and indicate the correct answer. Use only the provided content.\n\nSTUDY MATERIAL:\n${text.slice(0, 2000)}\n\nFormat:\n1. Question\nA. Option 1\nB. Option 2\nC. Option 3\nD. Option 4\nAnswer: Option letter\n`;
        const geminiResponse = await axios.post(geminiApiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        fs.unlinkSync(req.file.path);
        // Extract MCQs from Gemini response
        const questions = extractQuestionsFromGeminiResponse(geminiResponse.data);
        return res.json({ success: true, questions });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, message: 'Failed to generate quiz', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}); 