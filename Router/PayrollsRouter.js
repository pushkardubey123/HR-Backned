const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  getPayrollByEmployeeId,
  getMyPayrolls
} = require("../Controllers/PayrollController");

// ==========================================
// 🟢 SELF SERVICE
// ==========================================
router.get("/my", auth, attachCompanyId, getMyPayrolls);

// ==========================================
// 🔴 MANAGEMENT ACTIONS (Require 'payroll' permissions)
// ==========================================
router.post("/", auth, attachCompanyId, checkPermission("payroll", "create"), createPayroll);

router.get("/", auth, attachCompanyId, checkPermission("payroll", "view"), getAllPayrolls);
router.get("/employee/:id", auth, attachCompanyId, checkPermission("payroll", "view"), getPayrollByEmployeeId);
router.get("/:id", auth, attachCompanyId, checkPermission("payroll", "view"), getPayrollById);

router.put("/:id", auth, attachCompanyId, checkPermission("payroll", "edit"), updatePayroll);

router.delete("/:id", auth, attachCompanyId, checkPermission("payroll", "delete"), deletePayroll);

module.exports = router;