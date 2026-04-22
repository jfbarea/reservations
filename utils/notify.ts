import nodemailer from 'nodemailer';

export async function notify(to: string, subject: string, body: string) {
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn('[notify] GMAIL_USER o GMAIL_APP_PASSWORD no configurados, omitiendo notificación.');
    return;
  }
  if (!to) {
    console.warn('[notify] Sin email de destino, omitiendo notificación.');
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
  const recipients = [...new Set([to, GMAIL_USER])].filter(Boolean).join(', ');
  await transporter.sendMail({ from: GMAIL_USER, to: recipients, subject, text: body });
  console.log(`[notify] Email enviado a ${recipients}: "${subject}"`);
}
