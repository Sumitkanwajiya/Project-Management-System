import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials are not defined in environment variables");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_PORT == 465 || process.env.SMTP_PORT == undefined, // default to true for 465
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    },
    // Force Node.js to use IPv4 - this fixes Render routing to Google's IPv6 SMTP which times out
    family: 4,
    logger: true,
    debug: true,
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"FYP Management System" <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

export default sendEmail;


