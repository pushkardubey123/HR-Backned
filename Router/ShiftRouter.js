const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { addShift, updateShift, deleteShift, getAdminShifts, getPublicShifts } = require("../Controllers/ShiftController");

router.post("/", auth, attachCompanyId, checkSubscription, checkPermission("shift", "create"), addShift);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("shift", "edit"), updateShift);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("shift", "delete"), deleteShift);
router.get("/admin", auth, attachCompanyId, checkSubscription, getAdminShifts);

router.get("/", getPublicShifts); // PUBLIC

module.exports = router;