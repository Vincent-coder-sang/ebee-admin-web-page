// Importing required modules using ES6 const syntax
const bcryptjs = require("bcryptjs");
const CryptoJS = require("crypto-js");
const { Op } = require("sequelize");
const {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendWelcomeEmail,
} = require("../brevo/email.brevo");
const generateAuthToken = require("../utils/generateAuthToken");
const { Users } = require("../models");


// Signup function
const signup = async (req, res) => {
  try {
    let { email, name, password, phoneNumber } = req.body;

    email = email.toLowerCase();

    const errors = [];
    if (!email) errors.push("Please fill in email!");
    if (!name) errors.push("Please fill in name!");
    if (!phoneNumber) errors.push("Please fill in phone number!");
    if (!password) errors.push("Please fill in password!");

    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please use a valid email!" });
    }

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already registered" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    const user = await Users.create({
      email,
      name,
      phoneNumber,
      password: hashPassword,
      isApproved: false
    });

    // Send a verification email
    // await sendWelcomeEmail(email, name);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully.",
      data: { userId: user.id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in email and password!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please use a valid email!" });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User doesn't exist" });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Wrong username and password combination",
      });
    }

    const userToken = generateAuthToken(user);

    res.status(200).json({ message: "Login success", token: userToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No such user, please register first.",
        });
    }

    const resetToken = CryptoJS.lib.WordArray.random(20).toString(
      CryptoJS.enc.Hex
    );
    const resetTokenExpires = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    const resetLink = `https://ebee-admin-kjn8.onrender.com/auth/reset-password/${resetToken}`;

    sendPasswordResetEmail(email, user.name, resetLink);

    res
      .status(200)
      .json({ success: true, message: "Password reset code sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const changePassword = async (req, res) => {
  try {
    const token = req.params.token;
    const password = req.body.password;

    // Check if newPassword is provided
    if (!password || !token) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Reset token and new password are required.",
        });
    }

    const user = await Users.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Update password and clear reset token
    const hashedPassword = await bcryptjs.hash(password, 10);
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });

    await sendResetSuccessEmail(user.email, user.name);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  signup,
  forgotPassword,
  forgotPassword,
  changePassword,
};
