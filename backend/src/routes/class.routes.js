const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");

router.post("/:classId/shifts", classController.assignShiftToClass);

module.exports = router;
