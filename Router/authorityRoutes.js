const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware"); 

const {
  setPermission,
  getEmployeePermissions // Name change kiya for clarity
} = require("../Controllers/authorityController");

router.post("/set", auth, attachCompanyId, setPermission); 
// ✅ FIXED: yahan :designationId ki jagah :employeeId hona chahiye
router.get("/:employeeId", auth, attachCompanyId, getEmployeePermissions); 

module.exports = router;