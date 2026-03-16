const router = require("express").Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  createExitRequest,
  getAllExitRequests,
  getExitRequestsByEmployee,
  updateExitRequestByAdmin,
  deleteExitRequest,
} = require("../Controllers/exitController");

// 🟢 SELF SERVICE (Employees applying for exit)
router.post("/submit", auth, attachCompanyId, createExitRequest);
router.get("/my-requests", auth, attachCompanyId, getExitRequestsByEmployee);

// 🔴 MANAGEMENT (Require 'exit' permissions)
router.get("/", auth, attachCompanyId, checkPermission("exit", "view"), getAllExitRequests);
router.put("/:id", auth, attachCompanyId, checkPermission("exit", "edit"), updateExitRequestByAdmin);
router.delete("/:id", auth, attachCompanyId, checkPermission("exit", "delete"), deleteExitRequest);

module.exports = router;