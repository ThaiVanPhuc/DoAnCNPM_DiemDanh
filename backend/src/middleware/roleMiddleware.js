// src/middleware/roleMiddleware.js
module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Bạn không có quyền truy cập chức năng này",
        required: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};