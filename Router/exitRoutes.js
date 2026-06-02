const router = require("express").Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { createExitRequest, getAllExitRequests, getExitRequestsByEmployee, updateExitRequestByAdmin, deleteExitRequest } = require("../Controllers/exitController");

// 🟢 SELF SERVICE
router.post("/submit", auth, attachCompanyId, checkSubscription, createExitRequest);
router.get("/my-requests", auth, attachCompanyId, checkSubscription, getExitRequestsByEmployee);

// 🔴 MANAGEMENT
router.get("/", auth, attachCompanyId, checkSubscription, checkPermission("exit", "view"), getAllExitRequests);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("exit", "edit"), updateExitRequestByAdmin);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("exit", "delete"), deleteExitRequest);

module.exports = router;