const nodemailer = require("nodemailer");

async function sendEmail(to, subject, message) {
  console.log("Preparing to send email to:", to);
  console.log("Using Gmail user:", process.env.GMAIL_USER);

  // Validate environment variables
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.error("Missing Gmail credentials in environment variables");
    return { error: true, message: "Server configuration error" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
    logger: true,
    debug: true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to,
    subject: subject,
    html: message,
  };

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log("Server is ready to take our messages");

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { status: true, message: "Email Sent", info: info.response };
  } catch (error) {
    console.error("Error sending email:", error);

    // More specific error handling
    let errorMessage = error.message;
    if (error.code === "ETIMEDOUT" || error.code === "ESOCKETTIMEDOUT") {
      errorMessage = "Connection timed out. Please try again later.";
    } else if (error.code === "EAUTH") {
      errorMessage =
        "Authentication failed. Please check your email credentials.";
    }

    return { error: true, message: errorMessage, details: error };
  }
}

module.exports = sendEmail;
