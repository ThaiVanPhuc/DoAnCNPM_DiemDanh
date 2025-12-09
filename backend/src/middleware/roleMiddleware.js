// middleware kiểm tra role
module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    // req.user phải được gán từ authMiddleware (JWT verify)
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    next();
  };
};
