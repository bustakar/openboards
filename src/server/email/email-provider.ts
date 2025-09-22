import { EmailAdapter } from './email-adapter';
import { SmtpEmailAdapter } from './email-smtp-adapter';

let cached: EmailAdapter | null = null;

export function getEmailAdapter(): EmailAdapter {
  if (cached) return cached;

  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  if (provider === 'smtp') {
    cached = new SmtpEmailAdapter();
  } else {
    throw new Error('Invalid email provider');
  }
  return cached;
}
