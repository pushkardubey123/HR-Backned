const router = require("express").Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const { saveTiming, getTiming } = require("../Controllers/officeTimingController");

router.get("/timing", auth, attachCompanyId, checkSubscription, getTiming); 
router.post("/timing", auth, attachCompanyId, checkSubscription, checkPermission("attendance", "edit"), saveTiming);

module.exports = router;