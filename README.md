# thrice

## Getting Started

Initialize a new Node.js project:
npm init -y
Install required dependencies:
npm install express body-parser cors
Add your questions data to the gameData object. Each round should have:
A unique category
Three questions
One answer that applies to all three questions
The backend provides the following API endpoints:

POST /api/game/start

Starts a new game session
Returns a session ID and the first question
POST /api/game/answer

Submit an answer for the current question
Requires sessionId and answer in the request body
Returns result, points earned, and next question
GET /api/game/:sessionId/status

Get current game status
Returns current round, question, score, and completion status
The scoring system is implemented as specified:

First try: 3 points
Second try: 2 points
Third try: 1 point
After that: 0 points
To enhance this further, you might want to:

## TODO

Add a database to store questions and game sessions persistently
Implement user authentication
Add input validation
Create an admin interface to manage questions
Add error handling middleware
Implement rate limiting
