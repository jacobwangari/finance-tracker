const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for port 465, false for 587/others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const brandFooter = `
  <p style="color:#9096a8;font-size:12px;margin-top:24px;">
    Finance Tracker — if you didn't request this, you can safely ignore this email.
  </p>
`;

async function sendVerificationEmail(user, rawToken) {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Confirm your Finance Tracker account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Welcome, ${user.name} 👋</h2>
        <p>Please confirm your email address to activate your Finance Tracker account.</p>
        <p style="margin:24px 0;">
          <a href="${url}" style="background:#7c5cff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Confirm My Email
          </a>
        </p>
        <p>Or paste this link into your browser:</p>
        <p style="word-break:break-all;color:#7c5cff;">${url}</p>
        <p>This link expires in 24 hours.</p>
        ${brandFooter}
      </div>
    `
  });
}

async function sendPasswordResetEmail(user, rawToken) {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Reset your Finance Tracker password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Password reset requested</h2>
        <p>Hi ${user.name}, click below to set a new password.</p>
        <p style="margin:24px 0;">
          <a href="${url}" style="background:#7c5cff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p>Or paste this link into your browser:</p>
        <p style="word-break:break-all;color:#7c5cff;">${url}</p>
        <p>This link expires in 1 hour. If you didn't request this, your password is still safe — just ignore this email.</p>
        ${brandFooter}
      </div>
    `
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };