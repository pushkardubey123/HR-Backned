const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { getMyModules } = require("../Controllers/permissionController"); 

router.get("/my-modules", auth, attachCompanyId, checkSubscription, getMyModules);

module.exports = router;