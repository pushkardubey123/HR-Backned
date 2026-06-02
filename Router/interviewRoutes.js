const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { scheduleInterview, getAllInterviews, getInterviewById, updateInterview, deleteInterview } = require("../Controllers/InterviewController");

// MANAGEMENT
router.post("/schedule", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "create"), scheduleInterview);
router.get("/", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "view"), getAllInterviews);
router.get("/:id", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "view"), getInterviewById);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "edit"), updateInterview);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "delete"), deleteInterview);

module.exports = router;