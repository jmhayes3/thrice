const express = require('express');
const path = require('path');
const questionsRoute = require('./routes/questions');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/questions', questionsRoute);

// Serve trivia game page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

