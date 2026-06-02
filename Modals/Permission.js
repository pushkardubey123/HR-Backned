const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // CHANGED: designationId ki jagah employeeId
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  module: {
    type: String,
    required: true
  },
  permissions: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Ensure one employee has one permission record per module
permissionSchema.index({ companyId: 1, employeeId: 1, module: 1 }, { unique: true });

module.exports = mongoose.model("Permission", permissionSchema);