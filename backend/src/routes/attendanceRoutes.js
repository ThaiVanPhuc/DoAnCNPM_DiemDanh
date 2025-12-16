// src/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Chỉ ADMIN/TEACHER ghi điểm danh
router.post('/record', authMiddleware, roleMiddleware(['ADMIN', 'TEACHER']), attendanceController.recordAttendance);

// Xem báo cáo (ADMIN/TEACHER xem toàn bộ, STUDENT xem cá nhân - thêm logic trong controller nếu cần)
router.get('/report', authMiddleware, attendanceController.getAttendanceReport);

// Thống kê cho biểu đồ
router.get('/statistics', authMiddleware, attendanceController.getAttendanceStatistics);

// Xuất file
router.get('/export/pdf', authMiddleware, roleMiddleware(['ADMIN', 'TEACHER']), attendanceController.exportToPDF);
router.get('/export/excel', authMiddleware, roleMiddleware(['ADMIN', 'TEACHER']), attendanceController.exportToExcel);

module.exports = router;