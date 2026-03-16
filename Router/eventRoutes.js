const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyContext = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added
const { createEvent, getAllEvents, updateEvent, deleteEvent, gelOneEvent } = require("../Controllers/eventController");

// 🟢 SELF SERVICE (View Events)
router.get("/", authMiddleware, attachCompanyContext, getAllEvents);
router.get("/employee/:id", authMiddleware, attachCompanyContext, gelOneEvent);

// 🔴 MANAGEMENT (Require 'event' permissions)
router.post("/create", authMiddleware, attachCompanyContext, checkPermission("event", "create"), createEvent);
router.put("/:id", authMiddleware, attachCompanyContext, checkPermission("event", "edit"), updateEvent);
router.delete("/:id", authMiddleware, attachCompanyContext, checkPermission("event", "delete"), deleteEvent);

module.exports = router;