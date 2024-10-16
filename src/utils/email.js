import { Resend } from 'resend';
import dotenv from 'dotenv';
import {
  activationEmailTemplate,
  adminOrderNotificationEmailTemplate,
  forgotPasswordEmailTemplate,
  orderNotificationEmailTemplate,
  securityActivityEmailTemplate,
  signInOtpEmailTemplate,
} from './emailTemplates.js';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(options, kind) {
  const html =
    kind === 'account-activation'
      ? activationEmailTemplate(options.url, options.firstName, options.verificationCode)
      : kind === 'forgot-password'
      ? forgotPasswordEmailTemplate(options.url, options.firstName, options.otp)
      : kind === 'security-activity'
      ? securityActivityEmailTemplate(options)
      : kind === 'sign-in-otp'
      ? signInOtpEmailTemplate(options.otp)
      : kind === 'admin-order-notification'
      ? adminOrderNotificationEmailTemplate(options)
      : '';

  try {
    const data = await resend.emails.send({
      from: `Feli Express <${process.env.RESEND_NO_REPLY_EMIL}>`,
      // from: process.env.RESEND_NO_REPLY_EMIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html,
    });

    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Sends an order notification email.
 * @param {Object} options - The email options.
 * @param {Object} orderDetails - The details of the order.order.
 * @returns {Promise<Object>} - A promise that resolves to the email data.
 * @throws {Error} - If there is an error sending the email.
 */
export const send_order_notification_email = async (options, orderDetails) => {
  // order { id, products: [name, quantity, price, thumbnail ], amount, payment_method, status, created_at }
  const html = orderNotificationEmailTemplate(
    options.firstName,
    orderDetails.id,
    orderDetails.createdAt,
    options.order_url,
    orderDetails.items,
    orderDetails.amount
  );

  try {
    const data = await resend.emails.send({
      from: `Feli Express <${process.env.RESEND_NO_REPLY_EMIL}>`,
      to: [options.to],
      subject: options.subject,
      html,
    });

    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default sendEmail;
