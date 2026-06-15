import { useState } from 'react';
import './App.css';

const initialForm = { to: '', subject: '', message: '' };
const FROM_ADDRESS = 'support@discoverurcredit.online';

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.to.trim()) next.to = 'Enter a recipient email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.to)) next.to = 'Enter a valid email address.';
    if (!form.subject.trim()) next.subject = 'Enter a subject.';
    if (!form.message.trim()) next.message = 'Enter a message.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send the email.');
      }

      setStatus({ type: 'success', message: `Email sent to ${form.to}.` });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">D</div>
            <div>
              <div className="brand-name">Discover</div>
              <div className="brand-tag">Mail composer</div>
            </div>
          </div>
          <a className="header-link" href={`mailto:${FROM_ADDRESS}`}>
            {FROM_ADDRESS}
          </a>
        </div>
      </header>

      <main className="main">
        <section>
          <div className="intro-eyebrow">Compose</div>
          <h1 className="intro-title">Send an email from your support inbox.</h1>
          <p className="intro-text">
            Messages are sent from <strong>{FROM_ADDRESS}</strong> to whichever
            recipient you enter below. Replies will come back to that same
            inbox (forwarded to your Gmail via Cloudflare).
          </p>
          <ul className="intro-list">
            <li>
              <span className="dot">1</span>
              <div>
                From
                <span className="label">{FROM_ADDRESS} (your verified domain)</span>
              </div>
            </li>
            <li>
              <span className="dot">2</span>
              <div>
                To
                <span className="label">Any recipient you type into the form.</span>
              </div>
            </li>
            <li>
              <span className="dot">3</span>
              <div>
                Send
                <span className="label">Delivered instantly through Resend.</span>
              </div>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2 className="card-title">New message</h2>
          <p className="card-subtitle">Sending as {FROM_ADDRESS}</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="to">To</label>
              <input
                id="to"
                name="to"
                type="email"
                value={form.to}
                onChange={handleChange}
                placeholder="recipient@example.com"
                autoComplete="off"
              />
              {errors.to && <span className="field-error">{errors.to}</span>}
            </div>

            <div className="field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject line"
              />
              {errors.subject && <span className="field-error">{errors.subject}</span>}
            </div>

            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message..."
              />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>

            <button className="submit-btn" type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send email'}
            </button>

            {status.type && (
              <div className={`status-banner ${status.type}`}>
                {status.message}
              </div>
            )}
          </form>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>&copy; {new Date().getFullYear()} Discover. All rights reserved.</span>
          <span>discoverurcredit.online</span>
        </div>
      </footer>
    </div>
  );
}
