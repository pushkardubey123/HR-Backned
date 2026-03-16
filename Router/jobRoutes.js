const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId= require("../Middleware/companyMiddleware")
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  addJob, getJobs, getJobById, updateJob, deleteJob, getPublicJobs,
} = require("../Controllers/jobController");

// MANAGEMENT (Requires 'recruitment' permission)
router.post("/", auth, attachCompanyId, checkPermission("recruitment", "create"), addJob);
router.get("/", auth, attachCompanyId, checkPermission("recruitment", "view"), getJobs);
router.put("/:id", auth, attachCompanyId, checkPermission("recruitment", "edit"), updateJob);
router.delete("/:id", auth, attachCompanyId, checkPermission("recruitment", "delete"), deleteJob);

// PUBLIC
router.get("/public/list", getPublicJobs);
router.get("/:id", getJobById);

module.exports = router;