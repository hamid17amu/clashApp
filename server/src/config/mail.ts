import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (to, subject, html) => {
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
      });
}