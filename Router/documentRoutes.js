const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added

const { uploadDocument, getDocuments, deleteDocument, editDocumentType } = require("../Controllers/documentController");

// 🟢 SELF SERVICE
router.post("/upload", auth, attachCompanyId, checkSubscription, uploadDocument);
router.get("/:employeeId", auth, attachCompanyId, checkSubscription, getDocuments);

// 🔴 MANAGEMENT
router.put("/:id", auth, attachCompanyId, checkSubscription, checkPermission("document", "edit"), editDocumentType);
router.delete("/:id", auth, attachCompanyId, checkSubscription, checkPermission("document", "delete"), deleteDocument);

module.exports = router;