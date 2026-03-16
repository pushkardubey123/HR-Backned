const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added

const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  editDocumentType,
} = require("../Controllers/documentController");

// 🟢 SELF SERVICE (Upload and view own documents)
router.post("/upload", auth, attachCompanyId, uploadDocument);
router.get("/:employeeId", auth, attachCompanyId, getDocuments);

// 🔴 MANAGEMENT (Edit/Delete requires 'document' permissions)
router.put("/:id", auth, attachCompanyId, checkPermission("document", "edit"), editDocumentType);
router.delete("/:id", auth, attachCompanyId, checkPermission("document", "delete"), deleteDocument);

module.exports = router;