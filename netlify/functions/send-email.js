// Netlify serverless function. This is the "backend" when the app is
// hosted on Netlify (which only serves static files otherwise).
// It reuses the same sendEmail logic as local dev, so behaviour matches.
import { sendEmail } from '../../api/sendEmail.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed.' }),
    };
  }

  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body.' }),
    };
  }

  const result = await sendEmail(payload);
  return {
    statusCode: result.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.body),
  };
};
