const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Ai cũng xem được danh sách user (có thể giới hạn sau)
router.get('/', authMiddleware, userController.getAllUsers);

// Xem chi tiết user theo userId (số thứ tự)
router.get('/:id', authMiddleware, userController.getUserByUserId);

// ADMIN + TEACHER: tạo user mới (tạo học sinh, giáo viên)
router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'TEACHER']), userController.createUser);

// ADMIN + TEACHER: sửa user
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'TEACHER']), userController.updateUserByUserId);

// Chỉ ADMIN mới xóa user
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), userController.deleteUserByUserId);

module.exports = router;