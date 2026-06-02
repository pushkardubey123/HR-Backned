const router = require("express").Router();
const auth = require("../Middleware/auth"); 
const attachCompanyId = require("../Middleware/companyMiddleware"); 
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const {
  createAsset, updateAsset, deleteAsset, getAllAssets, getAllAssignments,
  assignAssetToEmployee, returnAsset, getMyAssets, requestAssetManual,
  createOnboardingRule, deleteOnboardingRule, getOnboardingRules, getAvailableAssetNames
} = require("../Controllers/AssetController");

// Employee Self Service
router.get("/my-assets", auth, attachCompanyId, checkSubscription, getMyAssets);
router.post("/request", auth, attachCompanyId, checkSubscription, requestAssetManual);
router.get("/available-names", auth, attachCompanyId, checkSubscription, getAvailableAssetNames);

// IT Inventory Management
router.post("/inventory", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "create"), createAsset);
router.get("/inventory", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "view"), getAllAssets);
router.put("/inventory/:id", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "edit"), updateAsset);
router.delete("/inventory/:id", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "delete"), deleteAsset);

// Assignments Workflow
router.get("/assignments", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "view"), getAllAssignments);
router.post("/assign", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "edit"), assignAssetToEmployee);
router.post("/return", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "edit"), returnAsset);

// Settings
router.get("/rules", auth, attachCompanyId, checkSubscription, getOnboardingRules);
router.post("/rules", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "create"), createOnboardingRule);
router.delete("/rules/:id", auth, attachCompanyId, checkSubscription, checkPermission("asset_management", "delete"), deleteOnboardingRule);

module.exports = router;