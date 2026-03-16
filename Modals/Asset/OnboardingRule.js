const mongoose = require("mongoose");

const OnboardingRuleSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assetName: { type: String, required: true }, 
    assetType: { type: String, enum: ["Unique", "Bulk"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnboardingRule", OnboardingRuleSchema);