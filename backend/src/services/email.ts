import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@smartreunion.local';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!SMTP_HOST) {
    console.warn('[Email] SMTP_HOST non configuré — les emails seront uniquement loggés.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendWelcomeEmail(
  toEmail: string,
  userName?: string
): Promise<void> {
  const displayName = userName || toEmail;
  const subject = 'Bienvenue sur SmartReunion !';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <h1 style="color:#0ea5e9;font-size:22px;margin:0 0 12px;">Bienvenue sur SmartReunion</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;">
        Bonjour <strong>${displayName}</strong>,
      </p>
      <p style="color:#334155;font-size:14px;line-height:1.6;">
        Votre compte a été créé avec succès. Vous pouvez maintenant :
      </p>
      <ul style="color:#334155;font-size:14px;line-height:1.8;">
        <li>Participer aux réunions via le QR code</li>
        <li>Consulter les comptes-rendus et rapports</li>
        <li>Marquer votre présence en ligne</li>
      </ul>
      <p style="color:#64748b;font-size:12px;margin-top:20px;">
        — L'équipe SmartReunion
      </p>
    </div>
  `;

  const t = getTransporter();
  if (!t) {
    console.log(`[Email] Bienvenue → ${toEmail} (${displayName}) [SMTP non configuré, log uniquement]`);
    return;
  }

  try {
    await t.sendMail({ from: SMTP_FROM, to: toEmail, subject, html });
    console.log(`[Email] Bienvenue envoyé → ${toEmail}`);
  } catch (err) {
    console.error(`[Email] Erreur envoi bienvenue → ${toEmail}:`, err);
  }
}

export async function sendReportToParticipants(
  meetingId: string,
  meetingTitle: string,
  emails: string[],
  pdfBuffer?: Buffer
): Promise<void> {
  if (emails.length === 0) return;

  const subject = `Rapport de réunion : ${meetingTitle}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <h1 style="color:#0ea5e9;font-size:22px;margin:0 0 12px;">Rapport de réunion</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;">
        Bonjour,
      </p>
      <p style="color:#334155;font-size:14px;line-height:1.6;">
        Le rapport de la réunion <strong>« ${meetingTitle} »</strong> est disponible.
      </p>
      ${pdfBuffer ? '<p style="color:#334155;font-size:14px;">Vous trouverez le rapport PDF en pièce jointe.</p>' : '<p style="color:#334155;font-size:14px;">Connectez-vous à SmartReunion pour consulter le rapport complet.</p>'}
      <p style="color:#64748b;font-size:12px;margin-top:20px;">
        — L'équipe SmartReunion
      </p>
    </div>
  `;

  const t = getTransporter();
  if (!t) {
    console.log(`[Email] Rapport "${meetingTitle}" (${meetingId}) → ${emails.join(', ')} [SMTP non configuré, log uniquement]`);
    return;
  }

  const attachments = pdfBuffer
    ? [{ filename: `rapport-${meetingTitle.replace(/[^a-z0-9]/gi, '-')}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    : [];

  for (const to of emails) {
    try {
      await t.sendMail({ from: SMTP_FROM, to, subject, html, attachments });
      console.log(`[Email] Rapport envoyé → ${to}`);
    } catch (err) {
      console.error(`[Email] Erreur envoi rapport → ${to}:`, err);
    }
  }
}
