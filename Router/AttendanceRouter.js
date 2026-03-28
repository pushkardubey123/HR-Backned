const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const {
  markAttendance, markSession, getAllAttendance, getAttendanceByEmployee,
  updateAttendance, deleteAttendance, bulkMarkAttendance, getMonthlyAttendance,
  adminApproveAction, syncPastAttendance, removeDuplicates
} = require("../Controllers/AttendanceController");

// 🟢 SELF SERVICE
router.post("/mark", auth, attachCompanyId, checkSubscription, markAttendance);
router.post("/session", auth, attachCompanyId, checkSubscription, markSession);
router.get("/employee/:id", auth, attachCompanyId, checkSubscription, getAttendanceByEmployee);

// 🔴 MANAGEMENT ACTIONS
router.get("/", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "view"), getAllAttendance);
router.get("/monthly", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "view"), getMonthlyAttendance);

router.post("/bulk", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "create"), bulkMarkAttendance);
router.post("/sync", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "create"), syncPastAttendance);
router.put("/approve-action", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "edit"), adminApproveAction);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "edit"), updateAttendance);
router.delete("/remove-duplicates", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "delete"), removeDuplicates);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "delete"), deleteAttendance);

module.exports = router;