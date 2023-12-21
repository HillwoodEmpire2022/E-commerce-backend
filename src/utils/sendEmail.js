import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // 1) Create a transporter. A service that sends an email
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
    from: "Hill Group <dav.j.iribagiza2@gmail.com>",
    to: options.to,
    subject: options.subject,
    html: `<p>${options.text} click on the link below to reset your password.</p> <a href="${options.url}">Reset Password</a>`,
  };
  // In sendEmail function
console.log("Sending email to:", options.to);


  // 3) Send email
  await transporter.sendMail(mailOptions);
};
