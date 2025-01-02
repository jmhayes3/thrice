class TriviaGameAPI {
  static async startGame() {
    const response = await fetch('http://localhost:3000/api/game/start', {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to start the game');
    return await response.json();
  }

  static async submitAnswer(sessionId, answer) {
    const response = await fetch('http://localhost:3000/api/game/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId, answer })
    });
    if (!response.ok) throw new Error('Failed to submit answer');
    return await response.json();
  }
}

class TriviaGame {
  constructor() {
    this.gameSession = null;
    this.score = 0;

    this.startScreen = document.getElementById('startScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.resultsScreen = document.getElementById('resultsScreen');
    this.messageElement = document.getElementById('message');

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById('startButton').addEventListener('click', () => this.startGame());
    document.getElementById('answerForm').addEventListener('submit', (e) => this.handleAnswer(e));
  }

  async startGame() {
    try {
      const data = await TriviaGameAPI.startGame();

      this.gameSession = data.sessionId;
      this.score = 0;
      this.updateScore(0);
      this.showQuestion(data.firstQuestion);

      this.showScreen('game');
      this.showMessage('Game started! Good luck!');
    } catch (error) {
      this.showMessage(error.message || 'Error starting game. Please try again.');
    }
  }

  async handleAnswer(e) {
    e.preventDefault();
    const answerInput = document.getElementById('answerInput');
    const answer = answerInput.value.trim();

    if (!answer) return;

    try {
      const data = await TriviaGameAPI.submitAnswer(this.gameSession, answer);

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
      this.showMessage(error.message || 'Error submitting answer. Please try again.');
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
    this.showScreen('results');
    this.showMessage(`Final Score: ${finalScore}`);
  }

  showScreen(screenType) {
    this.startScreen.classList.add('hidden');
    this.gameScreen.classList.add('hidden');
    this.resultsScreen.classList.add('hidden');

    switch (screenType) {
      case 'start':
        this.startScreen.classList.remove('hidden');
        break;
      case 'game':
        this.gameScreen.classList.remove('hidden');
        break;
      case 'results':
        this.resultsScreen.classList.remove('hidden');
        break;
    }
  }

  showMessage(text) {
    this.messageElement.textContent = text;
    this.messageElement.classList.remove('hidden');

    setTimeout(() => {
      this.messageElement.classList.add('hidden');
    }, 60000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TriviaGame();
});
