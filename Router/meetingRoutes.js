const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyContext = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { createMeeting, getAllMeetings, updateMeeting, deleteMeeting } = require("../Controllers/meetingController");

router.get("/all", authMiddleware, attachCompanyContext, checkSubscription, getAllMeetings);
router.post("/create", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("meeting", "create"), createMeeting);
router.put("/update/:id", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("meeting", "edit"), updateMeeting);
router.delete("/delete/:id", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("meeting", "delete"), deleteMeeting);

module.exports = router;