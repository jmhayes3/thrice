const express = require('express');
const cors = require('cors');

const router = express.Router();

// Middleware
router.use(express.json());
router.use(cors());

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

router.post('/game/answer', (req, res) => {
  const { sessionId, answer } = req.body;
  console.log(sessionId, answer);
  const session = gameSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Game session not found" });
  }

  if (session.completed) {
    return res.status(400).json({ error: "Game already completed" });
  }

  const currentRound = gameData.rounds[session.currentRound];
  const isCorrect = answer.toLowerCase() === currentRound.answer.toLowerCase();
  const maxPoints = 3;
  let message = "";

  if (isCorrect) {
    if (session.currentQuestion <= 3) {
      // Score can be inferred from the current question.
      session.score += (maxPoints - session.currentQuestion);
      // Reset question counter to 0 and continue to next round.
      session.currentQuestion = 0;
      session.currentRound++;
      message = "Correct!"
    }
  } else {
    session.attempts++;
    session.currentQuestion++;
    message = "Incorrect answer, try again";
  }

  // Check if game is complete
  if (session.currentRound >= 5) {
    session.completed = true;
    return res.json({
      correct: isCorrect,
      totalScore: session.score,
      nextQuestion: getQuestion(session),
      gameOver: true,
      message: "Game over!"
    })
  }

  res.json({
    correct: isCorrect,
    remaining: maxPoints - session.currentQuestion,
    totalScore: session.score,
    nextQuestion: getQuestion(session),
    message
  });
});

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

router.get('/questions', (req, res) => {
  res.json(gameData);
});

router.get('/stats', (req, res) => {
  const statsData = {};
  res.json(statsData);
});

module.exports = router;
