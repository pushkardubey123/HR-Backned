const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  addDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  getPublicDepartments
} = require("../Controllers/departmentController");

// CREATE (Requires 'create' permission for 'department' module)
router.post("/", auth, attachCompanyId, checkPermission("department", "create"), addDepartment);

// UPDATE (Requires 'edit' permission for 'department' module)
router.put("/:id", auth, attachCompanyId, checkPermission("department", "edit"), updateDepartment);

// DELETE (Requires 'delete' permission for 'department' module)
router.delete("/:id", auth, attachCompanyId, checkPermission("department", "delete"), deleteDepartment);

// GET (Open to all authenticated users for UI Dropdowns)
router.get("/", auth, attachCompanyId, getDepartments);

// PUBLIC (For Registration)
router.get("/public", getPublicDepartments);

module.exports = router;