const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  applyWFH, getMyWFH, getAllWFH, updateWFHStatus, adminAssignWFH,
} = require("../Controllers/workFromHomeController");

// 🟢 SELF SERVICE
router.post("/wfh/apply", auth, attachCompanyId, applyWFH);
router.get("/wfh/my", auth, attachCompanyId, getMyWFH);

// 🔴 MANAGEMENT (Requires 'wfh' permission)
router.get("/wfh/all", auth, attachCompanyId, checkPermission("wfh", "view"), getAllWFH);
router.put("/wfh/status/:id", auth, attachCompanyId, checkPermission("wfh", "edit"), updateWFHStatus);
router.post("/admin/assign-wfh", auth, attachCompanyId, checkPermission("wfh", "create"), adminAssignWFH);

module.exports = router;