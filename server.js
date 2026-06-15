import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { emailApiMiddleware } from './api/sendEmail.js';

// Production-only server. In development you don't need this at all —
// `npm run dev` runs everything. This is used after `npm run build`
// to serve the compiled app + the API from one process: `npm start`.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// The same API used by the dev server, so behaviour is identical.
app.use(emailApiMiddleware());

// Serve the compiled React app from /dist.
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback — anything that isn't /api goes to index.html.
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Discover app running at http://localhost:${PORT}`);
});
