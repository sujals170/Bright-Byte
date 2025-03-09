const {transporter} = require('../config/emailConfig');
const {emailFormat} = require('./emailFormat');
const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html :emailFormat(text)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }

};

module.exports = { sendMail };