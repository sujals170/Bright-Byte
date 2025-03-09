const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyOtp, 
  resendOtp, 
  loginUser, 
  forgotPassword, 
  logoutUser, 
  verifyForgotOtp, 
  resendForgotOtp,
} = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authMiddleware } = require('../middleware/auth');
const { 
  registerSchema, 
  otpVerifySchema, 
  resendOtpSchema, 
  loginSchema, 
  forgotSchema, 
  verifyForgotOtpSchema,
  resendForgotOtpSchema
} = require('../validations/authValidation');

try{
  router.post('/register', validate(registerSchema), registerUser);
  router.post('/otp-verify', validate(otpVerifySchema), verifyOtp);
  router.post('/resend-otp', validate(resendOtpSchema), resendOtp);
  router.post('/login', validate(loginSchema), loginUser);
  router.post('/logout',  logoutUser);
  router.post('/forgot', validate(forgotSchema), forgotPassword);
  router.post('/verify-forgot-otp', validate(verifyForgotOtpSchema), verifyForgotOtp);
  router.post('/resend-forgot-otp', validate(resendForgotOtpSchema), resendForgotOtp);
  
  
  router.get('/student-dashboard', authMiddleware, (req, res) => {
    res.json({ status: true, message: 'Welcome to student dashboard', user: req.user });
  });
  
  router.get('/instructor-dashboard', authMiddleware, (req, res) => {
    res.json({ status: true, message: 'Welcome to instructor dashboard', user: req.user });
  });
}catch(error){
  console.log(error.message);
}

router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let user;
    if (req.user.userType === "student") {
      user = await Student.findById(userId).select("email username firstName lastName");
    } else if (req.user.userType === "instructor") {
      user = await Instructor.findById(userId).select("email username firstName lastName");
    }
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    res.json({
      status: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: req.user.userType, // Match frontend expectation
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;