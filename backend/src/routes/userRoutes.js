// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, userController.getAllUsers);
router.get("/:id", authMiddleware, userController.getUserByUserId);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER"]),
  userController.createUser
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEACHER"]),
  userController.updateUserByUserId
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  userController.deleteUserByUserId
);

module.exports = router;
