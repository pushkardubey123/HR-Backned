const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  addShift,
  updateShift,
  deleteShift,
  getAdminShifts,
  getPublicShifts,
} = require("../Controllers/ShiftController");

// CREATE (Requires 'create' permission for 'shift' module)
router.post("/", auth, attachCompanyId, checkPermission("shift", "create"), addShift);

// UPDATE (Requires 'edit' permission for 'shift' module)
router.put("/:id", auth, attachCompanyId, checkPermission("shift", "edit"), updateShift);

// DELETE (Requires 'delete' permission for 'shift' module)
router.delete("/:id", auth, attachCompanyId, checkPermission("shift", "delete"), deleteShift);

// GET (Open to authenticated users)
router.get("/admin", auth, attachCompanyId, getAdminShifts);

// PUBLIC
router.get("/", getPublicShifts);

module.exports = router;