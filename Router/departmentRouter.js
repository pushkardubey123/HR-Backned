const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { addDepartment, getDepartments, updateDepartment, deleteDepartment, getPublicDepartments } = require("../Controllers/departmentController");

router.post("/", auth, attachCompanyId, checkSubscription, checkPermission("department", "create"), addDepartment);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("department", "edit"), updateDepartment);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("department", "delete"), deleteDepartment);
router.get("/", auth, attachCompanyId, checkSubscription, getDepartments);

// PUBLIC
router.get("/public", getPublicDepartments);

module.exports = router;