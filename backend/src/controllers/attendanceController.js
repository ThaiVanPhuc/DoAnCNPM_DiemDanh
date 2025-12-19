// src/controllers/attendanceController.js
const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const Class = require('../models/classModel');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Giả định thời gian bắt đầu lớp: 8:00 AM, muộn nếu sau 8:15 AM
const CLASS_START_TIME = moment().set({ hour: 8, minute: 0, second: 0 });
const LATE_THRESHOLD = moment().set({ hour: 8, minute: 15, second: 0 });

// 1. Ghi điểm danh (từ face recognition hoặc manual)
exports.recordAttendance = async (req, res) => {
  try {
    const { userId, classId, timeIn } = req.body; // timeIn: ISO date string

    const user = await User.findById(userId);
    if (!user || user.role !== 'STUDENT') return res.status(400).json({ message: 'Học sinh không tồn tại' });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(400).json({ message: 'Lớp không tồn tại' });

    const today = moment().startOf('day');
    const existing = await Attendance.findOne({ userId, classId, date: { $gte: today.toDate() } });
    if (existing) return res.status(400).json({ message: 'Đã điểm danh hôm nay' });

    const timeInMoment = moment(timeIn || Date.now());
    let status = 'absent';
    if (timeInMoment.isBefore(LATE_THRESHOLD)) status = 'present';
    else if (timeInMoment.isAfter(CLASS_START_TIME)) status = 'late';

    const attendance = new Attendance({
      userId,
      classId,
      date: today.toDate(),
      timeIn: timeInMoment.toDate(),
      status
    });

    await attendance.save();
    res.status(201).json({ message: 'Điểm danh thành công', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 2. Xem lịch sử điểm danh (lọc theo ngày/tuần/tháng, lớp/user)
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, period, classId, userId } = req.query; // period: day/week/month

    let match = {};
    if (userId) match.userId = mongoose.Types.ObjectId(userId);
    if (classId) match.classId = mongoose.Types.ObjectId(classId);

    let groupBy = {};
    if (period === 'day') groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
    else if (period === 'week') groupBy = { $week: '$date' };
    else if (period === 'month') groupBy = { $month: '$date' };

    if (startDate && endDate) {
      match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Attendance.aggregate([
      { $match: match },
      { $group: {
          _id: groupBy ? { period: groupBy } : null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          details: { $push: { userId: '$userId', date: '$date', status: '$status' } }
        }
      },
      { $sort: { '_id.period': 1 } }
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 3. Thống kê chuyên cần (cho biểu đồ: tỷ lệ % present/late/absent)
exports.getAttendanceStatistics = async (req, res) => {
  try {
    const { classId, userId, startDate, endDate } = req.query;

    let match = {};
    if (userId) match.userId = mongoose.Types.ObjectId(userId);
    if (classId) match.classId = mongoose.Types.ObjectId(classId);
    if (startDate && endDate) match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const stats = await Attendance.aggregate([
      { $match: match },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || { total: 0, present: 0, late: 0, absent: 0 };
    result.presentRate = result.total ? (result.present / result.total * 100).toFixed(2) : 0;
    result.lateRate = result.total ? (result.late / result.total * 100).toFixed(2) : 0;
    result.absentRate = result.total ? (result.absent / result.total * 100).toFixed(2) : 0;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 4. Xuất PDF
exports.exportToPDF = async (req, res) => {
  try {
    const { startDate, endDate, classId, userId } = req.query;

    const match = {};
    if (userId) match.userId = mongoose.Types.ObjectId(userId);
    if (classId) match.classId = mongoose.Types.ObjectId(classId);
    if (startDate && endDate) match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const attendances = await Attendance.find(match)
      .populate('userId', 'fullName email')
      .populate('classId', 'className')
      .sort('date');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Báo Cáo Điểm Danh', { align: 'center' });
    doc.moveDown();

    attendances.forEach(att => {
      doc.fontSize(12).text(`Học sinh: ${att.userId.fullName} | Lớp: ${att.classId.className} | Ngày: ${moment(att.date).format('DD/MM/YYYY')} | Trạng thái: ${att.status}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 5. Xuất Excel
exports.exportToExcel = async (req, res) => {
  try {
    const { startDate, endDate, classId, userId } = req.query;

    const match = {};
    if (userId) match.userId = mongoose.Types.ObjectId(userId);
    if (classId) match.classId = mongoose.Types.ObjectId(classId);
    if (startDate && endDate) match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const attendances = await Attendance.find(match)
      .populate('userId', 'fullName email')
      .populate('classId', 'className')
      .sort('date');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BaoCaoDiemDanh');

    sheet.addRow(['ID', 'Học Sinh', 'Email', 'Lớp', 'Ngày', 'Giờ Vào', 'Trạng Thái']);

    attendances.forEach(att => {
      sheet.addRow([
        att.attendanceId,
        att.userId.fullName,
        att.userId.email,
        att.classId.className,
        moment(att.date).format('DD/MM/YYYY'),
        att.timeIn ? moment(att.timeIn).format('HH:mm') : '',
        att.status
      ]);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};