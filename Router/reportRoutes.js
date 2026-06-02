const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require('../Middleware/companyMiddleware');
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { generateDynamicReport, getReports, getDashboardAnalytics } = require("../Controllers/reportController");

router.post("/generate", auth, attachCompanyId, checkSubscription, checkPermission("reports", "view"), generateDynamicReport);
router.get("/stream", generateDynamicReport); 
router.get("/dashboard", auth, attachCompanyId, checkSubscription, checkPermission("reports", "view"), getDashboardAnalytics);

module.exports = router;