const express = require("express");
const router = express.Router();
const Branch = require("../Modals/Branch");
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

// CREATE BRANCH (Requires 'create' permission for 'branch' module)
router.post("/branch/create", auth, attachCompanyId, checkPermission("branch", "create"), async (req, res) => {
  try {
    const branch = await Branch.create({
      ...req.body,
      companyId: req.companyId, 
    });
    res.json({ success: true, message: "Branch Created Successfully", data: branch });
  } catch (err) {
    console.error("Create Branch Error:", err);
    res.json({
      success: false,
      message: err.code === 11000 ? "Branch with this name already exists!" : "Error saving to database: " + err.message,
    });
  }
});

// GET BRANCHES (Open to all authenticated users for dropdowns)
router.get("/branch", auth, attachCompanyId, async (req, res) => {
  try {
    const branches = await Branch.find({ companyId: req.companyId });
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching branches" });
  }
});

// UPDATE BRANCH (Requires 'edit' permission for 'branch' module)
router.put("/branch/update/:id", auth, attachCompanyId, checkPermission("branch", "edit"), async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    );
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found or unauthorized" });
    res.json({ success: true, message: "Branch updated successfully", data: branch });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update branch" });
  }
});

// DELETE BRANCH (Requires 'delete' permission for 'branch' module)
router.delete("/branch/delete/:id", auth, attachCompanyId, checkPermission("branch", "delete"), async (req, res) => {
  try {
    const branch = await Branch.findOneAndDelete({
      _id: req.params.id,
      companyId: req.companyId,
    });
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found or unauthorized" });
    res.json({ success: true, message: "Branch deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete branch" });
  }
});

// PUBLIC (For Registration Page)
router.get("/public/branches/:companyId", async (req, res) => {
  try {
    const branches = await Branch.find({ companyId: req.params.companyId }).select("name");
    res.json({ success: true, data: branches });
  } catch {
    res.json({ success: false, message: "Failed to fetch branches" });
  }
});

module.exports = router;