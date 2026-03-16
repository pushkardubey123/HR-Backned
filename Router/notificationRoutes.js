const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  getMyNotifications,
  markAsRead,
  sendCustomNotification,
  getAdminAlerts,
  deleteNotification,
  getAllNotification,
  getEmployeeNotifications,
  clearBellNotifications,
} = require("../Controllers/notificationController");

// 🟢 SELF SERVICE (Manage own notifications)
router.get("/", verifyToken, companyMiddleware, getMyNotifications);
router.put("/:id/read", verifyToken, companyMiddleware, markAsRead);
router.put("/clear-bell", verifyToken, companyMiddleware, clearBellNotifications);

// 🔴 MANAGEMENT (Require 'notification' permissions)
router.post("/send", verifyToken, companyMiddleware, checkPermission("notification", "create"), sendCustomNotification);
router.get("/all", verifyToken, companyMiddleware, checkPermission("notification", "view"), getAllNotification);
router.get("/admin-alerts", verifyToken, companyMiddleware, checkPermission("notification", "view"), getAdminAlerts);
router.get("/employee/:employeeId", verifyToken, companyMiddleware, checkPermission("notification", "view"), getEmployeeNotifications);
router.delete("/:id", verifyToken, companyMiddleware, checkPermission("notification", "delete"), deleteNotification);

module.exports = router;