const express = require('express');
const app = express();
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Sample questions
const questions = [
  { question: "America's oldest trail race is the Dipsea Race, running from Mill Valley to Stinson Beach in which state?", answer: "California" },
  { question: "The 1974 disaster movie Earthquake had two hours of Charlton Heston running along the knife's edge of death, in what state?", answer: "California" },
  { question: "Hustlers, the 101, and very heavy shadows come up in the theme song for The O.C., which was named after a county in what state?", answer: "California" }
];

// Serve trivia game page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for questions
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

