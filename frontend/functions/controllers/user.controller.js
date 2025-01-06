// controllers/user.controller.ts
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
const userRoutes = new Hono();
// Validation schemas
const createUserSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6)
});
const updateUserSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional()
});
// Auth middleware
const auth = jwt({
    secret: 'your-jwt-secret'
});
// Get all users with pagination
userRoutes.get('/', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const skip = (page - 1) * limit;
    // In a real app, fetch from database with pagination
    const mockUsers = [
        {
            id: '1',
            username: 'player1',
            email: 'player1@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            gameStats: {
                gamesPlayed: 10,
                wins: 7,
                losses: 3
            }
        }
    ];
    return c.json({
        users: mockUsers,
        page,
        limit,
        total: mockUsers.length
    });
});
// Get user by ID
userRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');
    // Mock user fetch
    const user = {
        id,
        username: 'player1',
        email: 'player1@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    if (!user) {
        return c.json({ message: 'User not found' }, 404);
    }
    return c.json(user);
});
// Create new user
userRoutes.post('/', async (c) => {
    const body = await c.req.json();
    try {
        const validatedData = createUserSchema.parse(body);
        // Mock user creation
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            username: validatedData.username,
            email: validatedData.email,
            createdAt: new Date(),
            updatedAt: new Date(),
            gameStats: {
                gamesPlayed: 0,
                wins: 0,
                losses: 0
            }
        };
        return c.json(newUser, 201);
    }
    catch (error) {
        return c.json({ message: 'Invalid user data', error }, 400);
    }
});
// Update user
userRoutes.put('/:id', auth, async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    try {
        const validatedData = updateUserSchema.parse(body);
        // Mock user update
        const updatedUser = {
            id,
            username: validatedData.username || 'player1',
            email: validatedData.email || 'player1@example.com',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return c.json(updatedUser);
    }
    catch (error) {
        return c.json({ message: 'Invalid user data', error }, 400);
    }
});
// Delete user
userRoutes.delete('/:id', auth, async (c) => {
    const id = c.req.param('id');
    // Mock user deletion
    return c.json({ message: `User ${id} deleted successfully` });
});
// Get user's game history
userRoutes.get('/:id/games', async (c) => {
    const id = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    // Mock game history
    const games = [
        {
            id: '1',
            playerOneId: id,
            playerTwoId: '2',
            status: 'completed',
            winner: id,
            score: {
                playerOne: 10,
                playerTwo: 8
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    return c.json({
        games,
        page,
        limit,
        total: games.length
    });
});
export { userRoutes };
//# sourceMappingURL=user.controller.js.map
