const Document = require("../Modals/Document");
const User = require("../Modals/User");
const CompanySubscription = require("../Modals/SuperAdmin/CompanySubscription"); // ✅ NAYA
const path = require("path");
const fs = require("fs");
const deleteFile = require("../utils/deleteFile");

// Max file size for Documents (e.g., 5MB)
const MAX_DOC_SIZE = 5 * 1024 * 1024; 

exports.uploadDocument = async (req, res) => {
  try {
    const { employeeId, documentType } = req.body;

    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const employee = await User.findOne({ _id: employeeId, companyId: req.companyId });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const file = req.files.file;
    
    // ✅ STATIC LIMIT CHECK (5MB)
    if (file.size > MAX_DOC_SIZE) {
       return res.status(400).json({ success: false, message: "Document size must be less than 5MB" });
    }

    const filename = Date.now() + "_" + file.name;
    const uploadPath = path.join(__dirname, "..", "uploads", "documents");

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    await file.mv(path.join(uploadPath, filename));

    const newDoc = new Document({
      companyId: req.companyId,
      branchId: employee.branchId,
      employeeId,
      documentType,
      fileUrl: `documents/${filename}`,
      uploadedBy: req.user._id,
    });

    await newDoc.save();

    // 🔥 ADD STORAGE TO DATABASE 🔥
    const incomingMB = file.size / (1024 * 1024);
    await CompanySubscription.findOneAndUpdate(
      { companyId: req.companyId },
      { $inc: { "usage.storageUsedMB": incomingMB } } 
    );

    res.status(201).json({ success: true, message: "Document uploaded successfully", data: newDoc });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const docs = await Document.find({ employeeId, companyId: req.companyId })
      .populate("uploadedBy", "name")
      .populate("employeeId", "name email")
      .populate("branchId", "name")
      .sort({ uploadedAt: -1 });

    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    // 🔥 GET FILE SIZE BEFORE DELETING 🔥
    const filePath = path.join(__dirname, "..", "uploads", doc.fileUrl);
    let sizeToMinusMB = 0;
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      sizeToMinusMB = stats.size / (1024 * 1024); 
    }

    deleteFile(doc.fileUrl);
    await doc.deleteOne();

    // 🔥 MINUS STORAGE FROM DATABASE 🔥
    if (sizeToMinusMB > 0) {
      await CompanySubscription.findOneAndUpdate(
        { companyId: req.companyId },
        { $inc: { "usage.storageUsedMB": -sizeToMinusMB } }
      );
    }

    res.status(200).json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editDocumentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    const updated = await Document.findByIdAndUpdate(id, { documentType }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Document not found" });
    res.status(200).json({ success: true, message: "Document updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};