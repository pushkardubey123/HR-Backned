const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  addDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
  getPublicDesignations,
} = require("../Controllers/desinationController");

// CREATE (Requires 'create' permission for 'designation' module)
router.post("/", auth, attachCompanyId, checkPermission("designation", "create"), addDesignation);

// UPDATE (Requires 'edit' permission for 'designation' module)
router.put("/:id", auth, attachCompanyId, checkPermission("designation", "edit"), updateDesignation);

// DELETE (Requires 'delete' permission for 'designation' module)
router.delete("/:id", auth, attachCompanyId, checkPermission("designation", "delete"), deleteDesignation);

// GET (Open to all authenticated users for UI Dropdowns)
router.get("/", auth, attachCompanyId, getDesignations);

// PUBLIC (For Registration)
router.get("/public", getPublicDesignations);

module.exports = router;