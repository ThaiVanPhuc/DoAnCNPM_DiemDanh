const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/:id", authMiddleware, userController.getUserByUserId);
router.put("/:id", authMiddleware, userController.updateUserByUserId);

// POST, PUT, DELETE → chỉ ADMIN hoặc TEACHER
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER"]),
  userController.createUser
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER"]),
  userController.deleteUserByUserId
);

router.post(
  "/:userId/shifts",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER"]),
  userController.assignShiftToUser
);

module.exports = router;
