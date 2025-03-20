// For Hono documentation refer to https://hono.dev/docs/
import { Hono } from 'hono';
import type { Context, Next } from 'hono'
import { logger } from 'hono/logger';

let app = new Hono();

// Logging to stdout via built-in middleware
app.use(logger())

// Example of a custom middleware to set HTTP response header 
app.use(async (c: Context, next: Next) => {
    c.header('server', 'Spin CLI')
    await next();
})

app.get('/', (c: Context) => c.text('Hello, Spin!'));
app.get('/:name', (c: Context) => {
    return c.json({ message: `Hello, ${c.req.param('name')}` })
});

app.fire();