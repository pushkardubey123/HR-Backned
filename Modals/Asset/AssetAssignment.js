const mongoose = require("mongoose");

const AssetAssignmentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
    issueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null }, 
    status: {
      type: String,
      enum: ["Requested", "Assigned", "Returned", "Rejected"],
      default: "Assigned",
    },
    requestedAssetName: { type: String }, 
    requestedAssetType: { type: String },
    requestedCategory: { type: String },
    isAcknowledged: { type: Boolean, default: false },
    conditionOnIssue: { type: String, default: "Good" },
    conditionOnReturn: { type: String }, 
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssetAssignment", AssetAssignmentSchema);