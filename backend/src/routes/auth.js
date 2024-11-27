const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { mailSender, generateOtp } = require("../utils/otpSender");
const Otp = require("../models/otp");
const User = require("../models/users");

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  //generates otp
  const otp = generateOtp();

  //fixes expiration time
  const expiration = new Date(Date.now() + 5 * 60 * 1000);

  try {
    //checks whether user already exist or not
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ message: "User already exist" });
    }

    //loads credentials to send verification mail
    const credentials = {
      from: process.env.EMAIL,
      to: email,
      subject: process.env.SUBJECT,
      text: `${process.env.TEXT} ${otp}`,
    };

    //sends email for verification
    await mailSender(credentials);

    //saves the sent otp along with email
    /*
      let saveOtp = new Otp({
      email,
      otp,
      expiresAt: expiration,
    });
    */

    //the above has problem in duplication of email, i mean sending second otp
    //updated one
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt: expiration },
      { upsert: true, new: true }
    );

    return res.json({ message: "Otp sent successfully" });
  } catch (err) {
    console.log("error: ", err);
    return res.json({ message: "failed to signup" });
  }
});

//route to verify otp
router.post("/verify-otp", async (req, res) => {
  const { username, email, password, otp } = req.body;

  //checking otp matching
  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord) {
    return res.json({ message: "Otp is not valid" });
  }

  //checking otp expire time
  if (new Date() > otpRecord.expiresAt) {
    return res.json({ message: "otp has expired" });
  }

  //checking second time if user exist or not
  let user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "user already exists" });
  }

  //hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //saving new user data after verification
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    isVerified: true,
  });

  await newUser.save();

  //deleting email after verification
  await Otp.deleteOne({ email });

  return res.json({ message: "Registration completed successfully" });
});

module.exports = router;
