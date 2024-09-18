// middlewares/auth.js
const authMiddleware = (req, res, next) => {
    // Authentication logic
    next();
  };
  
  module.exports = authMiddleware;
  