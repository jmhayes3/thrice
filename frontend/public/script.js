// script.js
class TriviaGame {
  constructor() {
    this.gameSession = null;
    this.score = 0;
    this.currentQuestion = null;

    // DOM Elements
    this.startScreen = document.getElementById('startScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.messageElement = document.getElementById('message');

    // Bind event handlers
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById('startButton').addEventListener('click', () => this.startGame());
    document.getElementById('playAgainButton').addEventListener('click', () => this.startGame());
    document.getElementById('answerForm').addEventListener('submit', (e) => this.handleAnswer(e));
  }

  async startGame() {
    try {
      const response = await fetch('http://localhost:3000/api/game/start', {
        method: 'POST'
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

  async handleAnswer(e) {
    e.preventDefault();
    const answerInput = document.getElementById('answerInput');
    const answer = answerInput.value.trim();

    if (!answer) return;

    try {
      const response = await fetch('http://localhost:3000/api/game/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.gameSession,
          answer: answer
        })
      });

      const data = await response.json();

      if (data.gameOver) {
        this.endGame(data.totalScore);
      } else {
        this.updateScore(data.totalScore);
        this.showQuestion(data.nextQuestion);
        this.showMessage(data.correct ?
          `Correct! You earned ${data.points} points!` :
          'Incorrect answer, try again!'
        );
      }

      answerInput.value = '';
    } catch (error) {
      this.showMessage('Error submitting answer. Please try again.');
    }
  }

  showQuestion(question) {
    document.getElementById('roundNumber').textContent = question.roundNumber;
    document.getElementById('category').textContent = question.category;
    document.getElementById('questionNumber').textContent = question.questionNumber;
    document.getElementById('questionText').textContent = question.question;
  }

  updateScore(newScore) {
    this.score = newScore;
    document.getElementById('score').textContent = this.score;
  }

  endGame(finalScore) {
    document.getElementById('finalScore').textContent = finalScore;
    this.showScreen('gameOver');
    this.showMessage(`Game Over! Final Score: ${finalScore}`);
  }

  showScreen(screenType) {
    this.startScreen.classList.add('hidden');
    this.gameScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');

    switch (screenType) {
      case 'start':
        this.startScreen.classList.remove('hidden');
        break;
      case 'game':
        this.gameScreen.classList.remove('hidden');
        break;
      case 'gameOver':
        this.gameOverScreen.classList.remove('hidden');
        break;
    }
  }

  showMessage(text) {
    this.messageElement.textContent = text;
    this.messageElement.classList.remove('hidden');
    setTimeout(() => {
      this.messageElement.classList.add('hidden');
    }, 3000);
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TriviaGame();
});
