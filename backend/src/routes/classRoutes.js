const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Ai cũng xem được danh sách lớp và học sinh trong lớp
router.get('/', authMiddleware, classController.getAllClasses);
router.get('/:id/students', authMiddleware, classController.getStudentsByClass);

// Chỉ ADMIN + TEACHER
const teacherAdmin = roleMiddleware(['ADMIN', 'TEACHER']);
router.post('/', authMiddleware, teacherAdmin, classController.createClass);
router.put('/:id', authMiddleware, teacherAdmin, classController.updateClass);
router.post('/assign', authMiddleware, teacherAdmin, classController.assignUserToClass);

// Chỉ ADMIN mới xóa lớp
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), classController.deleteClass);

module.exports = router;