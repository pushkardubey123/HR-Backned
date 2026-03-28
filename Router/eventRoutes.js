const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyContext = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { createEvent, getAllEvents, updateEvent, deleteEvent, gelOneEvent } = require("../Controllers/eventController");

// 🟢 SELF SERVICE
router.get("/", authMiddleware, attachCompanyContext, checkSubscription, getAllEvents);
router.get("/employee/:id", authMiddleware, attachCompanyContext, checkSubscription, gelOneEvent);

// 🔴 MANAGEMENT
router.post("/create", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("event", "create"), createEvent);
router.put("/:id", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("event", "edit"), updateEvent);
router.delete("/:id", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("event", "delete"), deleteEvent);

module.exports = router;