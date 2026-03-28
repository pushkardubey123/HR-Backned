const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { applyWFH, getMyWFH, getAllWFH, updateWFHStatus, adminAssignWFH } = require("../Controllers/workFromHomeController");

router.post("/wfh/apply", auth, attachCompanyId, checkSubscription, applyWFH);
router.get("/wfh/my", auth, attachCompanyId, checkSubscription, getMyWFH);

router.get("/wfh/all", auth, attachCompanyId, checkSubscription, checkPermission("wfh", "view"), getAllWFH);
router.put("/wfh/status/:id", auth, attachCompanyId, checkSubscription, checkPermission("wfh", "edit"), updateWFHStatus);
router.post("/admin/assign-wfh", auth, attachCompanyId, checkSubscription, checkPermission("wfh", "create"), adminAssignWFH);

module.exports = router;