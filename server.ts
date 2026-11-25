import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createApp } from './server/createApp.js';

dotenv.config();
if (typeof __dirname !== 'undefined') {
  const rootEnvPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  }
}

async function startServer() {
  const app = createApp();
  const rawPort = process.env.PORT;
  const parsedPort = rawPort !== undefined && rawPort !== '' ? Number(rawPort) : NaN;
  const PORT: number | string = !Number.isNaN(parsedPort) && parsedPort > 0 ? parsedPort : rawPort || 3000;

  const cwdDistPath = path.join(process.cwd(), 'dist');
  const fallbackDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  const distPath = fs.existsSync(path.join(cwdDistPath, 'index.html'))
    ? cwdDistPath
    : fallbackDir;
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const runningBuiltServer =
    typeof __filename !== 'undefined' && __filename.endsWith('.cjs');
  const isProduction =
    process.env.NODE_ENV === 'production' || runningBuiltServer;

  // ==========================================
  // VITE & STATIC MIDDLEWARE SETUP
  // ==========================================
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      if (!hasBuiltDist) {
        return res
          .status(503)
          .send('Application build not found (dist/index.html missing). Run "npm run build".');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const onListen = () => {
    console.log(
      `Watch Video Dream in Hand MLM ERP running in ${isProduction ? 'production' : 'development'} mode on ${typeof PORT === 'number' ? `http://0.0.0.0:${PORT}` : PORT}`
    );
  };

  if (typeof PORT === 'number') {
    app.listen(PORT, '0.0.0.0', onListen);
  } else {
    app.listen(PORT, onListen);
  }
}

startServer();
