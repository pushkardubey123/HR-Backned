const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  applyJob,
  getApplications,
  getApplicationById,
  rejectApplication,
  shortlistApplication,
} = require("../Controllers/applicationController");

// PUBLIC (Any candidate can apply)
router.post("/", applyJob);

// MANAGEMENT (Require 'recruitment' permissions)
router.get("/", auth, attachCompanyId, checkPermission("recruitment", "view"), getApplications);
router.get("/:id", auth, attachCompanyId, checkPermission("recruitment", "view"), getApplicationById);

router.put("/:id/reject", auth, attachCompanyId, checkPermission("recruitment", "edit"), rejectApplication);
router.put("/:id/shortlist", auth, attachCompanyId, checkPermission("recruitment", "edit"), shortlistApplication);

module.exports = router;