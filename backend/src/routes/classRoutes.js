// src/routes/classRoutes.js
const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, classController.getAllClasses);
router.get("/:id/students", authMiddleware, classController.getStudentsByClass);

const teacherAdmin = roleMiddleware(["ADMIN", "TEACHER"]);

router.post("/", authMiddleware, teacherAdmin, classController.createClass);
router.put("/:id", authMiddleware, teacherAdmin, classController.updateClass);
router.post("/assign", authMiddleware, teacherAdmin, classController.assignUserToClass);

router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), classController.deleteClass);

module.exports = router;