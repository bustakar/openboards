import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || 'OpenBoards <noreply@localhost>';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

// In development, verify the SMTP connection once (best-effort)
if (process.env.NODE_ENV !== 'production') {
  transporter.verify().catch(() => {});
}

export async function sendMagicLinkEmail(toEmail: string, url: string) {
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

  await transporter.sendMail({
    to: toEmail,
    from: smtpFrom,
    subject: 'Sign in to OpenBoards',
    text,
    html,
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

  await transporter.sendMail({
    to: email,
    from: smtpFrom,
    subject: 'Invitation to join OpenBoards',
    text,
    html,
  });
}
