export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
};

export interface EmailAdapter {
  send(input: SendEmailInput): Promise<void>;
}
