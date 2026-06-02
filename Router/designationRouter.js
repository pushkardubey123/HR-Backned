const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { addDesignation, getDesignations, updateDesignation, deleteDesignation, getPublicDesignations } = require("../Controllers/desinationController");

router.post("/", auth, attachCompanyId, checkSubscription, checkPermission("designation", "create"), addDesignation);
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("designation", "edit"), updateDesignation);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("designation", "delete"), deleteDesignation);
router.get("/", auth, attachCompanyId, checkSubscription, getDesignations);

// PUBLIC
router.get("/public", getPublicDesignations);

module.exports = router;