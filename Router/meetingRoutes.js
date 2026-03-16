const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyContext = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added
const { createMeeting, getAllMeetings, updateMeeting, deleteMeeting } = require("../Controllers/meetingController");

// 🟢 SELF SERVICE (Employees viewing their meetings)
router.get("/all", authMiddleware, attachCompanyContext, getAllMeetings);

// 🔴 MANAGEMENT (Require 'meeting' permissions)
router.post("/create", authMiddleware, attachCompanyContext, checkPermission("meeting", "create"), createMeeting);
router.put("/update/:id", authMiddleware, attachCompanyContext, checkPermission("meeting", "edit"), updateMeeting);
router.delete("/delete/:id", authMiddleware, attachCompanyContext, checkPermission("meeting", "delete"), deleteMeeting);

module.exports = router;