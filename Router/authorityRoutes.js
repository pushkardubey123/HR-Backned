const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { setPermission, getEmployeePermissions } = require("../Controllers/authorityController");

router.post("/set", auth, attachCompanyId, checkSubscription, setPermission); 
router.get("/:employeeId", auth, attachCompanyId, checkSubscription, getEmployeePermissions); 

module.exports = router;