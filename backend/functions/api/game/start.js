// api/game/start.js

const generateSessionId = () => {
  // Generate session IDs using a timestamp and random number for uniqueness
  return `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const gameState = {
  // Each key is a session identifier
  session1: {
    // Each round now contains an array of attempts
    round1: {
      attempts: [
        { answer: 'X', timestamp: 1704321600000 },  // Example of a first attempt where answer was 0
        { answer: 42, timestamp: 1704321660000 }    // Example of a second attempt
      ],
      currentAttempt: 1  // Tracks which attempt the player is currently on
    },
    round2: {
      attempts: [
        { answer: 15, timestamp: 1704321720000 }
      ],
      currentAttempt: 0
    }
  },
  session2: {
    round1: {
      attempts: [],      // No attempts made yet
      currentAttempt: 0
    }
  }
};

const updateGameState = (session, round, answer) => {
  if (!gameState[session]) {
    gameState[session] = {};
  }

  if (!gameState[session][round]) {
    gameState[session][round] = {
      attempts: [],
      currentAttempt: 0
    };
  }

  const newAttempt = {
    answer: answer === 0 ? 'X' : answer,
    timestamp: Date.now()
  };

  gameState[session][round].attempts.push(newAttempt);
  gameState[session][round].currentAttempt = gameState[session][round].attempts.length - 1;

  return gameState;
};

const getLatestAttempt = (session, round) => {
  const roundData = gameState[session][round];
  if (!roundData || roundData.attempts.length === 0) {
    return null;
  }
  return roundData.attempts[roundData.currentAttempt];
};

const getAllAttempts = (session, round) => {
  return gameState[session]?.[round]?.attempts || [];
};

const getAttemptCount = (session, round) => {
  return gameState[session]?.[round]?.attempts.length || 0;
};


export async function onRequestPost(context) {
  const requestBody = await context.request.json();
  console.log(requestBody);
  const responseData = { message: "Game started!", gameState: gameState };
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
