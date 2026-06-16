# Discover – Mail Composer

A single-codebase web app for **sending** email from
`support@discoverurcredit.online` to any recipient you type in
(To / Subject / Message). Works locally with one command, and deploys to
Netlify using a serverless function — no separate backend to manage.

## Receiving vs sending

- **Receiving** is handled by Cloudflare Email Routing (forwards
  support@discoverurcredit.online to your Gmail).
- **Sending** (this app) needs an outbound provider, because Cloudflare
  routing can't send. This uses **Resend** (free tier: 100/day). You must
  **verify discoverurcredit.online in Resend** once — add the SPF/DKIM DNS
  records it gives you, in Cloudflare. They sit next to your MX records, so
  receiving keeps working. Without verification, sends fail.

## Run locally

```bash
npm install
cp .env.example .env      # add your real Resend key
npm run dev
```

Open the URL Vite prints (default http://localhost:5173). In dev, the
send API runs inside the Vite server.

## Deploy to Netlify

Netlify only serves static files, so the send logic runs as a **Netlify
Function** (`netlify/functions/send-email.js`). The included
`netlify.toml` wires it up and rewrites `/api/send-email` to the function.

1. Push this whole project to a Git repo (GitHub/GitLab) and "Import" it
   in Netlify — OR run `netlify deploy --build` with the Netlify CLI.
   Do **not** drag-and-drop only the `dist` folder: that skips the
   function and you'll get the "string did not match the expected
   pattern" error again (the form would be POSTing to a page that returns
   HTML instead of JSON).
2. In Netlify: **Site settings -> Environment variables**, add:
   - `RESEND_API_KEY` = your Resend key
   - `EMAIL_FROM` = `Discover Support <support@discoverurcredit.online>`
3. Trigger a deploy. Netlify runs `npm run build`, publishes `dist`, and
   deploys the function automatically.

Netlify build settings (already in `netlify.toml`): build command
`npm run build`, publish dir `dist`, functions dir `netlify/functions`.

## Files

| File                            | Role                                                |
| ------------------------------- | --------------------------------------------------- |
| `src/`                          | React frontend (the compose form)                   |
| `api/sendEmail.js`              | Send logic + validation (single source of truth)    |
| `vite.config.js`                | Mounts the send API into the Vite dev server        |
| `netlify/functions/send-email.js` | Serverless backend for Netlify                    |
| `netlify.toml`                  | Netlify build + `/api/send-email` rewrite           |
| `server.js`                     | Optional self-hosted production server              |

All three entry points (dev middleware, Netlify function, server.js) call
the same `sendEmail()` in `api/sendEmail.js`, so behaviour is identical
everywhere.

## Scripts

| Command         | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | App + send API together (local development)   |
| `npm run build` | Build the frontend into `dist/`               |
| `npm start`     | Self-hosted production server (build first)   |
