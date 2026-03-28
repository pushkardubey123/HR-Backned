const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission");
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { getMyNotifications, markAsRead, sendCustomNotification, getAdminAlerts, deleteNotification, getAllNotification, getEmployeeNotifications, clearBellNotifications } = require("../Controllers/notificationController");

router.get("/", verifyToken, companyMiddleware, checkSubscription, getMyNotifications);
router.put("/:id/read", verifyToken, companyMiddleware, checkSubscription, markAsRead);
router.put("/clear-bell", verifyToken, companyMiddleware, checkSubscription, clearBellNotifications);

router.post("/send", verifyToken, companyMiddleware, checkSubscription, checkPermission("notification", "create"), sendCustomNotification);
router.get("/all", verifyToken, companyMiddleware, checkSubscription, checkPermission("notification", "view"), getAllNotification);
router.get("/admin-alerts", verifyToken, companyMiddleware, checkSubscription, checkPermission("notification", "view"), getAdminAlerts);
router.get("/employee/:employeeId", verifyToken, companyMiddleware, checkSubscription, getEmployeeNotifications);
router.delete("/:id", verifyToken, companyMiddleware, checkSubscription, checkPermission("notification", "delete"), deleteNotification);

module.exports = router;