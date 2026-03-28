const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { createPayroll, getAllPayrolls, getPayrollById, updatePayroll, deletePayroll, getPayrollByEmployeeId, getMyPayrolls } = require("../Controllers/PayrollController");

router.get("/my", auth, attachCompanyId, checkSubscription, getMyPayrolls);
router.post("/", auth, attachCompanyId, checkSubscription, checkPermission("payroll", "create"), createPayroll);
router.get("/", auth, attachCompanyId, checkSubscription, checkPermission("payroll", "view"), getAllPayrolls);
router.get("/employee/:id", auth, attachCompanyId, checkSubscription, checkPermission("payroll", "view"), getPayrollByEmployeeId);
router.get("/:id", auth, attachCompanyId, checkSubscription, checkPermission("payroll", "view"), getPayrollById);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("payroll", "edit"), updatePayroll);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("payroll", "delete"), deletePayroll);

module.exports = router;