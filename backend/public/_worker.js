// // _worker.js
//
// const generateSessionId = () => {
//   // Generate session IDs using a timestamp and random number for uniqueness
//   return `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
// };
//
// const gameState = {
//   // Each key is a session identifier
//   session1: {
//     // Each round now contains an array of attempts
//     round1: {
//       attempts: [
//         { answer: 'X', timestamp: 1704321600000 },  // Example of a first attempt where answer was 0
//         { answer: 42, timestamp: 1704321660000 }    // Example of a second attempt
//       ],
//       currentAttempt: 1  // Tracks which attempt the player is currently on
//     },
//     round2: {
//       attempts: [
//         { answer: 15, timestamp: 1704321720000 }
//       ],
//       currentAttempt: 0
//     }
//   },
//   session2: {
//     round1: {
//       attempts: [],      // No attempts made yet
//       currentAttempt: 0
//     }
//   }
// };
//
// const updateGameState = (session, round, answer) => {
//   if (!gameState[session]) {
//     gameState[session] = {};
//   }
//
//   if (!gameState[session][round]) {
//     gameState[session][round] = {
//       attempts: [],
//       currentAttempt: 0
//     };
//   }
//
//   const newAttempt = {
//     answer: answer === 0 ? 'X' : answer,
//     timestamp: Date.now()
//   };
//
//   gameState[session][round].attempts.push(newAttempt);
//   gameState[session][round].currentAttempt = gameState[session][round].attempts.length - 1;
//
//   return gameState;
// };
//
// // Get the latest attempt for a specific round
// const getLatestAttempt = (session, round) => {
//   const roundData = gameState[session][round];
//   if (!roundData || roundData.attempts.length === 0) {
//     return null;
//   }
//   return roundData.attempts[roundData.currentAttempt];
// };
//
// // Get all attempts for a round
// const getAllAttempts = (session, round) => {
//   return gameState[session]?.[round]?.attempts || [];
// };
//
// // Get number of attempts made in a round
// const getAttemptCount = (session, round) => {
//   return gameState[session]?.[round]?.attempts.length || 0;
// };

// Note on using Cloudflare Pages in advanced mode:
// In advanced mode, your Function will assume full control of all incoming HTTP requests to your domain.
// Your Function is required to make or forward requests to your project's static assets.
// Failure to do so will result in broken or unwanted behavior. Your Function must be written in Module syntax.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return env.ASSETS.fetch(request);
    } else if (url.pathname === '/api/game/start') {
      return new Response(
        JSON.stringify({
          gameState: gameState,
          message: 'Game started. Good luck!',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else if (url.pathname === '/api/game/answer' && request.method === 'POST') {
      const { session, round, answer } = await request.json();
      const updatedGameState = updateGameState(session, round, answer);
      return new Response(
        JSON.stringify({
          gameState: updatedGameState,
          message: 'Your answer was correct.',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    return env.ASSETS.fetch(request);
  }
}
