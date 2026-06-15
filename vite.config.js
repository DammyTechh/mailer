import 'dotenv/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { emailApiMiddleware } from './api/sendEmail.js';

// Vite plugin that runs the email API in the same process as the dev
// server. This is what lets `npm run dev` serve the React frontend AND
// the /api/send-email endpoint together — no separate backend to start.
function emailApi() {
  const middleware = emailApiMiddleware();
  return {
    name: 'discover-email-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    // Also makes the API work under `vite preview` (after a build).
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), emailApi()],
});
