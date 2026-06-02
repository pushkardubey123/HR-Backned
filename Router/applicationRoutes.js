const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { applyJob, getApplications, getApplicationById, rejectApplication, shortlistApplication } = require("../Controllers/applicationController");

// PUBLIC
router.post("/", applyJob);

// MANAGEMENT
router.get("/", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "view"), getApplications);
router.get("/:id", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "view"), getApplicationById);

router.put("/:id/reject", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "edit"), rejectApplication);
router.put("/:id/shortlist", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "edit"), shortlistApplication);

module.exports = router;