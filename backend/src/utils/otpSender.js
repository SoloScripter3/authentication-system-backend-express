const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const mailSender = async (mailCredentials) => {
  try {
    const mailStatus = await transporter.sendMail(mailCredentials);
    console.log("Email sent", mailStatus.response);
  } catch (err) {
    console.log("error : ", err);
  }
};

module.exports = { mailSender, generateOtp };
