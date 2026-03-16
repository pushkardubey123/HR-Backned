const express = require("express");
const router = express.Router();
const leadController = require("../Controllers/leadController");
const verifyToken = require("../Middleware/auth");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

// Protect with 'lms' module permission
router.post("/create", verifyToken, checkPermission("lms", "create"), leadController.createLead);
router.post("/auto", leadController.autoCreateLead); // Public/Webhook
router.get("/", verifyToken, checkPermission("lms", "view"), leadController.getAllLeads);
router.post("/activity", verifyToken, checkPermission("lms", "edit"), leadController.addLeadActivity);
router.post("/convert/:id", verifyToken, checkPermission("lms", "edit"), leadController.convertLeadToProject);
router.put("/status", verifyToken, checkPermission("lms", "edit"), leadController.updateLeadStatus);
router.get("/activity/:leadId", verifyToken, checkPermission("lms", "view"), async (req, res) => {
  const data = await LeadActivity.find({ leadId: req.params.leadId }).populate("employeeId", "name");
  res.json({ success: true, data });
});

module.exports = router;