const jwt = require('jsonwebtoken');

// Middleware นี้จะพยายามหา User แต่ถ้าไม่มีก็ไม่เป็นไร (ไม่เด้ง Error)
exports.optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token ผิดก็ช่างมัน ให้เป็น Guest ต่อไป
    }
  }
  next();
};