import nodemailer from 'nodemailer';
import { EmailAdapter, SendEmailInput } from './email-adapter';

export class SmtpEmailAdapter implements EmailAdapter {
  private transporter;
  private from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USERNAME;
    const pass = process.env.SMTP_PASSWORD;

    if (!host) throw new Error('SMTP_HOST is required for SMTP adapter');

    this.from =
      process.env.EMAIL_FROM ||
      process.env.SMTP_FROM ||
      'OpenBoards <noreply@localhost>';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      to: input.to,
      from: input.from || this.from,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });
  }
}
