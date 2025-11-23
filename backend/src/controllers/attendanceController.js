const Attendance = require("../models/Attendance");
const Class = require("../models/Class");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const moment = require("moment");

const buildDateFilter = (period) => {
  const now = moment();
  switch (period) {
    case "day":
      return {
        $gte: now.startOf("day").toDate(),
        $lte: now.endOf("day").toDate(),
      };
    case "week":
      return {
        $gte: now.startOf("week").toDate(),
        $lte: now.endOf("week").toDate(),
      };
    case "month":
      return {
        $gte: now.startOf("month").toDate(),
        $lte: now.endOf("month").toDate(),
      };
    default:
      return {};
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { period, classId, userId, startDate, endDate } = req.query;
    let filter = {};

    if (userId) filter.student = userId;
    if (classId) {
      const classObj = await Class.findById(classId);
      if (classObj) filter.student = { $in: classObj.students };
    }
    if (startDate && endDate) {
      filter.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (period) {
      filter.timestamp = buildDateFilter(period);
    }

    const history = await Attendance.find(filter)
      .populate("student", "name studentId")
      .populate("session", "name date");

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { classId, period } = req.query;
    let match = {};

    if (classId) {
      const classObj = await Class.findById(classId);
      if (classObj) match.student = { $in: classObj.students };
    }
    if (period) match.timestamp = buildDateFilter(period);

    const stats = await Attendance.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0) || 1;
    const present = stats.find((s) => s._id === "present")?.count || 0;
    const rate = ((present / total) * 100).toFixed(2);

    res.json({ stats, presentRate: rate + "%" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportToPDF = async (req, res) => {
  try {
    const history = await Attendance.find().populate("student session");
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_report.pdf"
    );
    doc.pipe(res);

    doc.fontSize(20).text("BÁO CÁO ĐIỂM DANH", { align: "center" });
    doc.moveDown();

    history.forEach((item, i) => {
      doc
        .fontSize(12)
        .text(
          `${i + 1}. ${
            item.student?.name || "N/A"
          } - ${item.status.toUpperCase()} - ${new Date(
            item.timestamp
          ).toLocaleString()}`
        );
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportToExcel = async (req, res) => {
  try {
    const history = await Attendance.find().populate("student session");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Điểm danh");

    sheet.addRow(["STT", "Sinh viên", "Buổi học", "Trạng thái", "Thời gian"]);
    history.forEach((item, i) => {
      sheet.addRow([
        i + 1,
        item.student?.name || "N/A",
        item.session?.name || "N/A",
        item.status,
        new Date(item.timestamp).toLocaleString("vi-VN"),
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_report.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
