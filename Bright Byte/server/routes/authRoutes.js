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



module.exports = router;