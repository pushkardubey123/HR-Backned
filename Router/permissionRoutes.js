// Router/permissionRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const { getMyModules } = require("../Controllers/permissionController"); // ✅ Controller use karein

router.get("/my-modules", auth, attachCompanyId, getMyModules);

module.exports = router;