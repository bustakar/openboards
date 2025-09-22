import { getEmailAdapter } from './email/email-provider';

const appName =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'OpenBoards';
const fromDisplay = process.env.EMAIL_FROM || `OpenBoards <noreply@${appName}>`;

export async function sendMagicLinkEmail(toEmail: string, url: string) {
  const subject = 'Sign in to OpenBoards';
  const text = `Sign in by clicking this link: ${url}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6">
      <h2>Sign in to OpenBoards</h2>
      <p>Click the button below to sign in. This link will expire shortly.</p>
      <p>
        <a href="${url}" style="background:#111827;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
          Sign in
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break:break-all"><a href="${url}">${url}</a></p>
    </div>
  `;
  await getEmailAdapter().send({
    to: toEmail,
    subject,
    text,
    html,
    from: fromDisplay,
  });
}

export async function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}) {
  const subject = 'Invitation to join OpenBoards';
  const text = `You are invited to join ${teamName} on OpenBoards. Click the link below to accept the invitation: ${inviteLink}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6">
      <h2>You are invited to join ${teamName} on OpenBoards by ${invitedByUsername} (${invitedByEmail})</h2>
      <p>Click the button below to accept the invitation:</p>
      <p>
        <a href="${inviteLink}" style="background:#111827;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">
          Accept Invitation
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break:break-all"><a href="${inviteLink}">${inviteLink}</a></p>
    </div>
  `;
  await getEmailAdapter().send({
    to: email,
    subject,
    text,
    html,
    from: fromDisplay,
  });
}
