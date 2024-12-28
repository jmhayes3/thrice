class TriviaGame {
  constructor() {
    this.gameSession = null;
    this.score = 0;
    this.currentQuestion = null;

    // DOM Elements
    this.startScreen = document.getElementById('intro');
    this.gameScreen = document.getElementById('content');
    this.gameOverScreen = document.getElementById('gameOver');
    this.messageElement = document.getElementById('message');
    this.scoreElement = document.getElementById('score');
    this.questionElement = document.getElementById('question');

    // Bind event handlers
    this.initializeEventListeners();

    // Start the game automatically
    this.startGame();
  }

  initializeEventListeners() {
    document.getElementById('answerForm').addEventListener('submit', (e) => this.handleAnswer(e));
  }

  async startGame() {
    try {
      const response = await fetch('http://localhost:3000/api/game/start', {
        method: 'POST',
      });
      const data = await response.json();

      this.gameSession = data.sessionId;
      this.score = 0;
      this.updateScore(0);
      this.showQuestion(data.firstQuestion);

      this.showScreen('game');
      this.showMessage('Game started! Good luck!');
    } catch (error) {
      this.showMessage('Error starting game. Please try again.');
    }
  }

  async handleAnswer(event) {
    event.preventDefault();
    const answerInput = document.getElementById('answerInput');
    const answer = answerInput.value.trim();

    if (!answer) {
      this.showMessage('Please enter an answer.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.gameSession,
          answer: answer,
        }),
      });
      const data = await response.json();

      if (data.correct) {
        this.score += 1;
        this.updateScore(this.score);
        this.showMessage('Correct! Next question...');
      } else {
        this.showMessage('Incorrect. Try again!');
      }

      if (data.nextQuestion) {
        this.showQuestion(data.nextQuestion);
      } else {
        this.endGame();
      }
    } catch (error) {
      this.showMessage('Error submitting answer. Please try again.');
    }
  }

  showQuestion(question) {
    this.currentQuestion = question;
    this.questionElement.textContent = question.text;
  }

  updateScore(score) {
    this.scoreElement.textContent = `Score: ${score}`;
  }

  showMessage(message) {
    this.messageElement.textContent = message;
  }

  showScreen(screen) {
    this.startScreen.style.display = screen === 'start' ? 'block' : 'none';
    this.gameScreen.style.display = screen === 'game' ? 'block' : 'none';
    this.gameOverScreen.style.display = screen === 'gameOver' ? 'block' : 'none';
  }

  endGame() {
    this.showMessage(`Game Over! Your final score is ${this.score}.`);
    this.showScreen('gameOver');
  }
}

// Instantiate the game
document.addEventListener('DOMContentLoaded', () => {
  new TriviaGame();
});

