// functions/api/[[route]].ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { userRoutes } from '../controllers/user.controller'
import { gameRoutes } from '../controllers/game.controller'

const app = new Hono()

app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      success: false,
      error: {
        message: err.message || 'Internal Server Error',
        stack: err.stack || null,
      },
    },
    500
  );
});

// Global middleware that applies to all routes
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors())

// Custom 404 handler for unmatched routes
app.notFound((c) => {
  return c.json({
    status: 404,
    message: 'Route not found',
    path: c.req.path
  }, 404)
})

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Mount route groups
// All user routes will be prefixed with /api/users
app.route('/users', userRoutes)

// All game routes will be prefixed with /api/game
app.route('/game', gameRoutes)

app.get('/questions/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `Getting question ${id}` })
})

app.post('/questions', async (c) => {
  const body = await c.req.json()
  return c.json({ message: 'Creating question', data: body }, 201)
})

app.put('/questions/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  return c.json({ message: `Updating question ${id}`, data: body })
})

app.delete('/questions/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `Deleting question ${id}` })
})

export default app
