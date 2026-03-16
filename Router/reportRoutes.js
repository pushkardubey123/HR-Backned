const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require('../Middleware/companyMiddleware');
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const { generateDynamicReport, getReports, getDashboardAnalytics } = require("../Controllers/reportController");

// Require 'reports' permission
router.post("/generate", auth, checkPermission("reports", "view"), generateDynamicReport);
router.get("/stream", generateDynamicReport); // Keep open if used for downloading streams
router.get("/dashboard", auth, attachCompanyId, checkPermission("reports", "view"), getDashboardAnalytics);

module.exports = router;