const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyContext = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission");
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const {
  createLeave, getAllLeaves, getLeaveById, updateLeaveStatus,
  deleteLeave, getLeavesByEmployee, getLeaveReport,
} = require("../Controllers/LeaveController");

const { 
  getMyLeaveBalance, getLeaveBalanceByEmployeeId, adjustLeaveBalance, runCarryForward
} = require("../Controllers/Leave/LeaveBalanceController");
const applyMonthlyAccrual = require("../Service/applyMonthlyAccrual");

// 1. STATIC ROUTES
router.post("/", authMiddleware, attachCompanyContext, checkSubscription, createLeave);
router.get("/", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "view"), getAllLeaves);
router.get("/report", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "view"), getLeaveReport);

router.get("/balance/my-balance", authMiddleware, attachCompanyContext, checkSubscription, getMyLeaveBalance);
router.put("/balance/adjust", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "edit"), adjustLeaveBalance);
router.post("/carry-forward", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "edit"), runCarryForward);
router.post("/apply-monthly-accrual", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "edit"), async (req, res) => {
  try {
    const { leaveTypeId } = req.body; 
    await applyMonthlyAccrual(req.companyId, leaveTypeId);
    res.json({ success: true, message: "Monthly accrual applied successfully" });
  } catch (err) {
    console.error("Monthly Accrual Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. DYNAMIC ROUTES WITH PREFIX
router.get("/employee/:id", authMiddleware, attachCompanyContext, checkSubscription, getLeavesByEmployee);
router.get("/balance/employee/:employeeId", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "view"), getLeaveBalanceByEmployeeId);

// 3. PURE DYNAMIC ROUTES (/:id)
router.get("/:id", authMiddleware, attachCompanyContext, checkSubscription, getLeaveById);
router.put("/:id", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "edit"), updateLeaveStatus);
router.delete("/:id", authMiddleware, attachCompanyContext, checkSubscription, checkPermission("leave_requests", "delete"), deleteLeave);

module.exports = router;