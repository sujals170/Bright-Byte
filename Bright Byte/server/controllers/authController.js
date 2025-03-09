const bcrypt = require("bcrypt");
const UserVerification = require("../models/UserVerification");
const Student = require("../models/Student");
const Instructor = require("../models/Instructor");
const {generateOTP} = require("../utils/generate");
const {sendMail}  = require("../utils/email");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { username, email, firstName, lastName, password, dob, userType } =
    req.body;

  try {
    const emailLower = email.toLowerCase();
    const existingVerification = await UserVerification.findOne({
      email: emailLower,
    });
    const existingStudent = await Student.findOne({ email: emailLower });
    const existingInstructor = await Instructor.findOne({ email: emailLower });
    const usernameInStudent = await Student.findOne({ username });
    const usernameInInstructor = await Instructor.findOne({ username });

    if (existingVerification || existingStudent || existingInstructor) {
      return res
        .status(400)
        .json({ status: false, message: "Email already registered" });
    }
    if (usernameInStudent || usernameInInstructor) {
      return res.status(400).json({ status: false, message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();

    const userVerification = new UserVerification({
      username,
      email: emailLower,
      firstName,
      lastName,
      password: hashedPassword,
      dob,
      userType,
      otp,
      otpAttempts : 1,
    });
    await userVerification.save();

    await sendMail(emailLower,"Your OTP for Registration",otp);

    res.json({
      status: true,
      message: "Registration successful! Check your email for OTP.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const emailLower = email.toLowerCase();
    const userVerification = await UserVerification.findOne({
      email: emailLower,
    });
    if (!userVerification) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    if (userVerification.otp !== otp) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    const {
      username,
      email: userEmail,
      firstName,
      lastName,
      password,
      dob,
      userType,
    } = userVerification;

    if (userType === "student") {
      const student = new Student({
        username,
        email: userEmail,
        firstName,
        lastName,
        password,
        dob,
      });
      await student.save();
    } else if (userType === "instructor") {
      const instructor = new Instructor({
        username,
        email: userEmail,
        firstName,
        lastName,
        password,
        dob,
      });
      await instructor.save();
    }

    await UserVerification.deleteOne({ email: emailLower });
    res.json({ status: true, message: "OTP verified successfully!" });

    const token = jwt.sign(
      { id: user._id, 
        userType,
        isBlocked: user.isBlocked,
        username: `${student.username}`, 
       },
      process.env.JWT_SECRET,
      { expiresIn: '4d' }
    );
    res.cookie('token', token);
    res.json({ status: true, message: 'Register successful', userType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const emailLower = email.toLowerCase();
    const userVerification = await UserVerification.findOne({
      email: emailLower,
    });
    if (!userVerification) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    // Check OTP attempts
    if (userVerification.otpAttempts >= 3) {
      return res.status(429).json({ status: false, message: "OTP request limit exceeded" });
    }
    const otp = generateOTP();
    userVerification.otp = otp;
    userVerification.otpAttempts += 1;
    
    await userVerification.save();

    await sendMail(emailLower,"Your New OTP for Registration",otp);

    res.json({ status: true, message: "OTP resent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailLower = email.toLowerCase();
    if (emailLower === "admin@example.com" && password === "admin123") {
      const token = jwt.sign(
        { id: "admin", userType: "admin", email: emailLower }, // Use a static ID or generate one
        process.env.JWT_SECRET,
        { expiresIn: "4d" }
      );
      res.cookie("token", token);
      return res.json({ status: true, message: "Login successful", userType: "admin" });
    }
    
    // Check if user exists in either Student or Instructor collection
    let user = await Student.findOne({ email: emailLower });
    let userType = 'student';
    if (!user) {
      user = await Instructor.findOne({ email: emailLower });
      userType = 'instructor';
    }
    if (!user) {
      return res.status(400).json({ status: false, message: 'something went wrong' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ status: false, message: "Your account is blocked. Contact support." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, 
        userType,
        isBlocked: user.isBlocked,
        username: user.username, // Unique username
        fullName: `${user.firstName} ${user.lastName}`, // Full name
       },
      process.env.JWT_SECRET,
      { expiresIn: '4d' }
    );
    res.cookie('token', token);
    res.json({ status: true, message: 'Login successful', userType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  res.json({ status: true, message: 'Logout successful' });
};

const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Student.findById(userId).select('email username');
    if (!user) {
      return res.status(404).json({ status: false, message: 'Student not found' });
    }
    res.json({
      status: true,
      message: 'Welcome to student dashboard',
      user: {
        id: req.user.id,
        userType: req.user.userType,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
try {
  const emailLower = email.toLowerCase();
  let user = await Student.findOne({ email: emailLower });
  let userType = 'student';
  if (!user) {
    user = await Instructor.findOne({ email: emailLower });
    userType = 'instructor';
  }
  if (!user) {
    return res.status(404).json({ status: false, message: 'Email not found' });
  }

  let userVerification = await UserVerification.findOne({ email: emailLower });
  if (userVerification && userVerification.otpAttempts >= 2) {
    return res.status(429).json({ status: false, message: 'OTP request limit exceeded' });
  }

  await UserVerification.deleteOne({ email: emailLower });

  

  const otp = generateOTP();

  userVerification = new UserVerification({
    username: user.username, 
    email: emailLower,
    firstName: user.firstName,
    lastName: user.lastName, 
    password: user.password, 
    dob: user.dob,
    userType,
    otp,
    otpAttempts: 1,
  });
  await userVerification.save();

  await sendMail(emailLower,'Your OTP for Password Reset');

  res.json({ status: true, message: 'OTP sent to your email' });
} catch (error) {
  console.error(error);
  res.status(500).json({ status: false, message: 'Server error' });
}
};
const verifyForgotOtp = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const emailLower = email.toLowerCase();
    const userVerification = await UserVerification.findOne({ email: emailLower });
    if (!userVerification) {
      return res.status(400).json({ status: false, message: 'Invalid or expired OTP request' });
    }

    if (userVerification.otp !== otp) {
      return res.status(400).json({ status: false, message: 'Invalid OTP' });
    }

    let user = await Student.findOne({ email: emailLower });
    let collection = Student;
    if (!user) {
      user = await Instructor.findOne({ email: emailLower });
      collection = Instructor;
    }
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await collection.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    await UserVerification.deleteOne({ email: emailLower });

    res.json({ status: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};
const resendForgotOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const emailLower = email.toLowerCase();
    const userVerification = await UserVerification.findOne({ email: emailLower });
    if (!userVerification) {
      return res.status(400).json({ status: false, message: 'No forgot password OTP request found for this email' });
    }

    // Check OTP attempts
    if (userVerification.otpAttempts >= 2) {
      return res.status(429).json({ status: false, message: 'Maximum OTP attempts reached (2)' });
    }

    const otp = generateOTP();
    userVerification.otp = otp;
    userVerification.otpAttempts += 1;
    await userVerification.save();

    await sendMail(emailLower,'Your New OTP for Password Reset',otp);

    res.json({ status: true, message: 'Forgot password OTP resent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

module.exports = { 
  registerUser, 
  verifyOtp, 
  resendOtp, 
  loginUser, 
  logoutUser,
  forgotPassword, 
  verifyForgotOtp, 
  resendForgotOtp 
};
