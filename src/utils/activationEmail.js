import nodemailer from "nodemailer";

export const sendActivationEmail = async (options) => {
  // 1) Create a transporter. A service thatsend an email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: `Hill Group ${process.env.GMAIL_USER}`,
    to: options.to,
    subject: options.subject,
    html: `<p>${options.text} click on the link bellow to activate your account.</p> <a href="${options.url}">Activate account</a>`,
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};
