const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const attachCompanyContext = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission");

const {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave,
  getLeavesByEmployee,
  getLeaveReport,
} = require("../Controllers/LeaveController");

const { 
  getMyLeaveBalance, 
  getLeaveBalanceByEmployeeId, 
  adjustLeaveBalance, 
  runCarryForward
} = require("../Controllers/Leave/LeaveBalanceController");
const applyMonthlyAccrual = require("../Service/applyMonthlyAccrual");

// ==========================================
// 1. STATIC ROUTES (Inko hamesha upar rakhna hai)
// ==========================================
router.post("/", authMiddleware, attachCompanyContext, createLeave);
router.get("/", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "view"), getAllLeaves);

// ✅ /report ko /:id se UPAR rakha gaya hai
router.get("/report", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "view"), getLeaveReport);

router.get("/balance/my-balance", authMiddleware, attachCompanyContext, getMyLeaveBalance);
router.put("/balance/adjust", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "edit"), adjustLeaveBalance);
router.post("/carry-forward", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "edit"), runCarryForward);
router.post("/apply-monthly-accrual", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "edit"), async (req, res) => {
  try {
    const { leaveTypeId } = req.body; 
    await applyMonthlyAccrual(req.companyId, leaveTypeId);
    res.json({ success: true, message: "Monthly accrual applied successfully" });
  } catch (err) {
    console.error("Monthly Accrual Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ==========================================
// 2. DYNAMIC ROUTES WITH PREFIX (Inko static ke neeche rakhein)
// ==========================================
router.get("/employee/:id", authMiddleware, attachCompanyContext, getLeavesByEmployee);
router.get("/balance/employee/:employeeId", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "view"), getLeaveBalanceByEmployeeId);


// ==========================================
// 3. PURE DYNAMIC ROUTES (/:id) - Ye hamesha SABSE AAKHIRI me honge
// ==========================================
router.get("/:id", authMiddleware, attachCompanyContext, getLeaveById);
router.put("/:id", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "edit"), updateLeaveStatus);
router.delete("/:id", authMiddleware, attachCompanyContext, checkPermission("leave_requests", "delete"), deleteLeave);

module.exports = router;