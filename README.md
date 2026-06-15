# Discover – Mail Composer

A single-codebase web app for **sending** email from
`support@discoverurcredit.online` to any recipient you type in. There is
**no separate backend** — the send API runs inside the dev server, so you
run one command.

You type **To / Subject / Message**, and the email goes out *from* your
support address.

## Receiving vs sending

- **Receiving** is already handled by Cloudflare Email Routing, which
  forwards `support@discoverurcredit.online` to your Gmail.
- **Sending** (this app) needs an outbound provider, because Cloudflare
  Email Routing can only forward incoming mail, not send. This app uses
  **Resend** for that.

This stays free: Resend's free tier is 100 emails/day. You just have to
**verify the domain in Resend** once (add the DNS records it shows you,
inside Cloudflare). Those records live alongside your existing MX
records, so receiving keeps working. Without verification, sends fail.

## Quick start

```bash
npm install
cp .env.example .env     # add your real Resend key
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Configure (.env)

```
RESEND_API_KEY=re_your_real_key
EMAIL_FROM=Discover Support <support@discoverurcredit.online>
```

- `RESEND_API_KEY` — from https://resend.com/api-keys
- `EMAIL_FROM` — must be on your verified Resend domain

The recipient is **not** in `.env` — you type it into the form each time.

## How it works

| File                | Role                                                       |
| ------------------- | ---------------------------------------------------------- |
| `src/`              | React frontend (the compose form)                          |
| `api/sendEmail.js`  | Send logic + validation (single source of truth)           |
| `vite.config.js`    | Mounts the send API into the Vite dev server               |
| `server.js`         | Optional production server (serves built app + the API)    |

## Scripts

| Command         | What it does                                          |
| --------------- | ----------------------------------------------------- |
| `npm run dev`   | Run the app + send API together (development)         |
| `npm run build` | Build the production frontend into `dist/`            |
| `npm start`     | Run the production server — build first               |
| `npm run serve` | `build` then `start` in one step                      |
