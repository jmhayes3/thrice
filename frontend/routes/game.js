const express = require('express');
const cors = require('cors');

const router = express.Router();

// Middleware
router.use(express.json());
router.use(cors());

// Data structure for game questions
const gameData = {
  rounds: [
    {
      category: "Geography",
      answer: "Paris",
      questions: [
        "What is the capital of France?",
        "Which city is known as the City of Light?",
        "Where is the Eiffel Tower located?"
      ]
    },
    {
      category: "History",
      answer: "Napoleon",
      questions: [
        "Who declared himself Emperor of France in 1804?",
        "Which French leader was exiled to Elba?",
        "Who lost the Battle of Waterloo?"
      ]
    },
    {
      category: "Science",
      answer: "Water",
      questions: [
        "What is H2O commonly known as?",
        "What substance covers about 71% of the Earth's surface?",
        "Which liquid is essential for human survival?"
      ]
    },
    {
      category: "Movies",
      answer: "Titanic",
      questions: [
        "Which movie features a ship hitting an iceberg?",
        "What film starred Leonardo DiCaprio and Kate Winslet in 1997?",
        "What is the name of the luxury liner in a James Cameron film?"
      ]
    },
    {
      category: "Sports",
      answer: "Soccer",
      questions: [
        "Which sport is known as football outside the United States?",
        "In which sport is a goal scored by kicking the ball?",
        "Which game has the FIFA World Cup as its main competition?"
      ]
    }
  ]
};


// Game session storage
const gameSessions = new Map();

class GameSession {
  constructor() {
    this.currentRound = 0;
    this.currentQuestion = 0;
    this.score = 0;
    this.attempts = 0;
    this.completed = false;
  }
}

// API Endpoints

// Start new game
router.post('/game/start', (req, res) => {
  const sessionId = Date.now().toString();
  const session = new GameSession();
  gameSessions.set(sessionId, session);

  res.json({
    sessionId,
    message: "Game started",
    firstQuestion: getQuestion(session)
  });
});

// Submit answer
router.post('/game/answer', (req, res) => {
  const { sessionId, answer } = req.body;
  const session = gameSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Game session not found" });
  }

  if (session.completed) {
    return res.status(400).json({ error: "Game already completed" });
  }

  const currentRound = gameData.rounds[session.currentRound];
  const isCorrect = answer.toLowerCase() === currentRound.answer.toLowerCase();
  let points = 0;
  let message = "";

  if (isCorrect) {
    // Calculate points based on attempts
    switch (session.attempts) {
      case 0: points = 3; break;
      case 1: points = 2; break;
      case 2: points = 1; break;
      default: points = 0;
    }

    session.score += points;
    session.attempts = 0;
    session.currentQuestion++;

    // Check if round is complete
    if (session.currentQuestion >= 3) {
      session.currentQuestion = 0;
      session.currentRound++;

      // Check if game is complete
      if (session.currentRound >= 5) {
        session.completed = true;
        return res.json({
          correct: true,
          points,
          totalScore: session.score,
          message: "Game completed!",
          gameOver: true
        });
      }
    }
  } else {
    session.attempts++;
    message = "Incorrect answer, try again";
  }

  res.json({
    correct: isCorrect,
    points,
    totalScore: session.score,
    nextQuestion: getQuestion(session),
    message
  });
});

// Helper function to get current question
function getQuestion(session) {
  if (session.completed) return null;

  const round = gameData.rounds[session.currentRound];
  return {
    category: round.category,
    question: round.questions[session.currentQuestion],
    roundNumber: session.currentRound + 1,
    questionNumber: session.currentQuestion + 1
  };
}

// Get game status
router.get('/game/:sessionId/status', (req, res) => {
  const session = gameSessions.get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: "Game session not found" });
  }

  res.json({
    currentRound: session.currentRound + 1,
    currentQuestion: session.currentQuestion + 1,
    score: session.score,
    completed: session.completed
  });
});

// Start the server
router.get('/game/questions', (req, res) => {
  res.json(gameData);
});

module.exports = router;
