// controllers/game.controller.ts
import { Hono } from 'hono';
const gameRoutes = new Hono();
// Get all games with filters
gameRoutes.get('/', async (c) => {
    const status = c.req.query('status');
    const playerId = c.req.query('playerId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    // Mock games data
    const games = [
        {
            id: '1',
            playerOneId: '1',
            playerTwoId: '2',
            status: 'completed',
            winner: '1',
            score: {
                playerOne: 10,
                playerTwo: 8
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    let filteredGames = games;
    if (status) {
        filteredGames = filteredGames.filter(game => game.status === status);
    }
    if (playerId) {
        filteredGames = filteredGames.filter(game => game.playerOneId === playerId || game.playerTwoId === playerId);
    }
    return c.json({
        games: filteredGames,
        page,
        limit,
        total: filteredGames.length
    });
});
// Get game by ID
gameRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');
    // Mock game fetch
    const game = {
        id,
        playerOneId: '1',
        playerTwoId: '2',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    if (!game) {
        return c.json({ message: 'Game not found' }, 404);
    }
    return c.json(game);
});
// Create new game
gameRoutes.post('/', auth, async (c) => {
    const body = await c.req.json();
    if (!body.playerOneId || !body.playerTwoId) {
        return c.json({ message: 'Both players are required' }, 400);
    }
    // Mock game creation
    const newGame = {
        id: Math.random().toString(36).substr(2, 9),
        playerOneId: body.playerOneId,
        playerTwoId: body.playerTwoId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    return c.json(newGame, 201);
});
// Update game status and score
gameRoutes.put('/:id', auth, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    if (!body.status || !['pending', 'active', 'completed'].includes(body.status)) {
        return c.json({ message: 'Invalid game status' }, 400);
    }
    // Mock game update
    const updatedGame = {
        id,
        playerOneId: '1',
        playerTwoId: '2',
        status: body.status,
        winner: body.winner,
        score: body.score,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    return c.json(updatedGame);
});
// Delete game
gameRoutes.delete('/:id', auth, async (c) => {
    const id = c.req.param('id');
    // Mock game deletion
    return c.json({ message: `Game ${id} deleted successfully` });
});
// Start game
gameRoutes.post('/:id/start', auth, async (c) => {
    const id = c.req.param('id');
    // Mock game start
    const game = {
        id,
        playerOneId: '1',
        playerTwoId: '2',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    return c.json(game);
});
// End game
gameRoutes.post('/:id/end', auth, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    if (!body.winner || !body.score) {
        return c.json({ message: 'Winner and score are required' }, 400);
    }
    // Mock game end
    const game = {
        id,
        playerOneId: '1',
        playerTwoId: '2',
        status: 'completed',
        winner: body.winner,
        score: body.score,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    return c.json(game);
});
export { gameRoutes };
//# sourceMappingURL=game.controller.js.map