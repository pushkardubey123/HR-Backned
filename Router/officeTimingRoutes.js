const router = require("express").Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const { saveTiming, getTiming } = require("../Controllers/officeTimingController");

router.get("/timing", auth, attachCompanyId, getTiming); // Open for attendance logic
router.post("/timing", auth, attachCompanyId, checkPermission("attendance", "edit"), saveTiming);

module.exports = router;