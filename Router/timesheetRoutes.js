const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const { getTimesheetReport, getEmployeeTimesheet } = require("../Controllers/timesheetController");

// ADMIN (Requires 'attendance' permission)
router.get("/all", auth, attachCompanyId, checkPermission("attendance", "view"), getTimesheetReport);

// EMPLOYEE / SELF SERVICE
router.get("/employee/:id", auth, attachCompanyId, getEmployeeTimesheet);

module.exports = router;