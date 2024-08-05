import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
import { activationEmailTemplate, forgotPasswordEmailTemplate } from '../validations/emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, url, firstName, kind) {
  const html =
    kind === 'account-activation'
      ? activationEmailTemplate(url, firstName)
      : kind === 'forgot-password'
      ? forgotPasswordEmailTemplate(url, firstName)
      : '';

  try {
    const data = await resend.emails.send({
      from: `Feli Express <${process.env.RESEND_NO_REPLY_EMIL}>`,
      // from: process.env.RESEND_NO_REPLY_EMIL,
      to: [to],
      subject,
      html,
    });

    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export default sendEmail;
