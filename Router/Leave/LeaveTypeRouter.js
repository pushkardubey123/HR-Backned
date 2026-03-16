const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const attachCompanyContext = require("../../Middleware/companyMiddleware");
const checkPermission = require("../../Middleware/checkPermission"); 

const { getLeaveTypes, createLeaveType, deleteLeaveType, updateLeaveType } = require("../../Controllers/Leave/LeaveTypeController");

router.get("/", auth, attachCompanyContext, getLeaveTypes);
// CHANGED "leave" to "leave_types"
router.post("/", auth, attachCompanyContext, checkPermission("leave_types", "create"), createLeaveType);
router.put("/:id", auth, attachCompanyContext, checkPermission("leave_types", "edit"), updateLeaveType);
router.delete("/:id", auth, attachCompanyContext, checkPermission("leave_types", "delete"), deleteLeaveType);

module.exports = router;