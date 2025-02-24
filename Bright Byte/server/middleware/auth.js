const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Read from cookie

  if (!token) {
    return res.status(401).json({ status: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (id, userType) to req.user
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: false, message: 'Token is not valid' });
  }
};

module.exports = {authMiddleware};