const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  scheduleInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../Controllers/InterviewController");

// MANAGEMENT (Require 'recruitment' permissions)
router.post("/schedule", auth, attachCompanyId, checkPermission("recruitment", "create"), scheduleInterview);
router.get("/", auth, attachCompanyId, checkPermission("recruitment", "view"), getAllInterviews);
router.get("/:id", auth, attachCompanyId, checkPermission("recruitment", "view"), getInterviewById);
router.put("/:id", auth, attachCompanyId, checkPermission("recruitment", "edit"), updateInterview);
router.delete("/:id", auth, attachCompanyId, checkPermission("recruitment", "delete"), deleteInterview);

module.exports = router;