const mongoose = require("mongoose");

const MasterEnquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNo: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ["Pending", "Contacted"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("MasterEnquiry", MasterEnquirySchema);