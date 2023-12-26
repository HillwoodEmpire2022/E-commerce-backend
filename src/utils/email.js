import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // 1) Create a transporter. A service thatsend an email
  const transporter = nodemailer.createTransport({
    host: process.env.DEV_HOST,
    port: process.env.DEV_PORT,
    auth: {
      user: process.env.DEV_USER,
      pass: process.env.DEV_PASS,
    },
  });
  // 2) Define email options
  const mailOptions = {
    from: "Hill Gropu <dav.ndungutse@gmail.com>",
    to: options.to,
    subject: options.subject,
    html: `<p>${options.text} click on the link bellow to activate your account.</p> <a href="${options.url}">Activate account</a>`,
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};
