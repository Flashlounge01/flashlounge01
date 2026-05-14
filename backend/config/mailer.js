const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// sendMail({ from, to, subject, html }) — drop-in replacement for nodemailer
async function sendMail({ from, to, subject, html }) {
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
  }
  return data;
}

module.exports = { sendMail };
