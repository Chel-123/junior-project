import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ensureSeeded } from './src/db/prisma';
import apiRouter from './src/server/routes';

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount central API routes
app.use('/api', apiRouter);

// Initialize Vite server for asset handling and hot reload integration
async function startServer() {
  // Ensure database has seed data on startup
  await ensureSeeded();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`HMS Server successfully booted on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
