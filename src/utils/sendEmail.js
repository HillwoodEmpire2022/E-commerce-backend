import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // 1) Create a transporter. A service thatsend an email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  // 2) Define email options
  const mailOptions = {
    from: 'Hill Gropu <j.iribagiza2@gmail.com>',
    to: options.to,
    subject: options.subject,
    html: `<p>${options.text} click on the link bellow to reset your password.</p> <a href="${options.url}">Reset-password</a>`,
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};
