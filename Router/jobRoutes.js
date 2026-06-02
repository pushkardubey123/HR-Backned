const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId= require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { addJob, getJobs, getJobById, updateJob, deleteJob, getPublicJobs } = require("../Controllers/jobController");

// MANAGEMENT
router.post("/", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "create"), addJob);
router.get("/", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "view"), getJobs);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "edit"), updateJob);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("recruitment", "delete"), deleteJob);

// PUBLIC
router.get("/public/list", getPublicJobs);
router.get("/:id", getJobById);

module.exports = router;