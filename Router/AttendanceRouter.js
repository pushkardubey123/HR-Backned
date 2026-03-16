const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  markAttendance,
  markSession,
  getAllAttendance,
  getAttendanceByEmployee,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  getMonthlyAttendance,
  adminApproveAction,
  syncPastAttendance,
  removeDuplicates
} = require("../Controllers/AttendanceController");

// ==========================================
// 🟢 SELF SERVICE (Daily operations by employees)
// ==========================================
router.post("/mark", auth, attachCompanyId, markAttendance);
router.post("/session", auth, attachCompanyId, markSession);
router.get("/employee/:id", auth, attachCompanyId, getAttendanceByEmployee);

// ==========================================
// 🔴 MANAGEMENT ACTIONS (Require 'attendance' permissions)
// ==========================================
// View all attendance records
router.get("/", auth, attachCompanyId, checkPermission("attendance", "view"), getAllAttendance);
router.get("/monthly", auth, attachCompanyId, checkPermission("attendance", "view"), getMonthlyAttendance);

// Create / Edit / Approve Attendance
router.post("/bulk", auth, attachCompanyId, checkPermission("attendance", "create"), bulkMarkAttendance);
router.post("/sync", auth, attachCompanyId, checkPermission("attendance", "create"), syncPastAttendance);
router.put("/approve-action", auth, attachCompanyId, checkPermission("attendance", "edit"), adminApproveAction);
router.put("/:id", auth, attachCompanyId, checkPermission("attendance", "edit"), updateAttendance);

// Delete operations
router.delete("/remove-duplicates", auth, attachCompanyId, checkPermission("attendance", "delete"), removeDuplicates);
router.delete("/:id", auth, attachCompanyId, checkPermission("attendance", "delete"), deleteAttendance);

module.exports = router;