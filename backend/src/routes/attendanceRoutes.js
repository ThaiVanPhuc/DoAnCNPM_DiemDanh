const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/history', authMiddleware, rbac(['admin', 'teacher']), attendanceController.getHistory);
router.get('/statistics', authMiddleware, rbac(['admin', 'teacher']), attendanceController.getStatistics);
router.get('/export/pdf', authMiddleware, rbac(['admin', 'teacher']), attendanceController.exportToPDF);
router.get('/export/excel', authMiddleware, rbac(['admin', 'teacher']), attendanceController.exportToExcel);

module.exports = router;