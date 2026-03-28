const express = require("express");
const router = express.Router();
const Branch = require("../Modals/Branch");
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Subscription Guard

// CREATE BRANCH (WITH STRICT LIMIT CHECK)
router.post("/branch/create", auth, attachCompanyId, checkSubscription, checkPermission("branch", "create"), async (req, res) => {
  try {
    // 🔥 STRICT LIMIT CHECK LOGIC 🔥
    const maxBranches = req.planLimits?.maxBranches ?? 0;
    
    if (maxBranches !== -1) { // -1 means unlimited
      const currentBranchCount = await Branch.countDocuments({ companyId: req.companyId });
      
      if (maxBranches === 0 || currentBranchCount >= maxBranches) {
        return res.status(403).json({ 
          success: false, 
          message: `Plan Limit Reached! Your current plan allows a maximum of ${maxBranches} branches. Please upgrade your plan.` 
        });
      }
    }

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

// GET BRANCHES 
router.get("/branch", auth, attachCompanyId, checkSubscription, async (req, res) => {
  try {
    const branches = await Branch.find({ companyId: req.companyId });
    res.json({ success: true, data: branches });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching branches" });
  }
});

// UPDATE BRANCH 
router.put("/branch/update/:id", auth, attachCompanyId, checkSubscription, checkPermission("branch", "edit"), async (req, res) => {
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

// DELETE BRANCH 
router.delete("/branch/delete/:id", auth, attachCompanyId, checkSubscription, checkPermission("branch", "delete"), async (req, res) => {
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