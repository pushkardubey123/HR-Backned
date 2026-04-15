const mongoose = require("mongoose");

const TicketCategorySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  
  // Kis employee ko ticket default assign hogi is department ki
  defaultAssignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  
  slaHours: { type: Number, default: 24 }, // Expected resolution time
}, { timestamps: true });

// Ek branch ke ek department ka ek hi category setting hoga
TicketCategorySchema.index({ companyId: 1, branchId: 1, departmentId: 1 }, { unique: true });

module.exports = mongoose.model("TicketCategory", TicketCategorySchema);