import { Resend } from 'resend';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends an email FROM your support address TO a recipient the user types.
 * This is a "compose" flow (like webmail), not a contact form.
 *
 *   from    -> EMAIL_FROM (support@discoverurcredit.online) — fixed
 *   to      -> recipient entered in the form
 *   subject -> entered in the form
 *   message -> the body, entered in the form
 *
 * Returns a plain { status, body } object so it can be reused by both
 * the Vite dev middleware and the production Express server.
 *
 * The Resend client is created inside the function (not at module load)
 * so the API key is read from process.env *after* dotenv has populated it.
 */
export async function sendEmail(payload) {
  const { to, subject, message } = payload || {};

  if (!to || !subject || !message) {
    return { status: 400, body: { error: 'Recipient, subject and message are all required.' } };
  }
  if (!isEmail(to)) {
    return { status: 400, body: { error: 'Please enter a valid recipient email address.' } };
  }
  if (!process.env.RESEND_API_KEY) {
    return {
      status: 500,
      body: { error: 'Email service is not configured. Set RESEND_API_KEY in .env' },
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const EMAIL_FROM =
    process.env.EMAIL_FROM || 'Discover Support <support@discoverurcredit.online>';

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      // Plain-text body so it reads like a normal email, plus a simple
      // HTML version that preserves the line breaks the user typed.
      text: message,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; white-space: pre-wrap;">${escapeHtml(
        message
      )}</div>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return { status: 502, body: { error: error.message || 'Failed to send email.' } };
    }

    return { status: 200, body: { success: true, id: data?.id } };
  } catch (err) {
    console.error('Server error:', err);
    return { status: 500, body: { error: 'Something went wrong.' } };
  }
}

/** Reads and JSON-parses a Node request body (used by the dev middleware). */
export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Connect/Express-style middleware that wires the send API onto a server.
 * Shared by the Vite dev server and the production Express app so the
 * endpoint behaves identically in both.
 */
export function emailApiMiddleware() {
  return async function (req, res, next) {
    const url = req.url || '';

    if (url.startsWith('/api/health') && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (url.startsWith('/api/send-email') && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const result = await sendEmail(body);
        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.body));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message || 'Bad request.' }));
      }
      return;
    }

    if (typeof next === 'function') return next();
  };
}
