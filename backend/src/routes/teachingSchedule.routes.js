const express = require("express");
const router = express.Router();
const controller = require("../controllers/teachingSchedule.controller");

router.get("/", controller.getAllSchedules);
router.post("/", controller.createSchedule);

module.exports = router;
