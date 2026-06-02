const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const companyMiddleware = require("../../Middleware/companyMiddleware");
const checkPermission = require("../../Middleware/checkPermission"); 

const {
  getLeavePolicies,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy,
} = require("../../Controllers/Leave/leavePolicyController");

router.get("/", auth, companyMiddleware, getLeavePolicies); 
// CHANGED "leave" to "leave_policies"
router.post("/", auth, companyMiddleware, checkPermission("leave_policies", "create"), createLeavePolicy);
router.put("/:id", auth, companyMiddleware, checkPermission("leave_policies", "edit"), updateLeavePolicy);
router.delete("/:id", auth, companyMiddleware, checkPermission("leave_policies", "delete"), deleteLeavePolicy);

module.exports = router;