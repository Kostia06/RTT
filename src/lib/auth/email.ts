import { sendEmail } from '@/lib/email/emailService';

export async function sendVerification(to: string, url: string) {
  await sendEmail({
    to,
    subject: 'Verify your email — Respect the Technique',
    html: `<p>Confirm your email to finish signing up.</p><p><a href="${url}">Verify email</a></p>`,
  });
}

export async function sendReset(to: string, url: string) {
  await sendEmail({
    to,
    subject: 'Reset your password — Respect the Technique',
    html: `<p>Reset your password.</p><p><a href="${url}">Set a new password</a></p>`,
  });
}
