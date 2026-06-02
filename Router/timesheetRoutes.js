const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { getTimesheetReport, getEmployeeTimesheet } = require("../Controllers/timesheetController");

router.get("/all", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "view"), getTimesheetReport);
router.get("/employee/:id", auth, attachCompanyId, checkSubscription, getEmployeeTimesheet);

module.exports = router;