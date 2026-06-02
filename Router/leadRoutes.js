const express = require("express");
const router = express.Router();
const leadController = require("../Controllers/leadController");
const verifyToken = require("../Middleware/auth");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

// Protect with 'lms' module permission
router.post("/create", verifyToken, checkSubscription, checkPermission("lms", "create"), leadController.createLead);
router.post("/auto", leadController.autoCreateLead); // Public/Webhook (No checkSubscription)
router.get("/", verifyToken, checkSubscription, checkPermission("lms", "view"), leadController.getAllLeads);
router.post("/activity", verifyToken, checkSubscription, checkPermission("lms", "edit"), leadController.addLeadActivity);
router.post("/convert/:id", verifyToken, checkSubscription, checkPermission("lms", "edit"), leadController.convertLeadToProject);
router.put("/status", verifyToken, checkSubscription, checkPermission("lms", "edit"), leadController.updateLeadStatus);
router.get("/activity/:leadId", verifyToken, checkSubscription, checkPermission("lms", "view"), async (req, res) => {
  const data = await LeadActivity.find({ leadId: req.params.leadId }).populate("employeeId", "name");
  res.json({ success: true, data });
});

module.exports = router;