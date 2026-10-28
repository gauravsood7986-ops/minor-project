import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

const isEmailConfigured = Boolean(
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
);

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  console.log('[Mailer] SMTP configured successfully.');
} else {
  console.log('[Mailer] SMTP credentials not configured. Verification and reset emails will log delivery instructions.');
}

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!isEmailConfigured || !transporter) {
    console.warn(`[Mailer Notice] Email to ${to} not dispatched (SMTP not configured). Subject: ${subject}`);
    return {
      sent: false,
      reason: 'SMTP provider not configured in server environment.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mailer Error] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};
